#!/usr/bin/env python
"""Test each source URL to check response format"""
import requests, json
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

tests = [
    ("Sina API News", "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2509&k=&num=3"),
    ("Sina API US", "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2510&k=&num=3"),
    ("WallStreetCN", "https://api-one.wallstcn.com/apiv1/content/lives?limit=3"),
    ("RTHK RSS", "https://news.rthk.hk/rthk/ch/rss.php?cat=3"),
    ("Caixin", "https://www.caixin.com/macro/"),
    ("Yicai", "https://www.yicai.com/news/finance/"),
    ("CLS", "https://www.cls.cn/telegraph"),
    ("Jin10", "https://www.jin10.com/flash"),
    ("Xueqiu", "https://xueqiu.com/statuses/hot.json"),
]

for name, url in tests:
    print(f"\n=== {name} ===")
    try:
        r = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {r.status_code}, Length: {len(r.content)}, Type: {r.headers.get('content-type','')[:40]}")
        txt = r.text[:300]
        print(f"Preview: {txt}")
    except Exception as e:
        print(f"Error: {e}")
