
const {Matrix} = require("matrixjs-core")
const {ipcRenderer}= require("electron")
const canvas=document.getElementById("canvas");
const jimp=require("jimp")
const canvasViewer=document.getElementById("canvasViewer");
const canvasViewerCtx=canvasViewer.getContext("2d",{
  willReadFrequently:true
});
const ctx=canvas.getContext("2d",{
  willReadFrequently:true
});


const grabImage=(ctx)=>{
  
  const imageData=ctx.getImageData(0,0,1024,768);
  const dataArray = imageData.data
  const  rgbArray = []
  let row=[]
  let c=0;
  for (var i = 0; i < dataArray.length; i+=4) {
      c++;
      row.push(dataArray[i]*0.3+dataArray[i+1]*0.59+dataArray[i+2]*0.11)
      if(c===1024){
         rgbArray.push(row)
         row=[]
         c=0;
      }
  }
  const mat=new Matrix(rgbArray,"UInt8");
  return mat;
}

const showImage=(frame)=>{
  const flatted=frame.clone().flat();
  const imageData=canvasViewerCtx.getImageData(0,0,frame.getX(),frame.getY());
  const data = imageData.data
  let k=0;
  for(let i=0;i<data.length;i+=4){
    data[i]=flatted[k]
    data[i+1]=flatted[k]
    data[i+2]=flatted[k]
    data[i+3]=255
    k++;
  }

  canvasViewerCtx.putImageData(imageData,0,0);

}

const toJimpImage=(frame)=>{
  const array=frame.clone()
  const test=new jimp(frame.getX(),frame.getY());
  const bitmap=test.bitmap;
  const fleatted=array.flat();
  let i=0;
  test.scan(0, 0, frame.getX(),frame.getY(), function (_x,_y, idx) {
     
      bitmap.data[idx + 0] = fleatted[i]
      bitmap.data[idx + 1] = fleatted[i]
      bitmap.data[idx + 2] = fleatted[i]
      bitmap.data[idx + 3] = 255
      i++;
     })
  return test; 
}

const jimpImageToMatrix=(image,dataType,gray=true)=>{
  let row=[]
  const myarray=[]
  let k=0;

  
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            
      if(gray)
       row.push(image.bitmap.data[idx + 0]);
      k++;
      if(k===image.bitmap.width){
          myarray.push(row);
          k=0;
          row=[]
      }
      

  })
  return new Matrix(myarray,dataType);
 
}

ipcRenderer.on("SET_SOURCE",async (sourceId)=>{
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      deviceId:sourceId,
      aspectRatio:4/3
    },
  }).then((stream)=>{
    const video=document.getElementById("video");
    video.srcObject=stream;

    const renderer=()=>{
      ctx.drawImage(video,0,0,1024,768)
      const frame=grabImage(ctx);
      const jimpImage=toJimpImage(frame).blur(3)
      const blur=jimpImageToMatrix(jimpImage,"UInt8")
     
      showImage(blur.transpose())
      window.requestAnimationFrame(renderer);
    }
    renderer();
  })
})
