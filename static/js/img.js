HeadHtml =
    `<tr>
        <th>ID</th>
        <th>原文件名</th>
        <th>存档文件名</th>
        <th>预览</th>
        <th>操作</th>
    </tr>`

templateItem = function (item) {
    return `
    <tr>
        <td>${item.id}</td>
        <td>${item.origin_filename}</td>
        <td>${item.filename}</td>
        <td style="width:100px; height:100px">
            <img src="/api/images/${item.filename}" />
        </td>
        <td><button class="btn btn-danger" onclick="on_click_remove(${item.id})">删除</button></td>
    </tr>
    `
}

// 相关监听事件

function on_click_remove(img_id) {
    console.log(img_id)
    show_info("后续再做吧")
}

$(function () {

    // 上传相关的事件监听

    $("#file-chooser>input").change(function () {
        let fs = $('#file_input')[0].files
        if (fs.length > 0) {
            $("#filename").text("已选择：" + fs[0].name)
        }
    })
    $("#upload_btn").click(function () {
        let fs = $('#file_input')[0].files
        if (fs.length == 0) {
            show_err("未选择文件")
        } else if (fs.length > 1) {
            show_err("暂不支持上传多文件")
        } else {
            show_loading("上传中...")
            var data = new FormData()
            data.append("file", fs[0])
            $.ajax({
                url: '/api/upload_img',
                type: 'POST',
                cache: false,
                data: data,
                processData: false,
                contentType: false,
                success: function (resp) {
                    close_loading()
                    resp = JSON.parse(resp)
                    if (resp.code == 0) {
                        show_info("上传成功", function () {
                            location.reload();
                        })
                    } else {
                        show_err("上传失败，返回信息：" + resp)
                    }
                    console.log(resp)
                }
            })
        }
    })

    // 刷新数据

    show_loading("从服务器加载数据")
    $.ajax({
        url: "/api/get_img_list",
        type: 'GET',
        success: function (resp) {
            resp = JSON.parse(resp)
            if (resp.code != 0) {
                close_loading()
                show_err("拉取信息失败：" + resp)
            } else {
                var data = JSON.parse(resp.data)
                dataset = data
                render_page()
                close_loading()
            }
        }
    })
})
