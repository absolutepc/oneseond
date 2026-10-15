(() => {
 const {product:p,whatsapp}=JSON.parse(document.getElementById('productData').textContent);
 const $=id=>document.getElementById(id), imageUrl=v=>v.image.startsWith('assets/')?'/'+v.image:v.image;
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
 const notice=text=>$('productNotice').textContent=text;
 let index=Math.max(0,p.variants.findIndex(v=>v.ref===new URL(location.href).searchParams.get('color')));
 function render(updateUrl=false){
  const v=p.variants[index],url=new URL(location.href);url.searchParams.set('color',v.ref);
  if(updateUrl)history.replaceState(null,'',url);
  $('mainPhoto').src=imageUrl(v);$('mainPhoto').alt=p.brand+' '+p.name+' '+v.color;
  $('productReference').textContent='Артикул: '+v.ref;$('productColor').textContent='Цвет: '+v.color;
  $('productPrice').textContent=v.price==null?'Цена по запросу':v.price.toLocaleString('ru-RU')+' ₽';
  $('productStock').textContent=({in_stock:'В наличии',out_of_stock:'Нет в наличии',preorder:'Под заказ'}[v.stock]||'Наличие уточняется');
  $('addToCart').disabled=v.stock==='out_of_stock';
  const contact=new URL(whatsapp);contact.searchParams.set('text','Здравствуйте! Подскажите цену и наличие: '+p.brand+' '+p.name+'\nАртикул: '+v.ref+'\nЦвет: '+v.color+'\n'+url.href);$('inquire').href=contact.href;
  document.querySelectorAll('[data-color-index]').forEach(b=>{const active=Number(b.dataset.colorIndex)===index;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active)});
 }
 p.variants.forEach((v,i)=>{
  const thumb=document.createElement('button');thumb.dataset.colorIndex=i;thumb.setAttribute('aria-label','Показать '+v.color);const image=document.createElement('img');image.src=imageUrl(v);image.alt=v.color;image.loading='lazy';thumb.append(image);$('galleryThumbnails').append(thumb);
  const swatch=document.createElement('button');swatch.className='swatch';swatch.dataset.colorIndex=i;swatch.setAttribute('aria-label',v.color+' — '+v.ref);swatch.title=v.color;const dot=document.createElement('span');dot.style.background=v.hex;swatch.append(dot);$('productColors').append(swatch);
  [thumb,swatch].forEach(b=>b.addEventListener('click',()=>{index=i;render(true)}));
 });
 $('addToCart').onclick=()=>{const v=p.variants[index];if(v.stock==='out_of_stock')return;try{const cart=read('os-real-cart',{}),key=p.id+'::'+v.ref;cart[key]=(Number.isInteger(cart[key])?cart[key]:0)+1;localStorage.setItem('os-real-cart',JSON.stringify(cart));notice('Выбранный цвет добавлен в корзину. Корзина доступна в каталоге.')}catch{notice('Браузер не разрешает сохранить корзину.')}};
 function favorite(){const list=read('os-real-fav',[]);return Array.isArray(list)?list:[]}
 function favoriteState(){const active=favorite().includes(p.id);$('saveFavorite').setAttribute('aria-pressed',String(active));$('saveFavorite').textContent=active?'В избранном ♥':'В избранное'}
 $('saveFavorite').onclick=()=>{try{const list=favorite();localStorage.setItem('os-real-fav',JSON.stringify(list.includes(p.id)?list.filter(id=>id!==p.id):[...list,p.id]));favoriteState()}catch{notice('Не удалось сохранить избранное.')}};
 $('zoomPhoto').onclick=()=>{$('zoomImage').src=$('mainPhoto').src;$('zoomImage').alt=$('mainPhoto').alt;$('photoDialog').showModal()};
 $('photoDialog').querySelector('.close').onclick=()=>$('photoDialog').close();
 window.addEventListener('popstate',()=>{index=Math.max(0,p.variants.findIndex(v=>v.ref===new URL(location.href).searchParams.get('color')));render()});
 favoriteState();render();
})();
