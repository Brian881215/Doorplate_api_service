$(function() {
    let camera_button = document.querySelector("#start-camera");
    let video = document.querySelector("#video");
    let click_button = document.querySelector("#click-photo");
    let canvas = document.querySelector("#canvas");
    var tmp_img_data;
		// 啟動拍攝
		camera_button.addEventListener('click', async function() {
            $("#frame").css("visibility","hidden");
			$("#video").css("z-index","100");
			$("#canvas").css("z-index","99");

            if($(window).width() > 640){
                $("#video").attr({"width":640,"height":480});
            }else {
                $("#video").attr({"width":240,"height":320});
            }

            let stream = await navigator.mediaDevices.getUserMedia(
                { 
                    video: {
                        facingMode:"environment"
                    }, 
                    audio: false }
            );
            video.srcObject = stream;
        });

		// 擷取照片
		click_button.addEventListener('click', async function() {

			$("#output_box img").remove();
			$("#canvas").css("z-index","101");
            var w = $("#video").attr("width");
            var h = $("#video").attr("height");
            console.log(w);//畫面的寬
            console.log(h);//畫面的高
            var file;
            // 製作畫布
            $("#canvas").attr({"width":w,"height":h});
            var ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, w, h);
            ctx.save();
            var base64img = canvas.toDataURL('image/jpg',1.0);
            // console.log(base64img)

            // base64 轉 file
            function dataURLtoFile(dataurl, filename) {
                var arr = dataurl.split(',');
                var mime = arr[0].match(/:(.*?);/)[1];
                var bstr = atob(arr[1]);
                var n = bstr.length;
                var u8arr = new Uint8Array(n);

                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }
                
                return new File([u8arr], filename, {type:mime});
            }

            // 將 base64 轉成img
            function base64ToImage(base64img, callback) {
                return new Promise((resolve, reject)=>{
                    var img = new Image();
                    img.onload = function() {
                        callback(img);
                    }
                    img.src = base64img;
                    // console.log(img);
                    // 進行轉檔
                    dataURLtoFile(base64img);
                    console.log(base64img);
                    file = dataURLtoFile(base64img,'image.jpg');
                    // console.log(file);
                })

        }
        
            // 在 output_box 中添加 image
            await base64ToImage(base64img, function(img){
                document.getElementById('output_box').appendChild(img);
                $("#output_box img").attr({"id":"salad","crossorigin":"anonymous"});
                
                run();
            })
           
            async function run() {
                var formData = new FormData();
                var coordinate = {
                    longitude:"",
                    latitude:""
                }

                // 畫門牌標住紅框並進行裁切與另存圖片
                function showFrame(){
                    return new Promise((resolve, reject)=>{
                        if(predictions !== null){
                            console.log(predictions);
                            var info = predictions[0].box;
                            // console.log(info)
                            // console.log('hello');
                            console.log(typeof(info.left));
                            console.log(info.top);
                            console.log(info.width);
                            console.log(info.height);
                            $("#frame").css({"top":info.top,"left":info.left,"width":info.width,"height":info.height,"visibility":"visible"});
                            cropImg(info.left,info.top,info.width,info.height)
                        }
                    })
                }
              
                // 取得經緯度
                function getCoords(sendData){
                    // coordinate["longitude"] = "121.56596574216742";
                    // coordinate["latitude"] = "25.032643609326463";

                    if("geolocation" in navigator) {
                        return new Promise((resolve,reject)=>{
                            navigator.geolocation.getCurrentPosition((position)=>{
                                // 設定經緯度
                                coordinate["longitude"] = position.coords.longitude;
                                coordinate["latitude"] = position.coords.latitude;
                                resolve(coordinate)
                            },error)
    
                            var error = () => {
                                console.log(error.code);
                            }
                        })
                    } else {
                        console.log("There's no geolocation");
                    }
                }

                // post API，// 上傳圖片與經緯度資料
                function sendData(coordinate){
                     console.log(file);
                     console.log(coordinate);

                    formData.append("files",file);
                    formData.append("longitude", coordinate["longitude"]);
                    formData.append("latitude", coordinate["latitude"]);
                    
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'json';
                    xhr.open('post', "https://asia-east1-sinyi-eco-data.cloudfunctions.net/me30_doorplate/api/image-to-address");
                    xhr.onload = function(){
                        const res = xhr.response;
                        $("#address").text(res.address);
                    }
                    console.log(formData);
                    xhr.send(formData);   
                }

                function cropImg(leftStr,topStr,widthStr,heightStr){

                    // var element = document.getElementById('frame'),
                    // style = window.getComputedStyle(element),

                    // top = style.getPropertyValue('top');
                    // // console.log(top);
                    // const topInt = parseInt(top, 10);
                    // var topStr = Number(topInt.toString());
                    // left=style.getPropertyValue('left');
                    // const leftInt = parseInt(left, 10);
                    // var leftStr = Number(leftInt.toString());
                    // // console.log(typeof(leftStr));
                    // // console.log(leftStr);
                    // width=style.getPropertyValue('width');
                    // const widthInt = parseInt(width, 10);
                    // var widthStr = Number(widthInt.toString());
                    // // console.log(widthStr);
                    // height=style.getPropertyValue('height');
                    // const heightInt = parseInt(height, 10);
                    // var heightStr = Number(heightInt.toString());

                    $("#canvas").attr({"width":widthStr,"height":heightStr});
                    ctx.drawImage(img,leftStr,topStr,widthStr,heightStr,0,0,widthStr,heightStr);
                    ctx.save();
                    $("#frame").css("visibility","hidden");
                    tmp_img_data=canvas.toDataURL('image1/png',1.0);
                    console.log(tmp_img_data);
                    file =  dataURLtoFile(tmp_img_data,'image.jpg');

                    const downloadBtn = document.querySelector("button.download");
                    //bind a click listener to the download button
                    downloadBtn.addEventListener('click', function() {
                        //create a temporary link for the download item
                        let tempLink = document.createElement('a');
                        //generate a new filename
                        let fileName1 = `image-cropped.jpg`;
                        //configure the link to download the resized image
                        tempLink.download = fileName1;
                        tempLink.href = tmp_img_data;    
                        //trigger a click on the link to start the download
                        tempLink.click();
                     })
                }
             


                // 進行門牌辨識
                // const model = await tf.automl.loadObjectDetection('../tensorflow/model.json');
                const model = await tf.automl.loadObjectDetection('tensorflow/model.json');
                const img = document.getElementById('salad');
                console.log(img);
                // console.log(typeof(img));
                const options = {score: 0.5, iou: 0.5, topk: 20};
                // console.log(tmp_img_data);
                const predictions = await model.detect(img, options);                

                showFrame();
                cropImg();
                getCoords().then((coordinate)=>{
                    console.log("sendData1");
                    sendData(coordinate);
                },()=>{
                    console.log("失敗！");
                })
            }
        });    
});