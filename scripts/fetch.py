#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
采集脚本：支持 RSS / API / HTML 三种来源类型。
读取 config/sources.json，遍历启用的数据源抓取内容，保存为 draft 文章。
"""

import json
import os
import hashlib
import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES_PATH = os.path.join(PROJECT_DIR, "config", "sources.json")
CONTENT_DIR = os.path.join(PROJECT_DIR, "content", "articles", "draft")
LOGS_PATH = os.path.join(PROJECT_DIR, "config", "logs.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


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
        json.dump(logs, f, ensure_ascii=False, indent=2)


def fetch_rss(source):
    """Parse RSS feed"""
    print(f"  [RSS] {source['name']}")
    try:
        resp = requests.get(source["url"], headers=HEADERS, timeout=30)
        resp.raise_for_status()
    except Exception as e:
        append_log(source["name"], "error", f"RSS request failed: {e}")
        return []

    articles = []
    try:
        root = ET.fromstring(resp.content)
        ns = {"atom": "http://www.w3.org/2005/Atom", "content": "http://purl.org/rss/1.0/modules/content/"}
        for item in root.iter("item"):
            title = item.findtext("title", "")
            link = item.findtext("link", "")
            desc = item.findtext("description", "")
            pubdate = item.findtext("pubDate", "")
            if title:
                slug = hashlib.md5(title.encode()).hexdigest()[:12]
                articles.append({
                    "slug": f"{source['id']}_{slug}",
                    "title": title.strip(),
                    "summary": BeautifulSoup(desc or "", "html.parser").get_text(strip=True)[:200],
                    "link": link,
                    "source_name": source["name"],
                    "category": source.get("category", "news"),
                    "date": pubdate,
                })
    except Exception as e:
        append_log(source["name"], "error", f"RSS parse failed: {e}")

    return articles


def fetch_api(source):
    """Fetch from JSON API"""
    print(f"  [API] {source['name']}")
    try:
        resp = requests.get(source["url"], headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        append_log(source["name"], "error", f"API request failed: {e}")
        return []

    articles = []
    try:
        items = data
        # Handle common API wrappers
        if isinstance(data, dict):
            # Sina format: result.data[]
            if "result" in data and isinstance(data["result"], dict):
                for k in ["data", "items", "list"]:
                    if k in data["result"] and isinstance(data["result"][k], list):
                        items = data["result"][k]
                        break
            else:
                for key in ["data", "items", "list", "results", "news"]:
                    if key in data and isinstance(data[key], list):
                        items = data[key]
                        break

        for item in items[:15]:
            if isinstance(item, str):
                title = item[:100]
                slug = hashlib.md5(title.encode()).hexdigest()[:12]
                articles.append({
                    "slug": f"{source['id']}_{slug}",
                    "title": title,
                    "summary": "",
                    "link": source["url"],
                    "source_name": source["name"],
                    "category": source.get("category", "news"),
                    "date": "",
                })
                continue

            title = item.get("title") or item.get("content") or ""
            if not title:
                continue
            if isinstance(title, dict):
                title = str(title)
            title = str(title).strip()
            if not title:
                continue
            slug = hashlib.md5(title.encode()).hexdigest()[:12]
            link = item.get("url") or item.get("link") or item.get("share_url") or item.get("wap_url") or item.get("source_url") or source["url"]
            summary = item.get("summary") or item.get("description") or item.get("content_text") or item.get("intro") or ""
            date_val = item.get("date") or item.get("ctime") or item.get("published_at") or item.get("time") or ""
            if date_val and date_val.isdigit():
                import datetime as dt
                date_val = dt.datetime.fromtimestamp(int(date_val)).strftime("%Y-%m-%d")
            articles.append({
                "slug": f"{source['id']}_{slug}",
                "title": title[:100],
                "summary": str(summary)[:200],
                "link": link,
                "source_name": source["name"],
                "category": source.get("category", "news"),
                "date": date_val,
            })
    except Exception as e:
        append_log(source["name"], "error", f"API parse failed: {e}")

    return articles


def fetch_html(source):
    """Scrape HTML page using CSS selector"""
    print(f"  [HTML] {source['name']}")
    selector = source.get("selector", "article")
    try:
        resp = requests.get(source["url"], headers=HEADERS, timeout=30)
        resp.raise_for_status()
    except Exception as e:
        append_log(source["name"], "error", f"HTML request failed: {e}")
        return []

    articles = []
    try:
        soup = BeautifulSoup(resp.text, "lxml")
        items = soup.select(selector)

        for item in items[:10]:
            title_el = item.select_one("h1, h2, h3, h4, .title, a[title]")
            link_el = item.select_one("a[href]")
            body_el = item.select_one("p, .desc, .summary, .content")

            title = title_el.get_text(strip=True) if title_el else ""
            link = urljoin(source["url"], link_el["href"]) if link_el else source["url"]
            summary = body_el.get_text(strip=True) if body_el else ""

            if not title:
                title = item.get_text(strip=True)[:80]
            if not title:
                continue

            slug = hashlib.md5(title.encode()).hexdigest()[:12]
            articles.append({
                "slug": f"{source['id']}_{slug}",
                "title": title[:100],
                "summary": summary[:200],
                "link": link,
                "source_name": source["name"],
                "category": source.get("category", "news"),
                "date": "",
            })
    except Exception as e:
        append_log(source["name"], "error", f"HTML parse failed: {e}")

    return articles


def save_draft(article):
    os.makedirs(CONTENT_DIR, exist_ok=True)
    today = article["date"][:10] if article.get("date") else datetime.now().strftime("%Y-%m-%d")
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
    content = f"{frontmatter}{article['summary']}\n\n---\n\n> 原文链接：[{article['title']}]({article['link']})"
    filepath = os.path.join(CONTENT_DIR, f"{article['slug']}.md")
    if os.path.exists(filepath):
        return  # Skip duplicates
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"    Saved: {article['title'][:40]}...")


def main():
    print("=== Fetch Script Started ===")
    sources = load_sources()
    enabled = [s for s in sources if s.get("enabled", False)]
    print(f"Sources: {len(enabled)} enabled out of {len(sources)} total")

    total = 0
    for source in enabled:
        source_type = source.get("type", "html")
        if source_type == "rss":
            articles = fetch_rss(source)
        elif source_type == "api":
            articles = fetch_api(source)
        else:
            articles = fetch_html(source)

        for article in articles:
            save_draft(article)
            total += 1

        append_log(source["name"], "success", f"Fetched {len(articles)} articles")
        print(f"  -> Got {len(articles)} articles")

    print(f"\nTotal new articles saved: {total}")
    print(f"=== Fetch Complete ===")


if __name__ == "__main__":
    main()
