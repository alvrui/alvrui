#!/usr/bin/env python3
"""
Mistral MCP Connector: Wrapper para mistral-vibe-cli con soporte para:
- Selección de modelo según contexto (código/texto).
- Acceso a directorios específicos.
- Historial de conversaciones por proyecto.
- Streaming de respuestas.
- Validación de directorios.
- Listado de modelos disponibles.

Uso:
    python mistral_connector.py --model mistral-medium --dir ~/proyectos/project-stack --prompt "Refactoriza main.py"
    python mistral_connector.py --list-models
"""

import argparse
import os
import subprocess
import json
import sys
import requests
from pathlib import Path
from datetime import datetime

# --- Configuración ---
HISTORY_DIR = Path.home() / ".mistral_mcp_history"
HISTORY_DIR.mkdir(exist_ok=True)
CACHE_FILE = Path.home() / ".mistral_models_cache.json"
CACHE_EXPIRY_SECONDS = 3600  # 1 hora

# --- Funciones para listar modelos ---
def _fetch_models_from_api(api_key: str = None) -> list:
    """Obtiene modelos directamente de la API de Mistral."""
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


def list_mistral_models(api_key: str = None) -> list:
    """Lista modelos disponibles, usando cache si está vigente."""
    if CACHE_FILE.exists():
        cache_time = datetime.fromtimestamp(CACHE_FILE.stat().st_mtime)
        if (datetime.now() - cache_time).seconds < CACHE_EXPIRY_SECONDS:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)

    models = _fetch_models_from_api(api_key)
    if models:
        with open(CACHE_FILE, "w") as f:
            json.dump(models, f)
    return models


def print_available_models(api_key: str = None) -> None:
    """Imprime los modelos disponibles."""
    models = list_mistral_models(api_key)
    if not models:
        print("No se pudieron obtener los modelos. ¿Tienes configurada la API key o conexión a internet?")
        return
    print("--- Modelos disponibles en Mistral AI ---")
    for i, model in enumerate(models, 1):
        print(f"{i}. {model}")


# --- Funciones para el historial ---
def get_history_file(project_dir: Path) -> Path:
    """Genera el path del archivo de historial para el proyecto."""
    project_name = project_dir.name
    return HISTORY_DIR / f"{project_name}.json"


def load_history(history_file: Path) -> list:
    """Carga el historial de conversaciones."""
    if not history_file.exists():
        return []
    with open(history_file, "r", encoding="utf-8") as f:
        return json.load(f)


def save_history(history_file: Path, history: list) -> None:
    """Guarda el historial de conversaciones."""
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


def add_to_history(history_file: Path, prompt: str, response: str, model: str) -> None:
    """Añade una entrada al historial."""
    history = load_history(history_file)
    entry = {
        "timestamp": datetime.now().isoformat(),
        "model": model,
        "prompt": prompt,
        "response": response,
    }
    history.append(entry)
    save_history(history_file, history)


# --- Funciones para directorios ---
def validate_directory(dir_path: str) -> Path:
    """Valida que el directorio exista y sea accesible."""
    path = Path(dir_path).absolute()
    if not path.exists():
        raise FileNotFoundError(f"El directorio {path} no existe.")
    if not path.is_dir():
        raise NotADirectoryError(f"{path} no es un directorio.")
    if not os.access(path, os.R_OK | os.W_OK):
        raise PermissionError(f"No tienes permisos de lectura/escritura en {path}.")
    return path


# --- Función principal para ejecutar mistral-vibe-cli ---
def run_mistral_vibe_cli(
    prompt: str,
    model: str,
    work_dir: Path,
    stream: bool = False,
) -> str:
    """
    Ejecuta mistral-vibe-cli con los parámetros dados.
    Si stream=True, imprime la respuesta en tiempo real.
    """
    cmd = [
        "mistral-vibe-cli",
        "--model", model,
        "--work-dir", str(work_dir),
        "--prompt", prompt,
    ]
    if stream:
        cmd.append("--stream")

    try:
        result = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            cwd=work_dir,
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar mistral-vibe-cli: {e.stderr}", file=sys.stderr)
        raise


# --- Lógica principal ---
def main():
    parser = argparse.ArgumentParser(
        description="Conector MCP para Mistral Vibe CLI con soporte para directorios, modelos y historial."
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Modelo a usar (ej: mistral-medium, mistral-small). Si no se especifica, se listarán los modelos disponibles.",
    )
    parser.add_argument(
        "--dir",
        type=str,
        default=None,
        help="Directorio del proyecto donde está el código. Si no se especifica, usa el directorio actual.",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default=None,
        help="Prompt o instrucción para Mistral.",
    )
    parser.add_argument(
        "--stream",
        action="store_true",
        help="Habilita streaming de la respuesta.",
    )
    parser.add_argument(
        "--no-history",
        action="store_true",
        help="Desactiva el guardado de historial.",
    )
    parser.add_argument(
        "--list-models",
        action="store_true",
        help="Lista los modelos disponibles en Mistral AI y sale.",
    )
    parser.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="API key de Mistral para listar modelos. Opcional.",
    )

    args = parser.parse_args()

    # Si se pide listar modelos, hacerlo y salir
    if args.list_models:
        print_available_models(args.api_key)
        sys.exit(0)

    # Validar que se proporcionó un prompt
    if not args.prompt:
        print("Error: Debes proporcionar un prompt con --prompt.", file=sys.stderr)
        sys.exit(1)

    # Validar directorio (usar directorio actual si no se especifica)
    work_dir = validate_directory(args.dir) if args.dir else Path.cwd()
    print(f"Trabajando en: {work_dir}")

    # Si no se especifica modelo, listar modelos y salir
    if not args.model:
        print("Error: Debes especificar un modelo con --model o usar --list-models para ver los disponibles.", file=sys.stderr)
        sys.exit(1)

    # Ejecutar Mistral Vibe CLI
    print(f"Usando modelo: {args.model}")
    print(f"Prompt: {args.prompt}")

    try:
        response = run_mistral_vibe_cli(
            prompt=args.prompt,
            model=args.model,
            work_dir=work_dir,
            stream=args.stream,
        )

        # Guardar en historial si no está desactivado
        if not args.no_history:
            history_file = get_history_file(work_dir)
            add_to_history(history_file, args.prompt, response, args.model)
            print(f"Historial guardado en: {history_file}")

        # Imprimir respuesta
        if not args.stream:
            print("\n--- Respuesta de Mistral ---")
            print(response)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
