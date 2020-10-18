# -*- coding: utf-8 -*-
from functools import wraps
from flask import (
    session,
    redirect,
    request
)
import os
import time
import hashlib
import settings as S
from . import models
from . import errcode

D_config = []
LoginUsers = {}
skey = S.session_key

def login_require(f):
    @wraps(f)
    def warpper(*args, **kwargs):
        if skey in session and session[skey] in LoginUsers:
            return f(*args, **kwargs)
        else:
            if request.method == "GET":
                return redirect('/admin/login')
            else:
                return errcode.NO_LOGIN
    return warpper

def login(user, pwd):
    if user in S.users and S.users[user] == pwd:
        val = str(time.time_ns())
        session[skey] = val
        LoginUsers[val] = True
        return True
    else:
        return False

def logout():
    if skey in session:
        val = session[skey]
        del session[skey]
        if val in LoginUsers:
            del LoginUsers[val]

def add_type(typename):
    for t in models.ConfigData['types']:
        if t.name == typename:
            return False
    t = models.GoodType(int(time.time()), typename)
    models.ConfigData['types'].append(t)
    models.save()
    return True

def rm_type(Tid):
    for t in models.ConfigData['types']:
        if t.id == Tid:
            g_ids = t.goods.copy()
            for gid in g_ids:
                rm_good(Tid, gid)
            models.ConfigData['types'].remove(t)
            models.save()
            return errcode.OK
    return errcode.RM_TYPE_BAD_ID

def save_image(fs):
    bs = fs.read()
    md5 = hashlib.md5(bs).hexdigest()
    _filename, file_ext = os.path.splitext(fs.filename)
    fn = md5 + file_ext
    full_path = os.path.join(S.image_path, fn)
    if not os.path.exists(full_path):
        f = open(full_path, "wb")
        f.write(bs)
        f.close()
    return fn

def add_good(typeid, title, sub_title, image, detail_imgs):
    if sub_title is None:
        sub_title = ""
    if detail_imgs is None:
        detail_imgs = []
    t = None
    for _t in models.ConfigData["types"]:
        if _t.id == typeid:
            t = _t
            break
    if t is None:
        return errcode.ADD_GOOD_TYPE_ERR
    g = models.Good(int(time.time()), title, sub_title, image, detail_imgs)
    models.ConfigData["goods"].append(g)
    t.goods.append(g.id)
    models.save()
    return errcode.OK

def md_good(Gid, title, sub_title, image, detail_imgs):
    target = None
    for g in models.ConfigData['goods']:
        if g.id == Gid:
            target = g
            break
    if target == None:
        return errcode.MD_GOOD_NO_TARGET
    g.title = title
    g.sub_title = sub_title
    g.image = image
    g.detail_imgs = detail_imgs
    models.save()
    return errcode.OK

def rm_good(Tid, Gid):
    t_flag = False
    for t in models.ConfigData['types']:
        if t.id == Tid:
            before = len(t.goods)
            t.goods.remove(Gid)
            after = len(t.goods)
            t_flag = after < before
            break

    if not t_flag:
        return errcode.RM_GOOD_TID_ERR

    g_flag = False
    for g in models.ConfigData['goods']:
        if g.id == Gid:
            g_flag = True
            models.ConfigData['goods'].remove(g)
            break

    if not g_flag:
        return errcode.RM_GOOD_GID_ERR

    models.save()
    return errcode.OK

def sync():
    models.sync()
    models.save()