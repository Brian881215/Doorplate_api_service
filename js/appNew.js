$(async function() {

    document.getElementById('my_test').addEventListener('change', function(event) { //my_test 為觸發運作的按鈕
    let files = event.target.files; //選取之目標目錄內的檔案清單
    let listing = document.getElementById('pics_area'); //(透過id)取得要放置圖片的標籤位置

    for(let i=0; i<files.length; i++) {
        let item = document.createElement("img");   //產生圖片標籤
        item.src = files[i].webkitRelativePath; //設定圖片的來源位置
        item.style.padding = "50px 10px 20px 30px"; //排版用
        listing.appendChild(item);
        alert(files[i].webkitRelativePath);
    }
    });

    let click_button = document.querySelector("#click-photo");
    let canvas = document.querySelector("#canvas");


		// 擷取照片
			// $("#output_box img").remove();
			// $("#canvas").css("z-index","101");

   //          var w = $("#video").attr("width");
   //          var h = $("#video").attr("height");
   //          console.log(w);//畫面的寬
   //          console.log(h);//畫面的高
   //          var file;

   //          // 製作畫布
   //          $("#canvas").attr({"width":w,"height":h});
   //          var ctx = canvas.getContext("2d");
   //          ctx.drawImage(video, 0, 0, w, h);
   //          ctx.save();
   //          var base64img = canvas.toDataURL('image/jpg',1.0);
   //          // console.log(base64img)

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
                    file = dataURLtoFile(base64img,'image.jpg');
                    console.log(file);

                })
            }

            // // 在 output_box 中添加 image
            // await base64ToImage(base64img, function(img){
            //     document.getElementById('output_box').appendChild(img);
            //     $("#output_box img").attr({"id":"salad","crossorigin":"anonymous"});

            //     run();
            // })

            // // 進行門牌辨識
            // async function run() {
            //     var formData = new FormData();
            //     var coordinate = {
            //         longitude:"",
            //         latitude:""
            //     }

                // 畫門牌標住紅框並進行裁切與另存圖片
                function showFrame(){
                    return new Promise((resolve, reject)=>{
                        if(predictions !== null){
                            console.log(predictions);
                            var info = predictions[0].box;
                            console.log(typeof(info.left));
                            console.log(info.top);
                            console.log(info.width);
                            console.log(info.height);
                            $("#frame").css({"top":info.top,"left":info.left,"width":info.width,"height":info.height,"visibility":"visible"});
                        }
                    })
                }
                // 取得經緯度
                function getCoords(sendData){

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
                // post API， 上傳圖片與經緯度資料
                // function sendData(coordinate){
                //      console.log(file);
                //      console.log(coordinate);

                //     formData.append("files",file);
                //     formData.append("longitude", coordinate["longitude"]);
                //     formData.append("latitude", coordinate["latitude"]);

                //     const xhr = new XMLHttpRequest();
                //     xhr.responseType = 'json';
                //     xhr.open('post', "https://asia-east1-sinyi-eco-data.cloudfunctions.net/me30_doorplate/api/image-to-address");
                //     xhr.onload = function(){
                //         const res = xhr.response;
                //         $("#address").text(res.address);
                //     }
                //     console.log(formData);
                //     xhr.send(formData);
                // }



                function cropImg(){

                    var element = document.getElementById('frame'),
                    style = window.getComputedStyle(element),
                    top = style.getPropertyValue('top');
                    // console.log(top);
                    const topInt = parseInt(top, 10);
                    var topStr = Number(topInt.toString());
                    left=style.getPropertyValue('left');
                    const leftInt = parseInt(left, 10);
                    var leftStr = Number(leftInt.toString());
                    // console.log(typeof(leftStr));
                    // console.log(leftStr);
                    width=style.getPropertyValue('width');
                    const widthInt = parseInt(width, 10);
                    var widthStr = Number(widthInt.toString());
                    // console.log(widthStr);
                    height=style.getPropertyValue('height');
                    const heightInt = parseInt(height, 10);
                    var heightStr = Number(heightInt.toString());

                    $("#canvas").attr({"width":widthStr,"height":heightStr});
                    ctx.drawImage(img,leftStr,topStr,widthStr,heightStr,0,0,widthStr,heightStr);
                    ctx.save();
                    var tmp_img_data=canvas.toDataURL('image1/jpg',1.0);
                    // console.log(tmp_img_data);

                    const downloadBtn = document.querySelector("button.download");
                    //bind a click listener to the download button
                    downloadBtn.addEventListener('click', function() {
                        //create a temporary link for the download item
                        let tempLink = document.createElement('a');

                        //generate a new filename
                        let fileName = `image-cropped.jpg`;

                        //configure the link to download the resized image
                        tempLink.download = fileName;
                        tempLink.href = tmp_img_data;

                        //trigger a click on the link to start the download
                        tempLink.click();
                     })
                }
                console.log("Brian is testing now!")
                // 進行門牌辨識
                const model = await tf.automl.loadObjectDetection('tensorflow/model.json');
                // const model =  tf.automl.loadObjectDetection('tensorflow/model.json');
                const img = document.getElementById('salad');
                console.log(typeof(img));
                const options = {score: 0.5, iou: 0.5, topk: 20};
                const predictions = await model.detect(img, options);
                // const predictions = model.detect(img, options);
                showFrame();
                cropImg();
                // getCoords().then((coordinate)=>{
                //     console.log("sendData");
                //     sendData(coordinate);
                // },()=>{
                //     console.log("失敗！");
                // })
            })

