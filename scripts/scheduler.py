#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
调度脚本：按顺序执行采集 → LLM 改写 → 发布。
用法：
  python scripts/scheduler.py              # 执行完整流程
  python scripts/scheduler.py --fetch-only # 仅采集
  python scripts/scheduler.py --rewrite-only # 仅改写
"""

import sys
import os
import subprocess


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run_script(name):
    script_path = os.path.join(PROJECT_DIR, "scripts", name)
    print(f"\n{'='*40}")
    print(f"Running: {name}")
    print(f"{'='*40}")
    result = subprocess.run(
        [sys.executable, script_path],
        cwd=PROJECT_DIR,
        capture_output=False,
    )
    return result.returncode == 0


def main():
    args = sys.argv[1:]
    fetch_only = "--fetch-only" in args
    rewrite_only = "--rewrite-only" in args
    publish_only = "--publish-only" in args

    if fetch_only:
        run_script("fetch.py")
        return

    if rewrite_only:
        run_script("rewrite.py")
        return

    if publish_only:
        run_script("publishers/website.py")
        return

    # Full pipeline
    ok = run_script("fetch.py")
    if ok:
        run_script("rewrite.py")

    print("\n=== Scheduler Complete ===")


if __name__ == "__main__":
    main()
