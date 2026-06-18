#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
小红书发布器（占位）：
小红书没有公开 API，此脚本生成适合手动发布的 Markdown 导出文件。
"""

import os
from datetime import datetime

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLISHED_DIR = os.path.join(PROJECT_DIR, "content", "articles", "published")
EXPORT_DIR = os.path.join(PROJECT_DIR, "exports")


def main():
    print("=== Xiaohongshu Publisher (export) ===")
    os.makedirs(EXPORT_DIR, exist_ok=True)

    if not os.path.exists(PUBLISHED_DIR):
        print("No published articles")
        return

    files = [f for f in os.listdir(PUBLISHED_DIR) if f.endswith(".md")]
    for filename in files:
        src = os.path.join(PUBLISHED_DIR, filename)
        dst = os.path.join(EXPORT_DIR, f"xiaohongshu_{filename.replace('.md', '.txt')}")
        shutil.copy2(src, dst)
        print(f"  Exported: {dst}")

    print("=== Export Complete ===")


if __name__ == "__main__":
    import shutil
    main()
