$(function() {
    let camera_button = document.querySelector("#start-camera");
        let video = document.querySelector("#video");
        let click_button = document.querySelector("#click-photo");
        let canvas = document.querySelector("#canvas");

		// 啟動拍攝
		camera_button.addEventListener('click', async function() {
            $("#frame").css("visibility","hidden");
			$("#video").css("z-index","100");
			$("#canvas").css("z-index","99");

            if($(window).width() > 640){
                $("#video").attr("width",640);
                $("#video").attr("height",480);
            }else {
                $("#video").attr("width",240);
                $("#video").attr("height",320);
            }

            let stream = await navigator.mediaDevices.getUserMedia(
                { video: {
                    facingMode:"environment"
                }, 
                  audio: false }
            );
            video.srcObject = stream;
        });
		// 擷取照片
		click_button.addEventListener('click', function() {
			$("#output_box img").remove();
			$("#canvas").css("z-index","101");

            var w = $("#video").attr("width");
            var h = $("#video").attr("height");

            $("#canvas").attr("width",w);
            $("#canvas").attr("height",h);

            canvas.getContext('2d').drawImage(video, 0, 0, w, h);
            var base64img = canvas.toDataURL('image/jpg',1.0);
            // console.log(base64img);

            // 將 base64 轉成img
            function base64ToImage(base64img, callback) {
                var img = new Image();
                img.onload = function() {
                    callback(img);
                }

                img.src = base64img;
                // img.src="./images/plate.jpg";
                // img.src="https://storage.googleapis.com/tfjs-testing/tfjs-automl/object_detection/test_image.jpg";
            }

            // 在 output_box 中添加 image
            base64ToImage(base64img, function(img){
                document.getElementById('output_box').appendChild(img);
                $("#output_box img").attr("id","salad");
                $("#output_box img").attr("crossorigin","anonymous");

                run();
            })

            // 進行門牌辨識
            async function run() {

                await console.log($("#salad").css("width"));
                await console.log($("#salad").css("height"));
                await console.log($("#salad").attr("src"));

                const model = await tf.automl.loadObjectDetection('../tensorflow/model.json');
                const img = document.getElementById('salad');
                const options = {score: 0.5, iou: 0.5, topk: 20};
                const predictions = await model.detect(img, options);
                // 印出資訊
                await console.log(predictions);

                await showFrame();


                function showFrame(){
                    if(predictions !== null){
                        var info = predictions[0].box;
    
                        $("#frame").css("top",info.top);
                        $("#frame").css("left",info.left);
                        $("#frame").css("width",info.width);
                        $("#frame").css("height",info.height);
                        $("#frame").css("visibility","visible");
                    }
                }
            }
        });    
});