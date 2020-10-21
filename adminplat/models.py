# -*- coding: utf-8 -*-
import json
import time
import settings
import copy

ConfigData = { "types": [], "goods": [] }
OnlineData = { "types": [], "goods": [] }
DataVersion = 0

class GoodType():
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.goods = []

    def toJsonObj(self):
        return {
            "id": self.id,
            "name": self.name,
            "goods": self.goods
        }

    def __str__(self):
        return str(self.toJsonObj())

    @staticmethod
    def decode_json(jsonDict):
        id = jsonDict['id']
        name = jsonDict['name']
        goods = jsonDict['goods']
        t = GoodType(id, name)
        t.goods = goods
        return t

class Good():
    def __init__(self, id, title, sub_title, image, detail_imgs):
        self.id = id
        self.title = title
        self.sub_title = sub_title
        self.image = image
        self.detail_imgs = detail_imgs

    def toJsonObj(self):
        return {
            "id": self.id,
            "title": self.title,
            "sub_title": self.sub_title,
            "image": self.image,
            "detail_imgs": self.detail_imgs,
        }

    def __str__(self):
        return str(self.toJsonObj())

    @staticmethod
    def decode_json(jsonDict):
        id = jsonDict["id"]
        title = jsonDict["title"]
        sub_title = jsonDict["sub_title"]
        image = jsonDict["image"]
        detail_imgs = jsonDict["detail_imgs"]
        return Good(id, title, sub_title, image, detail_imgs)

def sync():
    global OnlineData
    global ConfigData
    global DataVersion
    OnlineData = copy.deepcopy(ConfigData)
    DataVersion = int(time.time())

def load():
    f = open(settings.data_file, "r", encoding="utf-8")
    d = json.load(f)
    f.close()

    global ConfigData
    ConfigData = { "types": [], "goods": [] }
    config = d['config']
    for t in config['types']:
        ConfigData["types"].append(GoodType.decode_json(t))
    for g in config['goods']:
        ConfigData["goods"].append(Good.decode_json(g))

    global OnlineData
    OnlineData = { "types": [], "goods": [] }
    online = d['online']
    for t in online['types']:
        OnlineData["types"].append(GoodType.decode_json(t))
    for g in online['goods']:
        OnlineData["goods"].append(Good.decode_json(g))

def encode_data(ori):
    res = { "types": [], "goods": [] }
    for t in ori["types"]:
        res["types"].append(t.toJsonObj())
    for g in ori["goods"]:
        res["goods"].append(g.toJsonObj())
    return res

def save():
    data = {
        "config": encode_data(ConfigData),
        "online": encode_data(OnlineData)
    }

    f = open(settings.data_file, "w", encoding="utf-8")
    json.dump(data, f)
    f.close()

load()
DataVersion = int(time.time())