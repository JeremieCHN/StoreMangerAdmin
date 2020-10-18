$(function() {
    $("#login_btn").click(function() {
        let username = $("#username").val()
        let password = $("#password").val()
        if (username.length == 0) {
            $("#error-message").text("用户名为空")
            $("#error-modal").modal()
        } else if (password.length == 0) {
            $("#error-message").text("密码为空")
            $("#error-modal").modal()
        } else {
            $("#login_btn").text("登录中");
            $("#login_btn").attr("disabled", true);
            $.ajax({
                url: "/api/login",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ username: username, password: password }),
                success: function(resp) {
                    let res = JSON.parse(resp)
                    if (res.code == 0)
                        window.location = '/admin'
                    else {
                        $("#error-message").text("登录失败，请检查用户名和密码")
                        $("#error-modal").modal()
                        $("#login_btn").text("登录");
                        $("#login_btn").attr("disabled", false);
                    }
                }
            })
        }
    })
})
