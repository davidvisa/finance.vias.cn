#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Website publisher: Copies pending articles to published directory.
This triggers a rebuild when deployed on Vercel/GitHub.
"""

import json
import os
import re
import shutil
from datetime import datetime


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PENDING_DIR = os.path.join(PROJECT_DIR, "content", "articles", "pending")
PUBLISHED_DIR = os.path.join(PROJECT_DIR, "content", "articles", "published")
LOGS_PATH = os.path.join(PROJECT_DIR, "config", "logs.json")


def append_log(action, status, message):
    logs = []
    if os.path.exists(LOGS_PATH):
        with open(LOGS_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)
    logs.append({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": "website",
        "action": action,
        "status": status,
        "message": message,
    })
    os.makedirs(os.path.dirname(LOGS_PATH), exist_ok=True)
    with open(LOGS_PATH, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False)


def main():
    print("=== Website Publisher ===")
    os.makedirs(PUBLISHED_DIR, exist_ok=True)

    if not os.path.exists(PENDING_DIR):
        print("No pending articles")
        return

    files = [f for f in os.listdir(PENDING_DIR) if f.endswith(".md")]
    print(f"Publishing {len(files)} articles")

    for filename in files:
        src = os.path.join(PENDING_DIR, filename)
        dst = os.path.join(PUBLISHED_DIR, filename)

        raw = open(src, "r", encoding="utf-8").read()
        raw = re.sub(r"^status: pending$", "status: published", raw, flags=re.MULTILINE)
        with open(dst, "w", encoding="utf-8") as f:
            f.write(raw)
        os.remove(src)
        append_log("publish", "success", f"Published '{filename}'")

    print(f"=== Publish Complete ===")


if __name__ == "__main__":
    main()
