# -*- coding: utf-8 -*-
import json
import os
from flask import (
    Blueprint,
    request,
    send_file,
    abort
)

from . import manager as M
from . import models
from . import errcode
import settings as S
import hashlib

api = Blueprint('api', __name__)

def __resp(ErrCode=errcode.OK, data_str=None):
    if data_str is None:
        data_str = ErrCode['data']
    return json.dumps({
        "code": ErrCode['code'],
        "data": data_str
    })

# 登录登出
@api.route('/login', methods=['POST'])
def login():
    data = json.loads(request.data)
    if 'username' in data and 'password' in data:
        if M.login(data['username'], data['password']):
            return __resp()
    return __resp(errcode.LOGIN_FAILED)

@api.route('/logout', methods=['GET'])
@M.login_require
def logout():
    M.logout()
    return __resp()

# 数据获取
@api.route('/img/<filename>', methods=['GET'])
def get_img(filename):
    full_path = os.path.join(S.image_path, filename)
    if os.path.exists(full_path):
        return send_file(full_path)
    else:
        return abort(404)


@api.route('/data/config', methods=['GET'])
@M.login_require
def data_config():
    return __resp(data_str=json.dumps(models.encode_data(models.ConfigData)))

@api.route('/data/online', methods=['GET'])
def data_online():
    print(models.OnlineData)
    return __resp(data_str=json.dumps(models.encode_data(models.OnlineData)))

# 数据编辑
@api.route('/add_type', methods=['POST'])
@M.login_require
def add_type():
    d = json.loads(request.data)
    if "typename" not in d:
        return __resp(errcode.ADD_TYPE_NO_NAME)
    if not M.add_type(d['typename']):
        return __resp(errcode.ADD_TYPE_REPEATED_NAME)
    return __resp()

@api.route('/rm_type', methods=['POST'])
@M.login_require
def rm_type():
    d = json.loads(request.data)
    if "typeid" not in d:
        return __resp(errcode.RM_TYPE_NO_ID)
    if not M.rm_type(d['typeid']):
        return __resp(errcode.RM_TYPE_BAD_ID)
    return __resp()

@api.route('/up_image', methods=['POST'])
@M.login_require
def up_image():
    imgs = request.files.getlist("image")
    if imgs is None:
        return __resp(errcode.UP_IMAGE_NO_DATA)
    fns = []
    for fs in imgs:
        fns.append(M.save_image(fs))
    return __resp(errcode.OK, json.dumps(fns))

@api.route('/add_good', methods=['POST'])
@M.login_require
def add_good():
    typeid = int(request.form.get("typeid"))
    title = request.form.get("title")
    if title is None or len(title) == 0:
        return __resp(errcode.ADD_GOOD_NEED_TITLE)
    sub_title = request.form.get("sub_title")
    fs = request.files.get("image")
    if fs is None:
        return __resp(errcode.ADD_GOOD_NEED_IMAGE)
    image = M.save_image(fs)
    detail_imgs = []
    for img_fs in request.files.getlist("detail_imgs"):
        detail_imgs.append(M.save_image(img_fs))

    return __resp(M.add_good(typeid, title, sub_title, image, detail_imgs))

@api.route('/md_good', methods=['POST'])
@M.login_require
def md_good():
    gid = int(request.form.get("goodid"))
    title = request.form.get("title")
    if title is None or len(title) == 0:
        return __resp(errcode.MD_GOOD_NEED_TITLE)
    sub_title = request.form.get("sub_title")
    image = request.form.get("image")
    if image is None:
        return __resp(errcode.MD_GOOD_NEED_IMAGE)
    if not os.path.exists(os.path.join(S.image_path, image)):
        return __resp(errcode.MD_GOOD_IMAGE_PATH_ERR)
    detail_imgs = json.loads(request.form.get("detail_imgs"))
    for img in detail_imgs:
        if not os.path.exists(os.path.join(S.image_path, img)):
            return __resp(errcode.MD_GOOD_DETAIL_PATH_ERR)
    return __resp(M.md_good(gid, title, sub_title, image, detail_imgs))

@api.route('/rm_good', methods=['POST'])
@M.login_require
def rm_good():
    tid = int(request.form.get("typeid"))
    if tid == None:
        return __resp(errcode.RM_GOOD_NO_TYPEID)
    gid = int(request.form.get("goodid"))
    if gid == None:
        return __resp(errcode.RM_GOOD_NO_GOODID)

    return __resp(M.rm_good(tid, gid))

@api.route('/sync', methods=['GET'])
@M.login_require
def sync():
    M.sync()
    return __resp()