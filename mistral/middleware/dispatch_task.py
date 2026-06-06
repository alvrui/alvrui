#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Despachador simple de tareas para middleware v0")
    parser.add_argument("--task-file", required=True, help="Ruta al JSON de tarea")
    args = parser.parse_args()

    task_path = Path(args.task_file).expanduser().resolve()
    task = load_json(task_path)

    task_id = task["task_id"]
    adapter = task["adapter"]
    model = task["model"]
    work_dir = task["work_dir"]
    prompt_file = task["prompt_file"]
    output_file = task["output_file"]
    meta_file = task["meta_file"]

    task["status"] = "running"
    task["started_at"] = datetime.now().isoformat()
    save_json(task_path, task)

    cmd = [
        sys.executable,
        adapter,
        "--model", model,
        "--dir", work_dir,
        "--prompt-file", prompt_file,
        "--task-id", task_id,
        "--output-file", output_file,
        "--meta-file", meta_file,
    ]

    if task.get("stream"):
        cmd.append("--stream")
    if task.get("no_history"):
        cmd.append("--no-history")

    result = subprocess.run(cmd, text=True)

    task["finished_at"] = datetime.now().isoformat()
    task["status"] = "done" if result.returncode == 0 else "error"
    task["return_code"] = result.returncode
    save_json(task_path, task)

    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
