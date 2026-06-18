#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
采集脚本：读取 config/sources.json，遍历启用的数据源抓取内容，保存为 draft 文章。
"""

import json
import os
import hashlib
from datetime import datetime
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES_PATH = os.path.join(PROJECT_DIR, "config", "sources.json")
CONTENT_DIR = os.path.join(PROJECT_DIR, "content", "articles", "draft")
LOGS_PATH = os.path.join(PROJECT_DIR, "config", "logs.json")


def load_sources():
    if not os.path.exists(SOURCES_PATH):
        return []
    with open(SOURCES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def append_log(source, status, message):
    logs = []
    if os.path.exists(LOGS_PATH):
        with open(LOGS_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)
    logs.append({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": source,
        "action": "fetch",
        "status": status,
        "message": message,
    })
    os.makedirs(os.path.dirname(LOGS_PATH), exist_ok=True)
    with open(LOGS_PATH, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False)


def fetch_source(source):
    print(f"  Fetching: {source['name']} ({source['url']})")
    try:
        resp = requests.get(source["url"], timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp.raise_for_status()
    except Exception as e:
        append_log(source["name"], "error", f"Request failed: {e}")
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    selector = source.get("selector", "article")
    items = soup.select(selector)

    articles = []
    for item in items[:10]:  # Limit to 10 articles per source
        title_el = item.select_one("h1, h2, h3, .title, .headline")
        link_el = item.select_one("a[href]")
        body_el = item.select_one("p, .content, .body, .summary")

        title = title_el.get_text(strip=True) if title_el else ""
        link = urljoin(source["url"], link_el["href"]) if link_el else source["url"]
        summary = body_el.get_text(strip=True) if body_el else ""

        if not title:
            continue

        # Deduplicate by title hash
        content_hash = hashlib.md5(title.encode()).hexdigest()
        slug = f"{source['id']}_{content_hash[:12]}"

        articles.append({
            "slug": slug,
            "title": title,
            "summary": summary[:200],
            "link": link,
            "source_name": source["name"],
            "category": source.get("category", "news"),
        })

    append_log(source["name"], "success", f"Fetched {len(articles)} articles")
    return articles


def save_draft(article):
    os.makedirs(CONTENT_DIR, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    frontmatter = (
        f"---\n"
        f"title: {article['title']}\n"
        f"date: {today}\n"
        f"summary: {article['summary']}\n"
        f"tags: {article['category']}\n"
        f"source: {article['source_name']}\n"
        f"source_url: {article['link']}\n"
        f"status: draft\n"
        f"---\n"
    )
    content = f"{frontmatter}{article['summary']}\n\n[原文链接]({article['link']})"
    filepath = os.path.join(CONTENT_DIR, f"{article['slug']}.md")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"    Saved: {article['title'][:40]}...")


def main():
    print("=== Fetch Script Started ===")
    sources = load_sources()
    enabled = [s for s in sources if s.get("enabled", False)]
    print(f"Sources: {len(enabled)} enabled out of {len(sources)} total")

    for source in enabled:
        articles = fetch_source(source)
        for article in articles:
            save_draft(article)

    print(f"=== Fetch Complete ===")


if __name__ == "__main__":
    main()
