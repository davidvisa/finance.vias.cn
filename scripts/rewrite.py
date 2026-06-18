#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
LLM 二次创作脚本：读取 draft 目录中的文章，调用 LLM API 改写后存入 pending 目录。
"""

import json
import os
import re
from datetime import datetime

import requests
from dotenv import load_dotenv


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFT_DIR = os.path.join(PROJECT_DIR, "content", "articles", "draft")
PENDING_DIR = os.path.join(PROJECT_DIR, "content", "articles", "pending")
LOGS_PATH = os.path.join(PROJECT_DIR, "config", "logs.json")

load_dotenv(os.path.join(PROJECT_DIR, ".env"))


def append_log(action, status, message):
    logs = []
    if os.path.exists(LOGS_PATH):
        with open(LOGS_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)
    logs.append({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": "rewrite",
        "action": action,
        "status": status,
        "message": message,
    })
    os.makedirs(os.path.dirname(LOGS_PATH), exist_ok=True)
    with open(LOGS_PATH, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False)


def parse_frontmatter(raw):
    match = re.match(r"^---\n([\s\S]*?)\n---\n([\s\S]*)$", raw)
    if not match:
        return {}, raw
    meta = {}
    for line in match.group(1).split("\n"):
        sep = line.find(": ")
        if sep > 0:
            meta[line[:sep].strip()] = line[sep + 2:].strip()
    return meta, match.group(2).strip()


def build_frontmatter(meta):
    lines = ["---"]
    for k, v in meta.items():
        lines.append(f"{k}: {v}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def rewrite_with_llm(title, summary, category):
    api_key = os.getenv("LLM_API_KEY")
    api_url = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")

    if not api_key:
        print("  [SKIP] No LLM_API_KEY configured")
        return None

    category_prompt = {
        "us_stock": "美股市场",
        "hk_stock": "港股市场",
        "macro": "宏观经济",
        "news": "财经新闻",
        "policy": "金融政策",
        "insurance": "保险资讯",
    }.get(category, "财经")

    prompt = f"""你是一个专业的财经资讯编辑。请根据以下素材，改写成一篇原创的财经资讯文章。

要求：
1. 重新组织语言，不得直接复制原文
2. 增加专业的分析视角
3. 文章结构清晰，适合快速阅读
4. 标题要吸引人且准确
5. 正文保持在 300-500 字
6. 输出格式为 Markdown

原文标题：{title}
原文摘要：{summary}
所属分类：{category_prompt}

请输出：
## 标题
（改写后的标题）

## 正文
（改写后的正文）"""

    try:
        resp = requests.post(
            api_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 1500,
            },
            timeout=60,
        )
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"]

        # Extract title and body
        lines = content.strip().split("\n")
        rewritten_title = title
        body_lines = []
        in_body = False
        for line in lines:
            if line.startswith("## 标题"):
                continue
            elif line.startswith("## 正文"):
                in_body = True
            elif in_body:
                body_lines.append(line)

        body = "\n".join(body_lines).strip()
        return body if body else content

    except Exception as e:
        append_log("rewrite", "error", f"LLM API call failed for '{title[:30]}': {e}")
        return None


def main():
    print("=== Rewrite Script Started ===")
    os.makedirs(PENDING_DIR, exist_ok=True)

    if not os.path.exists(DRAFT_DIR):
        print("No draft directory found")
        return

    files = [f for f in os.listdir(DRAFT_DIR) if f.endswith(".md")]
    print(f"Draft articles to process: {len(files)}")

    for filename in files:
        filepath = os.path.join(DRAFT_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            raw = f.read()

        meta, content = parse_frontmatter(raw)
        title = meta.get("title", "")
        summary = meta.get("summary", "")
        category = meta.get("tags", "news")

        print(f"  Rewriting: {title[:40]}...")

        rewritten = rewrite_with_llm(title, summary, category)
        if rewritten:
            meta["status"] = "pending"
            frontmatter = build_frontmatter(meta)
            pending_path = os.path.join(PENDING_DIR, filename)
            with open(pending_path, "w", encoding="utf-8") as f:
                f.write(frontmatter + rewritten + "\n")
            os.remove(filepath)
            append_log("rewrite", "success", f"Rewrote '{title[:40]}'")
            print(f"    Saved to pending")
        else:
            print(f"    Skipped (no API key or error)")

    print(f"=== Rewrite Complete ===")


if __name__ == "__main__":
    main()
