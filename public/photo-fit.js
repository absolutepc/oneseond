/* Fit the visible watch silhouette, rather than the transparent image canvas. */
(function(root){
 const bounds={
  'qmg1226-360.webp':{width:301,height:600,left:0,top:0,right:301,bottom:600},
  'qmg1226-370.webp':{width:301,height:600,left:0,top:0,right:301,bottom:600},
  'pwg1014-075.webp':{width:344,height:600,left:0,top:0,right:344,bottom:600},
  'pwg1014-375.webp':{width:338,height:600,left:0,top:0,right:338,bottom:600},
  'pwg1014-499.webp':{width:356,height:600,left:0,top:0,right:356,bottom:600},
  'pwg930-390.webp':{width:1254,height:1254,left:297,top:90,right:1011,bottom:1208},
  'pwg930-370.webp':{width:1122,height:1402,left:131,top:17,right:1001,bottom:1386},
  'pwg1092-380.webp':{width:362,height:600,left:0,top:0,right:362,bottom:600},
  'pwg1092-370.webp':{width:362,height:600,left:0,top:0,right:362,bottom:600}
 };
 function placement(boxWidth,boxHeight,b){
  if(!boxWidth||!boxHeight)return null;
  const fitted=Math.min(boxWidth/b.width,boxHeight/b.height);
  const visible=Math.min(boxWidth*.9/(b.right-b.left),boxHeight*.9/(b.groupAspect?(b.right-b.left)*b.groupAspect:b.bottom-b.top));
  return {scale:visible/fitted,x:-(b.left+b.right-b.width)*visible/2,y:-(b.top+b.bottom-b.height)*visible/2};
 }
 root.watchPhotoFit={bounds,placement};
 if(typeof document==='undefined')return;
 const selector='.image-button img,#mainPhoto,.gallery-thumbnails img,#zoomImage';
 const observed=new WeakSet();
 const measured=new Map();
 function imageBounds(img,src){
  const name=src.pathname.split('/').pop();
  const known=src.origin===location.origin&&src.pathname.includes('/assets/catalog/')?bounds[name]:null;
  if(known)return known;
  if(!img.complete||!img.naturalWidth)return null;
  if(measured.has(src.href))return measured.get(src.href);
  let result=null;
  try{
   const ratio=Math.min(1,512/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));
   const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(img,0,0,canvas.width,canvas.height);
   const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
   let left=canvas.width,top=canvas.height,right=0,bottom=0,transparent=false;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const alpha=pixels[(y*canvas.width+x)*4+3];if(alpha<32)transparent=true;
    if(alpha>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   }
   if(transparent&&right>left&&bottom>top)result={width:canvas.width,height:canvas.height,left,top,right,bottom};
  }catch{/* Cross-origin photos retain their normal contain layout. */}
  measured.set(src.href,result);return result;
 }
 function fit(img){
  const src=new URL(img.getAttribute('src')||'',document.baseURI);
  const b=imageBounds(img,src);
  if(!b){if(img.dataset.watchFitted){img.style.removeProperty('transform');img.style.removeProperty('transition');delete img.dataset.watchFitted}return;}
  const p=placement(img.clientWidth,img.clientHeight,b);if(!p)return;
  img.style.transform=`translate(${p.x}px,${p.y}px) scale(${p.scale})`;
  img.style.transformOrigin='50% 50%';img.style.transition='none';img.dataset.watchFitted='true';
 }
 const resize=new ResizeObserver(entries=>entries.forEach(({target})=>fit(target)));
 function observe(img){if(observed.has(img))return;observed.add(img);resize.observe(img);img.addEventListener('load',()=>fit(img));fit(img);}
 function scan(node){if(node.nodeType!==1)return;if(node.matches(selector))observe(node);node.querySelectorAll(selector).forEach(observe);}
 scan(document.documentElement);
 new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.target.matches(selector))fit(r.target);for(const node of r.addedNodes)scan(node);}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
})(globalThis);
