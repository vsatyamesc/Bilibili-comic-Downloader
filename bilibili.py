import os
import io
import re
import time
import json
import requests
import zipfile
import numpy as np
from pprint import pprint

download_path = './Comic'
link = str(input("Enter the Link to the Comic : "))
Cookies = str(input("Enter SSESDATA String or Whole Cookie String : "))
link = link.replace('?', '/')
link = re.split('/', link)
episode_id = int(link[4])
comic_id = link[3]
comic_id = int(comic_id[2:])

#episode_id = 813625 INT
#comic_id = 24934 INT

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "content-type": "application/json;charset=UTF-8",
    "origin": "https://manga.bilibili.com",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
    "cookie": Cookies
}
headers_cdn = {
    'Host': 'manga.hdslb.com',
    'Origin': 'https://manga.bilibili.com',
}

def decode_index_data(season_id: int, episode_id: int, buf):
    u = [66, 73, 76, 73, 67, 79, 77, 73, 67]
    l = len(u)
    e = buf[l:]
    _e = []
    for i in range(len(e)):
        _e.append(e[i])
    e = np.uint8(_e)
    n = [0, 0, 0, 0, 0, 0, 0, 0]
    n = np.array(n, dtype='uint8')
    n[0] = episode_id
    n[1] = episode_id >> 8
    n[2] = episode_id >> 16
    n[3] = episode_id >> 24
    n[4] = season_id
    n[5] = season_id >> 8
    n[6] = season_id >> 16
    n[7] = season_id >> 24
    _n = 0
    r = len(e)
    while _n < r:
        e[_n] = e[_n] ^ n[_n % 8]
        _n = _n + 1
        pass
    ret = bytes(e)
    z = zipfile.ZipFile(io.BytesIO(ret), 'r')
    j = z.read('index.dat')
    return json.loads(j)['pics']
    pass

url = "https://manga.bilibili.com/twirp/comic.v2.Comic/ComicDetail?device=pc&platform=web"
res = requests.post(url, json.dumps({"comic_id": comic_id}), headers=headers)
data = json.loads(res.text)['data']
title_comic = data["title"]
res = requests.post('https://manga.bilibili.com/twirp/comic.v1.Comic/GetEpisode?device=pc&platform=web',json.dumps({"id": episode_id}), headers=headers)
data = json.loads(res.text)
episode_number = data["data"]["title"]
res = requests.post('https://manga.bilibili.com/twirp/comic.v1.Comic/GetImageIndex?device=pc&platform=web',
                        json.dumps({
                            "ep_id": episode_id
                        }), headers=headers)
data = json.loads(res.text)
index_url = 'https://manga.hdslb.com' + data['data']['path']

# INDEX files - is a bytes file
res = requests.get(index_url)
pics = decode_index_data(comic_id, episode_id, res.content)
ep_path = os.path.join(download_path, str(title_comic),str(episode_number))

def get_image_url(img_url):
    res = requests.post('https://manga.bilibili.com/twirp/comic.v1.Comic/ImageToken?device=pc&platform=web',
                        json.dumps({
                            "urls": json.dumps([img_url])
                        }), headers=headers)
    data = json.loads(res.text)['data'][0]
    url = data['url'] + '?token=' + data['token']
    return url

if not os.path.exists(ep_path):
        os.makedirs(ep_path)
print("\nStarting The Download... \n")
for i, e in enumerate(pics):
        url = get_image_url(e)
        print("Downloading Image ",i+1)
        res = requests.get(url)
        with open(os.path.join(ep_path, str(i+1) + '.jpg'), 'wb+') as f:
            f.write(res.content)
            pass
        if i % 4 == 0 and i != 0:
            time.sleep(3)  #Don't remove if you dont wanna get rate limited
            pass
        pass
