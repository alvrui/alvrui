#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import requests

HISTORY_DIR = Path.home() / ".mistral_mcp_history"
HISTORY_DIR.mkdir(exist_ok=True)

CACHE_FILE = Path.home() / ".mistral_models_cache.json"
CACHE_EXPIRY_SECONDS = 3600


def _fetch_models_from_api(api_key: str | None = None) -> list[str]:
    url = "https://api.mistral.ai/v1/models"
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        models = response.json().get("data", [])
        return [model["id"] for model in models]
    except requests.RequestException as e:
        print(f"Error al obtener modelos de la API: {e}", file=sys.stderr)
        return []


def list_mistral_models(api_key: str | None = None) -> list[str]:
    if CACHE_FILE.exists():
        cache_time = datetime.fromtimestamp(CACHE_FILE.stat().st_mtime)
        if (datetime.now() - cache_time).seconds < CACHE_EXPIRY_SECONDS:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))

    models = _fetch_models_from_api(api_key)
    if models:
        CACHE_FILE.write_text(json.dumps(models, ensure_ascii=False, indent=2), encoding="utf-8")
    return models


def print_available_models(api_key: str | None = None) -> None:
    models = list_mistral_models(api_key)
    if not models:
        print("No se pudieron obtener los modelos.")
        return
    print("--- Modelos disponibles en Mistral AI ---")
    for i, model in enumerate(models, 1):
        print(f"{i}. {model}")


def validate_directory(dir_path: str) -> Path:
    path = Path(dir_path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"El directorio {path} no existe.")
    if not path.is_dir():
        raise NotADirectoryError(f"{path} no es un directorio.")
    if not os.access(path, os.R_OK | os.W_OK):
        raise PermissionError(f"No tienes permisos de lectura/escritura en {path}.")
    return path


def get_history_file(project_dir: Path) -> Path:
    return HISTORY_DIR / f"{project_dir.name}.json"


def load_history(history_file: Path) -> list:
    if not history_file.exists():
        return []
    return json.loads(history_file.read_text(encoding="utf-8"))


def save_history(history_file: Path, history: list) -> None:
    history_file.write_text(json.dumps(history, indent=2, ensure_ascii=False), encoding="utf-8")


def add_to_history(history_file: Path, payload: dict) -> None:
    history = load_history(history_file)
    history.append(payload)
    save_history(history_file, history)


def read_prompt(prompt: str | None, prompt_file: str | None) -> str:
    if prompt and prompt_file:
        raise ValueError("Usa --prompt o --prompt-file, no ambos.")
    if prompt_file:
        path = Path(prompt_file).expanduser().resolve()
        if not path.exists():
            raise FileNotFoundError(f"No existe prompt-file: {path}")
        return path.read_text(encoding="utf-8")
    if prompt:
        return prompt
    raise ValueError("Debes proporcionar --prompt o --prompt-file.")


def run_mistral_vibe_cli(prompt: str, model: str, work_dir: Path, stream: bool = False) -> str:
    cmd = [
        "mistral-vibe-cli",
        "--model", model,
        "--work-dir", str(work_dir),
        "--prompt", prompt,
    ]

    if stream:
        cmd.append("--stream")
        process = subprocess.Popen(
            cmd,
            cwd=work_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        output_lines = []
        assert process.stdout is not None
        for line in process.stdout:
            print(line, end="")
            output_lines.append(line)
        stderr = process.stderr.read() if process.stderr else ""
        code = process.wait()
        if code != 0:
            raise RuntimeError(stderr.strip() or f"mistral-vibe-cli salió con código {code}")
        return "".join(output_lines)

    result = subprocess.run(
        cmd,
        check=True,
        capture_output=True,
        text=True,
        cwd=work_dir,
    )
    return result.stdout


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Adapter de Mistral para middleware v0")
    parser.add_argument("--model", type=str, default=None)
    parser.add_argument("--dir", type=str, default=".")
    parser.add_argument("--prompt", type=str, default=None)
    parser.add_argument("--prompt-file", type=str, default=None)
    parser.add_argument("--stream", action="store_true")
    parser.add_argument("--no-history", action="store_true")
    parser.add_argument("--list-models", action="store_true")
    parser.add_argument("--api-key", type=str, default=None)

    parser.add_argument("--task-id", type=str, default=None)
    parser.add_argument("--output-file", type=str, default=None)
    parser.add_argument("--meta-file", type=str, default=None)
    parser.add_argument("--agent-name", type=str, default="mistral_adapter")

    args = parser.parse_args()

    if args.list_models:
        print_available_models(args.api_key)
        sys.exit(0)

    if not args.model:
        print("Error: Debes especificar --model", file=sys.stderr)
        sys.exit(1)

    try:
        work_dir = validate_directory(args.dir)
        prompt = read_prompt(args.prompt, args.prompt_file)

        started_at = datetime.now().isoformat()
        response = run_mistral_vibe_cli(
            prompt=prompt,
            model=args.model,
            work_dir=work_dir,
            stream=args.stream,
        )
        finished_at = datetime.now().isoformat()

        if args.output_file:
            out_path = Path(args.output_file).expanduser().resolve()
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(response, encoding="utf-8")

        meta = {
            "task_id": args.task_id,
            "agent_name": args.agent_name,
            "model": args.model,
            "work_dir": str(work_dir),
            "started_at": started_at,
            "finished_at": finished_at,
            "prompt_file": args.prompt_file,
            "output_file": args.output_file,
            "status": "ok",
        }

        if args.meta_file:
            write_json(Path(args.meta_file).expanduser().resolve(), meta)

        if not args.no_history:
            history_file = get_history_file(work_dir)
            add_to_history(history_file, {
                "timestamp": finished_at,
                "task_id": args.task_id,
                "agent_name": args.agent_name,
                "model": args.model,
                "prompt": prompt,
                "response": response,
                "output_file": args.output_file,
                "status": "ok",
            })

        if not args.output_file:
            print(response)

    except Exception as e:
        error_meta = {
            "task_id": args.task_id,
            "agent_name": args.agent_name,
            "model": args.model,
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }
        if args.meta_file:
            write_json(Path(args.meta_file).expanduser().resolve(), error_meta)
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
