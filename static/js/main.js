window.onload = function() {
    $("#upload_btn").click(function() {
        // let f = $('#file_input')[0].files[0]
        // console.log(f)
        console.log("假装已经在这里做完了检查")

        $.ajax({
            url: '/api/upload_img',
            type: 'POST',
            cache: false,
            data: new FormData($('#upload_file_form')[0]),
            processData: false,
            contentType: false,
            success: function(resp) {
                console.log(resp)
            }
        })
    })

    $("#get_data").click(function() {
        $.ajax({
            url: '/api/get_data',
            type: "GET",
            success: function (resp) {
                console.log(resp)
                resp = JSON.parse(resp)
                if (resp.code == 0) {
                    console.log(resp.data)
                }
            }
        })
    })
}
