// A model matches only when one of its variants satisfies every variant filter.
(function(root){
 const discounted=v=>Number.isFinite(v.price)&&Number.isFinite(v.oldPrice)&&v.oldPrice>v.price;
 function matchingVariants(p,f={}){
  if(f.gender&&p.gender!==f.gender&&!(p.gender==='unisex'&&['men','women'].includes(f.gender)))return [];
  const min=f.min===''||f.min==null?null:Number(f.min),max=f.max===''||f.max==null?null:Number(f.max);
  if((min!=null&&(!Number.isFinite(min)||min<0))||(max!=null&&(!Number.isFinite(max)||max<0))||(min!=null&&max!=null&&min>max))return [];
  return p.variants.flatMap((v,i)=>{
   if(f.color&&v.color!==f.color)return [];
   if((min!=null||max!=null)&&!Number.isFinite(v.price))return [];
   if(min!=null&&v.price<min||max!=null&&v.price>max)return [];
   if(f.sale&&!discounted(v))return [];
   return [i];
  });
 }
 root.catalogFilters={discounted,matchingVariants};
})(globalThis);
