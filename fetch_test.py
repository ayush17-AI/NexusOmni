import os
import requests
import re
import json

def fetch_player(p):
    url = f"https://liquipedia.net/pubgmobile/{p}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 TestScraper/1.0'}
    res = requests.get(url, headers=headers)
    html = res.text
    
    # Team
    team_match = re.search(r'class="infobox-cell-2".*?<a[^>]*>([^<]+)</a>', html)
    team = team_match.group(1) if team_match else "Unknown"
    
    # Image
    img_match = re.search(r'class="infobox-image".*?src="(/commons/images/thumb/[^"]+)"', html)
    img_url = "https://liquipedia.net" + img_match.group(1) if img_match else ""
    
    # Count MVPs by searching for MVP or Most Valuable Player in tables
    # liquipedia pubg mobile mvp entries usually have `<th colspan="2" class="navbox-title"><div style="font-size:110%;"><a href="/pubgmobile/Most_Valuable_Player"` or `MVP`
    mvp_count = html.count('Most Valuable Player') + html.count('MVP')
    # Better: count rows in Individual Awards or MVP icons length
    icons = re.findall(r'MVP', html)
    print(f"{p}: Team={team}, Image={img_url}, MVP_words={len(icons)}")

fetch_player("JONATHAN")
fetch_player("Goblin")
