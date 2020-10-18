$(function () {
    $("#logout-btn").click(function () {
        console.log("click")
        $.ajax({
            url: '/api/logout',
            type: 'GET'
        }).done(function () {
            window.location = '/admin/login'
        })
    })
    $("#loading-modal").modal({
        backdrop: "static",
        keyboard: false,
        show: false
    })
})

function show_err(msg) {
    if (typeof(msg) != "string") {
        var code = msg.code
        $("#dialog-title").html(`<span class='text-danger'>错误(${code})</span>`)
        msg = msg.data
        if (code == 1) {
            msg = "未登录，将于5s后跳转到登录页面"
            setTimeout(() => { window.location = "/admin/login" }, 3000)
        }
    } else {
        $("#dialog-title").html("<span class='text-danger'>错误</span>")
    }
    $("#dialog-message").text(msg)
    $("#alert-modal").modal()
}

function show_info(msg, callback) {
    if (typeof callback !== 'undefined') {
        $("#alert-modal").off('hidden.bs.modal').on('hidden.bs.modal', callback)
    }
    $("#dialog-title").html("提示")
    $("#dialog-message").text(msg)
    $("#alert-modal").modal()
}

function show_loading(msg) {
    $("#loading-message").text(msg)
    $("#loading-modal").modal("show")
}

function close_loading() {
    $("#loading-modal").modal("hide")
}

function show_danger_confirm(title, msg, btn, callback) {
    $("#danger-confirm-modal .modal-title").text(title)
    $("#danger-confirm-modal .modal-body").html(msg)
    $("#danger-confirm").text(btn)
    $("#danger-confirm").off("click").click(() => {
        $("#danger-confirm-modal").modal("hide")
        callback()
    })
    $("#danger-confirm-modal").modal("show")
}
