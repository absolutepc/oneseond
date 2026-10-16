const assert=require('node:assert/strict');
require('../public/photo-fit.js');
const {bounds,placement}=globalThis.watchPhotoFit;
for(const [width,height] of [[300,250],[150,132],[110,96],[400,420],[640,540]]){
 const heights=[];
 for(const b of Object.values(bounds)){
  const p=placement(width,height,b),fitted=Math.min(width/b.width,height/b.height);
  const visibleHeight=(b.bottom-b.top)*fitted*p.scale,visibleWidth=(b.right-b.left)*fitted*p.scale;
  assert(visibleWidth<=width*.9+.001&&visibleHeight<=height*.9+.001);
  const centerX=width/2+(b.left+b.right-b.width)/2*fitted*p.scale+p.x;
  const centerY=height/2+(b.top+b.bottom-b.height)/2*fitted*p.scale+p.y;
  assert(Math.abs(centerX-width/2)<.001);assert(Math.abs(centerY-height/2)<.001);
  heights.push(visibleHeight);
 }
 assert(Math.abs(heights[0]-heights[1])<.001,'Variant silhouettes should have equal visible heights');
}
assert.equal(placement(0,0,Object.values(bounds)[0]),null);
console.log('Watch photos: equal visible heights and centered silhouettes across cards, thumbnails and gallery sizes.');

for(const [w,h] of [[300,250],[150,132],[400,420]]){
 const widths=['pwg1092-380.webp','pwg1092-370.webp'].map(name=>{
  const b=bounds[name],p=placement(w,h,b);
  return (b.right-b.left)*Math.min(w/b.width,h/b.height)*p.scale;
 });
 assert(Math.abs(widths[0]-widths[1])<.001,'PWG1092 cases must have equal widths');
}
