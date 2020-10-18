# -*- coding: utf-8 -*-
from flask import (
    Blueprint,
    request,
    render_template,
    redirect,
    url_for
)
from adminplat.manager import login_require

admin = Blueprint("admin", __name__)

@admin.route('/', methods=['GET'])
@login_require
def default():
    return redirect('/admin/config')

@admin.route('/login', methods=['GET'])
def login():
    return render_template("login.html")

@admin.route('/config', methods=['GET'])
@login_require
def config():
    return render_template("config.html")

@admin.route('/online', methods=['GET'])
@login_require
def online():
    return render_template("online.html")