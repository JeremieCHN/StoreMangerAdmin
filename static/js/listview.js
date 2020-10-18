var dataurl
var types
var goods

// 两个查看用的

function on_view_good(event) {
    var good_id = Number($(event.target).parents("tr").attr("good_id"))
    var good = goods[good_id]
    $("#view-type-modal .media").html(`
        <div class="img_item" style="background-image: url(/api/img/${good.image});" class="mr-3"></div>
        <div class="media-body">
            <h5 class="mt-0">${good.title}</h5>
            <span>${good.sub_title}</span>
        </div>
    `)
    $("#carouselExampleIndicators ol").empty()
    $("#carouselExampleIndicators .carousel-inner").empty()
    for (var i = 0; i < good.detail_imgs.length; i++) {
        $("#carouselExampleIndicators ol").append(`<li data-target="#carouselExampleIndicators" data-slide-to="${i}"></li>`)
        $("#carouselExampleIndicators .carousel-inner").append(`
            <div class="carousel-item">
                <img style="margin: auto;" src="/api/img/${good.detail_imgs[i]}" class="d-block">
            </div>
        `)
    }
    $("#carouselExampleIndicators ol [data-slide-to=0]").addClass("active")
    $("#carouselExampleIndicators .carousel-inner div:first-child").addClass("active")
    $("#view-type-modal").modal("show")
}

function on_type_click(event) {
    $("#type-list li.active").removeClass("active")
    $(event.target).addClass("active")
    var target_id = Number($(event.target).attr("data"))
    for (var t of types) {
        if (t.id == target_id) {
            render_goods(t.goods)
            break
        }
    }
    bind_op()
}

// 新增类型
function on_add_type() {
    $("#add-type-modal").modal("show")
}

function on_add_type_confirm() {
    var typename = $("#add-type-modal input").val()
    if (typename.length == 0) {
        show_err("输入为空")
    } else {
        show_loading()
        $.ajax({
            url: "/api/add_type",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ typename: typename }),
            success: function (resp) {
                close_loading()
                if (typeof (resp) == "string")
                    resp = JSON.parse(resp)
                if (resp.code != 0) {
                    show_err(resp)
                } else {
                    $("#add-type-modal").modal("hide")
                    show_info("新增成功", function () {
                        window.location.reload()
                    })
                }
            }
        })
    }
}

// 删除类型
function on_rm_type() {
    if ($("#type-list > ul > li.active").length == 0) {
        show_err("未选择类型")
    } else {

        var tid = $("#type-list > ul > li.active").attr("data")
        tid = Number(tid)
        var typename
        for (var t of types) {
            if (t.id == tid) {
                typename = t.name
                break
            }
        }

        show_danger_confirm("删除类型",
            `<p>是否删除“<span class="text-danger">${typename}</span>”？</p>
            <p class="text-danger">将删除该类型下的所有商品！</p>`,
            "确定删除",
            on_rm_type_confirm)
    }
}

function on_rm_type_confirm() {
    var tid = $("#type-list > ul > li.active").attr("data")
    tid = Number(tid)

    show_loading("删除类型中...")
    $.ajax({
        url: "/api/rm_type",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ "typeid": tid }),
        success: function (resp) {
            if (typeof (resp) == "string")
                resp = JSON.parse(resp)

            if (resp.code != 0) {
                close_loading()
                show_err(resp)
            } else {
                close_loading()
                show_info("已删除该类型", function () {
                    window.location.reload()
                })
            }
        }
    })
}

// 新增商品
var add_good_data = {}

function on_add_good() {
    show_good_modal(add_good_data, "新增商品", on_add_good_confirm)
}

function on_add_good_confirm() {
    if (add_good_data.title == undefined || add_good_data.title.length == 0) {
        show_err("需要主标题")
        return
    } else if (add_good_data.image == undefined) {
        show_err("需要小图")
        return
    }

    var tid = Number($("#type-list li.active").attr("data"))
    var data = new FormData()
    data.append("typeid", tid)
    data.append("title", add_good_data.title)
    if (add_good_data.sub_title != undefined && add_good_data.sub_title.length > 0)
        data.append("sub_title", add_good_data.sub_title)
    data.append("image", add_good_data.image, add_good_data.image.name)
    if (add_good_data.detail_imgs != undefined && add_good_data.detail_imgs.length > 0)
        for (var img of add_good_data.detail_imgs)
            data.append("detail_imgs", img, img.name)

    show_loading("正在上传数据...")
    $.ajax({
        url: "/api/add_good",
        type: "POST",
        processData: false,
        contentType: false,
        data: data,
        success: resp => {
            close_loading()
            if (typeof (resp) == "string")
                resp = JSON.parse(resp)
            if (resp.code == 0) {
                $("#good-modal").modal("hide")
                add_good_data = {}
                show_info("添加成功", () => { window.location.reload() })
            } else {
                show_err(resp)
            }
        }
    })
}

// 编辑商品

var md_good_data = {}

function on_modify_good(event) {
    var good_id = Number($(event.target).parents("tr").attr("good_id"))
    md_good_data = JSON.parse(JSON.stringify(goods[good_id],))
    show_good_modal(md_good_data, "编辑商品", on_modify_good_confirm)
}

function on_modify_good_confirm() {

    show_loading("上传数据中...")
    var detail_imgs_pro = function (resolve, reject) {
        var up_imgs = []
        for (var img of md_good_data.detail_imgs) {
            if (typeof (img) != "string") {
                up_imgs.push(img)
            }
        }

        if (up_imgs.length == 0) {
            resolve(true)
            return
        }

        var data = new FormData()
        for (var f of up_imgs) {
            data.append("image", f)
        }
        $.ajax({
            url: "/api/up_image",
            type: "POST",
            processData: false,
            contentType: false,
            data: data,
            success: resp => {
                if (typeof (resp) == "string") resp = JSON.parse(resp)
                if (resp.code != 0) {
                    resolve(resp)
                } else {
                    resp.data = JSON.parse(resp.data)
                    var index = 0
                    for (var i = 0; i < md_good_data.detail_imgs.length; i++) {
                        if (typeof (md_good_data.detail_imgs[i]) != "string") {
                            md_good_data.detail_imgs[i] = resp.data[index]
                            index++
                        }
                    }
                    resolve(true)
                }
            }
        })
    }

    var image_pro = function (resolve, reject) {
        if (typeof (md_good_data.image) == "string") {
            resolve(true)
            return
        }

        var data = new FormData()
        data.append("image", md_good_data.image)
        $.ajax({
            url: "/api/up_image",
            type: "POST",
            processData: false,
            contentType: false,
            data: data,
            success: resp => {
                if (typeof (resp) == "string") resp = JSON.parse(resp)
                if (resp.code != 0) {
                    resolve(resp)
                } else {
                    resp.data = JSON.parse(resp.data)
                    md_good_data.image = resp.data[0]
                    resolve(true)
                }
            }
        })
    }

    var md_pro = function (resolve, reject) {
        var data = new FormData()
        data.append("goodid", md_good_data.id)
        data.append("title", md_good_data.title)
        data.append("sub_title", md_good_data.sub_title)
        data.append("image", md_good_data.image)
        data.append("detail_imgs", JSON.stringify(md_good_data.detail_imgs))
        $.ajax({
            url: "/api/md_good",
            type: "POST",
            processData: false,
            contentType: false,
            data: data,
            success: resp => {
                if (typeof (resp) == "string") {
                    resp = JSON.parse(resp)
                }
                if (resp.code != 0) {
                    resolve(resp)
                } else {
                    resolve(true)
                }
            }
        })
    }

    async function doIt() {
        for (var step of [detail_imgs_pro, image_pro, md_pro]) {
            var resp = await new Promise(step)
            if (resp != true) {
                close_loading()
                show_err(res)
                return
            }
        }
        close_loading()
        $("#good-modal").modal("hide")
        show_info("修改成功", () => { window.location.reload() })
    }
    doIt()
}

// 删除商品
function on_del_good(event) {
    var good_id = Number($(event.target).parents("tr").attr("good_id"))
    var type_id = Number($("#type-list > ul > li.active").attr("data"))
    var g = goods[good_id]

    show_danger_confirm(
        "删除商品",
        `<p>确定删除<span class="text-danger">${g.title}</span>？</p>`,
        "删除", () => {
            show_loading("删除数据中...")
            var data = new FormData()
            data.append("goodid", good_id)
            data.append("typeid", type_id)
            $.ajax({
                url: "/api/rm_good",
                type: "POST",
                processData: false,
                contentType: false,
                data: data,
                success: resp => {
                    if (typeof (resp) == "string")
                        resp = JSON.parse(resp)
                    close_loading()
                    if (resp.code == 0) {
                        show_info("删除成功", () => window.location.reload())
                    } else {
                        show_err(resp)
                    }
                }
            })
        })
}


// 商品通用弹窗
var good_modal_data

// 打开弹窗
function show_good_modal(data_src, modal_title, callback) {
    good_modal_data = data_src
    // 弹窗标题
    $("#good-modal .modal-title").text(modal_title)
    // 主标题和副标题
    $("#good-modal-title").val(good_modal_data.title != null ? good_modal_data.title : "")
    $("#good-modal-sub-title").val(good_modal_data.sub_title != null ? good_modal_data.sub_title : "")
    $("#good-modal-title").off("change").change(() => { good_modal_data.title = $("#good-modal-title").val() })
    $("#good-modal-sub-title").off("change").change(() => { good_modal_data.sub_title = $("#good-modal-sub-title").val() })
    // 小图
    $("#good_image").html(`<div class="add_img_bg"></div>`)
    if (good_modal_data.image != null) {
        if (typeof (good_modal_data.image) == "string") {
            $("#good_image div").css("background-image", "url(/api/img/" + good_modal_data.image + ")")
        } else {
            var reader = new FileReader();
            reader.readAsDataURL(good_modal_data.image);
            reader.onload = (e) => {
                $("#good_image div").css("background-image", "url(" + e.currentTarget.result + ")")
            };
        }
    }
    $("#good_image .add_img_bg").off("click").click(on_good_set_image)
    // 详情图
    good_modal_init_detail(good_modal_data)
    // 添加按钮事件
    $("#good-confirm").off("click").click(callback)
    $("#good-modal").modal("show")
}

// 新增和更换小图
function on_good_set_image() {
    get_image(false, (fs) => {
        if (fs.length < 1)
            show_err("请选择图片")
        else if (fs.length > 1)
            show_err("只可选择一张图片")
        else if (!fs[0].type.startsWith("image/"))
            show_err("请选择图片")
        else {
            good_modal_data.image = fs[0]
            var reader = new FileReader();
            reader.readAsDataURL(fs[0]);
            reader.onload = function (e) {
                $("#good_image div").css("background-image", "url(" + this.result + ")")
            };
        }
    })
}

// 更新详情图展示
function good_modal_init_detail() {
    $("#good_detail").empty()
    if (good_modal_data.detail_imgs != null) {
        for (var i = 0; i < good_modal_data.detail_imgs.length; i++) {
            $("#good_detail").append(`<li class="img_item" data=${i}></li>`)
            if (typeof (good_modal_data.detail_imgs[i]) == "string") {
                $("#good_detail li:nth-child(" + String(i + 1) + ")").css("background-image", "url(/api/img/" + good_modal_data.detail_imgs[i] + ")")
            } else {
                var reader = new FileReader();
                reader.readAsDataURL(good_modal_data.detail_imgs[i]);
                reader.onload = ((index) => {
                    return (e) => {
                        $("#good_detail li:nth-child(" + String(index + 1) + ")").css("background-image", "url(" + e.currentTarget.result + ")")
                    };
                })(i)
            }
        }
        $("#good_detail li.img_item").click(on_add_good_rm_detail)
    }
    $("#good_detail").append(`<li class="add_img_bg"></li>`)
    $("#good_detail .add_img_bg").click(on_add_good_add_detail)
}

// 新增详情图
function on_add_good_add_detail() {
    get_image(true, (fs) => {
        if (fs.length > 0) {
            for (var f of fs) {
                if (!f.type.startsWith("image/")) {
                    show_err("只可选择图片")
                    return
                }
            }
            if (good_modal_data.detail_imgs == null) good_modal_data.detail_imgs = []
            for (var f of fs) {
                if (!good_modal_data.detail_imgs.find((item) => { return item.name == f.name })) {
                    good_modal_data.detail_imgs.push(f)
                }
            }
            good_modal_init_detail()
        }

    })
}

// 删除一个详情图
function on_add_good_rm_detail(e) {
    var index = Number($(e.currentTarget).attr("data"))
    good_modal_data.detail_imgs.splice(index, 1)
    good_modal_init_detail()
}

// 获取图片
function get_image(multi, callback) {
    $("#good-modal [type='file']").val(null)
    $("#good-modal [type='file']").attr("accept", "image/*")
    if (multi) {
        $("#good-modal [type='file']").attr("multiple", true)
    } else {
        $("#good-modal [type='file']").attr("multiple", false)
    }
    $("#good-modal [type='file']").change(() => {
        $("#good-modal [type='file']").off("change")
        callback($("#good-modal [type='file']")[0].files)
    })
    $("#good-modal [type='file']").click()
}

// 两个基础渲染
function render_goods(good_ids) {
    $("#data-table-body").empty()
    for (var id of good_ids) {
        var g = goods[id]
        if (need_op) {
            $("#data-table-body").append(
                `<tr good_id=${g.id}>
                    <td><img width="50px" height="50px"  src="/api/img/${g.image}"></td>
                    <td>${g.title}</td>
                    <td>${g.sub_title}</td>
                    <td>
                        <button class="btn btn-primary md_good">编辑</button>
                        <button class="btn btn-danger rm_good">删除</button>
                        <button class="btn btn-primary view_good">查看详情</button>
                    </td>
                </tr>`
            )
        } else {
            $("#data-table-body").append(
                `<tr good_id=${g.id}>
                    <td><img width="50px" height="50px"  src="/api/img/${g.image}"></td>
                    <td>${g.title}</td>
                    <td>${g.sub_title}</td>
                    <td>
                        <button class="btn btn-primary view_good">查看详情</button>
                    </td>
                </tr>`
            )
        }
    }
}

function render_types(types) {
    $("#type-list > ul").empty()
    for (var t of types) {
        $("#type-list > ul").append(`<li class="list-group-item" data=${t.id}>${t.name}</li>`)
        $("#type-list li").click(on_type_click)
        $("#type-list li")[0].click()
    }
    if (types.length == 0) {
        bind_op()
    }
}

function bind_op() {
    if (need_op) {
        $("#add_type").off("click").click(on_add_type)
        $("#add-type-confirm").off("click").click(on_add_type_confirm)
        $("#rm_type").off("click").click(on_rm_type)
        $("#rm-type-confirm").off("click").click(on_rm_type_confirm)

        $(".md_good").off("click").click(on_modify_good)
        $(".rm_good").off("click").click(on_del_good)
        $("#add_good").off("click").click(on_add_good)
    } else {
        $("#add_type").remove()
        $("#rm_type").remove()
        $("#add_good").remove()
        $("#data-table-head tr th:last-child()").remove()
    }
    $(".view_good").off("click").click(on_view_good)
}

$(function () {
    show_loading("数据加载中。。。")
    $.ajax({
        url: dataurl,
        type: "GET",
        success: function (resp) {
            resp = JSON.parse(resp)
            if (resp.code != 0) {
                show_err(resp)
            } else {
                var data = JSON.parse(resp.data)
                types = data.types
                goods = {}
                for (var g of data.goods) {
                    goods[g.id] = g
                }

                render_types(types)
                close_loading()
            }
        }
    })
})