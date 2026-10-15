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
 $('addToCart').onclick=()=>{const v=p.variants[index];if(v.stock==='out_of_stock')return;try{const cart=read('os-real-cart',{}),key=p.id+'::'+v.ref;cart[key]=(Number.isInteger(cart[key])?cart[key]:0)+1;localStorage.setItem('os-real-cart',JSON.stringify(cart));refreshHeader();notice('Выбранный цвет добавлен в корзину. Корзина доступна в каталоге.')}catch{notice('Браузер не разрешает сохранить корзину.')}};
 function favorite(){const list=read('os-real-fav',[]);return Array.isArray(list)?list:[]}
 function favoriteState(){const active=favorite().includes(p.id);$('saveFavorite').setAttribute('aria-pressed',String(active));$('saveFavorite').textContent=active?'В избранном ♥':'В избранное'}
 $('saveFavorite').onclick=()=>{try{const list=favorite();localStorage.setItem('os-real-fav',JSON.stringify(list.includes(p.id)?list.filter(id=>id!==p.id):[...list,p.id]));favoriteState();refreshHeader()}catch{notice('Не удалось сохранить избранное.')}};
 $('zoomPhoto').onclick=()=>{$('zoomImage').src=$('mainPhoto').src;$('zoomImage').alt=$('mainPhoto').alt;$('photoDialog').showModal()};
 $('photoDialog').querySelector('.close').onclick=()=>$('photoDialog').close();
 window.addEventListener('popstate',()=>{index=Math.max(0,p.variants.findIndex(v=>v.ref===new URL(location.href).searchParams.get('color')));render()});

 function refreshHeader(){
   const cart=read('os-real-cart',{}),count=Object.values(cart).reduce((n,q)=>n+(Number.isInteger(q)&&q>0?q:0),0);
   [['[data-cart-count]',count],['[data-fav-count]',favorite().length]].forEach(([selector,total])=>document.querySelectorAll(selector).forEach(node=>{node.textContent=total;if(node.classList.contains('nav-count'))node.hidden=total===0}));
 }
 document.querySelectorAll('#favorites,[data-shop-action="favorites"]').forEach(b=>b.onclick=()=>location.assign('/?view=favorites#catalog'));
 document.querySelectorAll('#cartBtn,[data-shop-action="cart"]').forEach(b=>b.onclick=()=>location.assign('/?view=cart#catalog'));
 const menu=$('mobileMenu');
 document.querySelectorAll('[data-menu-open]').forEach(b=>b.onclick=()=>menu.showModal());
 document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 const information={
 delivery:['Доставка и оплата','Условия доставки, оплаты и сроки уточняйте у магазина.'],
 returns:['Гарантия и возврат','Условия гарантии и возврата выбранной модели уточняйте у магазина.'],
 contacts:['Связаться с нами','Instagram: @one_second. Telegram: @onesecondwatch. Напишите нам через ссылки в футере.'],
 privacy:['Конфиденциальность','Избранное и состав корзины сохраняются локально в вашем браузере.']
 };
 document.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>{const [title,text]=information[b.dataset.info];const heading=document.createElement('h2'),paragraph=document.createElement('p');heading.textContent=title;paragraph.textContent=text;$('footerInfoContent').replaceChildren(heading,paragraph);$('footerInfo').showModal()});
 const wa=document.querySelector('.social-link[title^="WhatsApp"]');if(wa)wa.href=whatsapp;
 $('year').textContent=new Date().getFullYear();
 window.addEventListener('storage',()=>{refreshHeader();favoriteState()});
 favoriteState();refreshHeader();render();
})();
