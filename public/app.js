const supportedBrands=['Casio','Daniel Klein','Sergio Tacchini','Valentino Orlandi','Quantum','Freelook','Guardo','Casio Edifice','Santa Barbara Polo & Racquet Club','Orient Star','George Kini','Maserati','Rolex','Hublot'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n.toLocaleString('ru-RU')+' ₽';const products=window.watchCatalog;const byId=id=>products.find(p=>p.id===id);const selected={};const variant=p=>p.variants[selected[p.id]||0];const variantKey=(p,v)=>p.id+'::'+v.ref;const availability=v=>({in_stock:'В наличии',out_of_stock:'Нет в наличии',preorder:'Под заказ'}[v.stock]||'Наличие уточняется');const priceLabel=v=>v.price==null?'Цена по запросу':money(v.price);
let cart={},fav=[];try{cart=JSON.parse(localStorage.getItem('os-real-cart'))||{};fav=JSON.parse(localStorage.getItem('os-real-fav'))||[]}catch{};
const cartItem=key=>{for(const p of products){const v=p.variants.find(v=>variantKey(p,v)===key);if(v)return {p,v}}return null};
cart=Object.fromEntries(Object.entries(cart).filter(([key,n])=>cartItem(key)&&Number.isInteger(n)&&n>0));fav=Array.isArray(fav)?fav.filter(id=>byId(id)):[];let filter='Все',onlyFav=false,detailId=null,page=1,pageCount=1;
const mobileCatalog=window.matchMedia('(max-width: 700px)');
function persist(){
  try{localStorage.setItem('os-real-cart',JSON.stringify(cart));localStorage.setItem('os-real-fav',JSON.stringify(fav))}catch{}
  const cartCount=Object.values(cart).reduce((a,b)=>a+b,0);
  for(const [selector,count] of [['[data-cart-count]',cartCount],['[data-fav-count]',fav.length]]){
    document.querySelectorAll(selector).forEach(node=>{node.textContent=count; if(node.classList.contains('nav-count'))node.hidden=count===0});
  }
  document.querySelector('#mobileCart').setAttribute('aria-label','Открыть корзину, товаров: '+cartCount);
  document.querySelector('#mobileFavorites').setAttribute('aria-label','Избранные часы: '+fav.length);
  document.querySelector('#mobileFavorites').setAttribute('aria-pressed',String(onlyFav));
  document.querySelectorAll('[data-shop-action]').forEach(button=>button.disabled=false);
  window.shopOnlyFavorites=onlyFav;
  document.dispatchEvent(new Event('shop:navigation'));
}
function toast(t){const node=document.querySelector('#toast');node.textContent=t;node.classList.add('show');clearTimeout(window.toastTimeout);window.toastTimeout=setTimeout(()=>node.classList.remove('show'),2200)}
function swatches(p){return `<div class="swatches" role="group" aria-label="Варианты ${esc(p.name)}">${p.variants.map((v,i)=>`<button class="swatch ${i===(selected[p.id]||0)?'active':''}" data-variant="${esc(p.id)}" data-index="${i}" aria-label="${esc(v.color)} — ${esc(v.ref)}" aria-pressed="${i===(selected[p.id]||0)}" title="${esc(v.color)} — ${esc(v.ref)}"><span style="background:${esc(v.hex||'#8390a0')}"></span></button>`).join('')}<span class="variant-color">${esc(variant(p).color)}</span></div>`}
function card(p){const v=variant(p);return `<article class="product"><div class="product-art real-product"><button class="heart ${fav.includes(p.id)?'selected':''}" data-fav="${esc(p.id)}" aria-label="Избранное: ${esc(p.name)}" aria-pressed="${fav.includes(p.id)}"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button><span class="badge">${esc(p.type)}</span><button data-detail="${esc(p.id)}" aria-label="Подробнее о ${esc(p.name)}" class="image-button"><img src="${esc(v.image)}" alt="${esc(p.brand+' '+p.name+' '+v.ref)}" loading="lazy" width="320" height="320"></button></div><div class="product-info"><small title="${esc(p.brand)}">${esc(p.brand)}</small><h3><a href="#catalog" data-detail="${esc(p.id)}">${esc(p.name)}</a></h3><p class="product-specs">${esc([p.mechanism,p.size].filter(Boolean).join(' · ')||p.type)}</p>${swatches(p)}<p class="product-ref ${v.stock?'has-stock':''}"><span class="product-sku">Арт. ${esc(v.ref)} · </span>${availability(v)}</p><div class="price-row"><strong class="request-price">${priceLabel(v)}</strong><button data-add="${esc(p.id)}" ${v.stock==='out_of_stock'?'disabled':''}>${v.stock==='out_of_stock'?'Нет в наличии':'В корзину +'}</button></div></div></article>`}
function renderPagination(total,start,end){
  const visible=new Set((pageCount<=5?Array.from({length:pageCount},(_,i)=>i+1):[1,pageCount,page-1,page,page+1]).filter(n=>n>0&&n<=pageCount));
  let previous=0;
  const buttons=[...visible].sort((a,b)=>a-b).map(n=>{
    const gap=previous&&n-previous>1?'<span class="page-gap" aria-hidden="true">…</span>':'';
    previous=n;
    return gap+`<button data-page="${n}" aria-label="Страница ${n}" ${n===page?'aria-current="page"':''}>${n}</button>`;
  }).join('');
  document.querySelectorAll('[data-pagination]').forEach(node=>{
    node.hidden=pageCount<=1;
    node.innerHTML=`<span class="page-range">${start+1}–${end} из ${total}</span><div class="page-buttons">${buttons}</div>`;
  });
}
function render(){
  const brand=document.querySelector('#brandFilter').value,q=document.querySelector('#search').value.trim().toLowerCase();
  let list=products.filter(p=>(!brand||p.brand===brand)&&(filter==='Все'||p.type===filter)&&(!onlyFav||fav.includes(p.id))&&[p.brand,p.name,p.type,...p.variants.map(v=>v.ref+' '+v.color)].join(' ').toLowerCase().includes(q));
  const sort=document.querySelector('#sort').value;
  if(sort==='name')list.sort((a,b)=>(a.brand+' '+a.name).localeCompare(b.brand+' '+b.name));
  if(sort==='brand')list.sort((a,b)=>a.brand.localeCompare(b.brand));
  const pageSize=mobileCatalog.matches?8:Math.max(1,list.length);
  pageCount=Math.max(1,Math.ceil(list.length/pageSize));
  page=Math.min(Math.max(page,1),pageCount);
  const start=(page-1)*pageSize,end=Math.min(start+pageSize,list.length);
  document.querySelector('#products').innerHTML=list.length?list.slice(start,end).map(card).join(''):'<div class="empty">По выбранным условиям часы не найдены.<br><button class="btn secondary" id="resetFilters" style="margin-top:20px">Сбросить фильтры</button></div>';
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter&&!onlyFav));
  document.querySelector('#catalogCount').textContent=(onlyFav?'Избранное · ':'')+list.length+' моделей';
  renderPagination(list.length,start,end);
  persist();
}
function resetCatalog(){
  page=1;filter='Все';onlyFav=false;
  document.querySelector('#brandFilter').value='';
  document.querySelector('#search').value='';
  render();
}
function openFavorites(){
  onlyFav=!onlyFav;page=1;filter='Все';
  document.querySelector('#brandFilter').value='';
  document.querySelector('#search').value='';
  render();document.querySelector('#catalog').scrollIntoView();
  toast(onlyFav?'Показаны избранные часы':'Показаны все часы');
}
function openCart(){showCart();if(!document.querySelector('#cartModal').open)document.querySelector('#cartModal').showModal()}
mobileCatalog.addEventListener('change',()=>{page=1;render()});
function showDetail(id,open=true){const p=byId(id);if(!p)return;detailId=id;const v=variant(p);document.querySelector('#productDetail').innerHTML=`<div class="detail-grid"><div class="detail-image"><img src="${esc(v.image)}" alt="${esc(p.brand+' '+p.name+' '+v.ref)}"></div><div><div class="eyebrow">${esc(p.brand)}</div><h2>${esc(p.name)}</h2>${swatches(p)}<dl><dt>Артикул выбранного варианта</dt><dd>${esc(v.ref)}</dd>${[['Механизм',p.mechanism],['Размер корпуса',p.size],['Материалы',p.material]].filter(x=>x[1]).map(([k,val])=>'<dt>'+k+'</dt><dd>'+esc(val)+'</dd>').join('')}</dl>${v.source||p.source?`<a class="source-link" href="${esc(v.source||p.source)}" target="_blank" rel="noopener noreferrer">Характеристики у источника <span class="decorative-arrow" aria-hidden="true">↗</span></a>`:''}<h3>${priceLabel(v)}</h3><p class="muted">${availability(v)}</p><button class="btn primary" data-add="${esc(p.id)}" ${v.stock==='out_of_stock'?'disabled':''}>Добавить выбранный вариант</button></div></div>`;if(open&&!document.querySelector('#productModal').open)document.querySelector('#productModal').showModal()}
function showCart(){document.querySelector('#cartItems').innerHTML=Object.entries(cart).map(([key,n])=>{const {p,v}=cartItem(key);return `<div class="cart-row"><img src="${esc(v.image)}" alt="${esc(v.ref)}"><div><b>${esc(p.brand+' '+p.name)}</b><small>${esc(v.color)} · ${esc(v.ref)}</small><small>${priceLabel(v)} · ${availability(v)}</small></div><button data-minus="${esc(key)}" aria-label="Уменьшить количество">−</button><span>${n}</span><button data-plus="${esc(key)}" aria-label="Увеличить количество">+</button><button data-remove="${esc(key)}" aria-label="Удалить выбранный вариант">×</button></div>`}).join('')||'<p class="muted">Корзина пока пуста. Выберите часы в каталоге.</p>';const entries=Object.entries(cart),sum=entries.reduce((n,[key,q])=>n+(cartItem(key).v.price||0)*q,0),unknown=entries.some(([key])=>cartItem(key).v.price==null);document.querySelector('#total').textContent=entries.length?(unknown?(sum?'Сумма известных цен: '+money(sum)+' · остальные по запросу':'Стоимость уточняется'):'Итого: '+money(sum)):'Корзина пуста';document.querySelector('#checkout').disabled=!Object.keys(cart).length;document.querySelector('#orderSummary').hidden=true;persist()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-filter],[data-brand],[data-add],[data-fav],[data-detail],[data-minus],[data-plus],[data-remove],[data-variant],[data-page],[data-shop-action],[data-nav-section="catalog"],#resetFilters');if(!b)return;
if(b.dataset.page!==undefined){
  page=Math.max(1,Math.min(pageCount,Number(b.dataset.page)));render();
  document.querySelector('#catalogResults').scrollIntoView();
  document.querySelector('#products').focus({preventScroll:true});return;
}
if(b.dataset.shopAction==='favorites'){openFavorites();return}
if(b.dataset.shopAction==='cart'){openCart();return}
if(b.dataset.navSection==='catalog'){resetCatalog();return}
if(b.dataset.variant!==undefined){
  selected[b.dataset.variant]=Number(b.dataset.index);
  const inDetail=!!b.closest('#productModal');render();
  if(inDetail)showDetail(b.dataset.variant,false);
  const scope=document.querySelector(inDetail?'#productDetail':'#products');
  [...scope.querySelectorAll('[data-variant]')].find(button=>button.dataset.variant===b.dataset.variant&&button.dataset.index===b.dataset.index)?.focus({preventScroll:true});
  return;
}
if(b.dataset.filter){page=1;filter=b.dataset.filter;onlyFav=false;render();document.querySelector('#catalog').scrollIntoView()}
if(b.dataset.brand){page=1;document.querySelector('#brandFilter').value=b.dataset.brand;filter='Все';onlyFav=false;document.querySelector('#search').value='';render()}
if(b.id==='resetFilters'){resetCatalog()}
if(b.dataset.add!==undefined){const p=byId(b.dataset.add);if(variant(p).stock==='out_of_stock')return;const key=variantKey(p,variant(p));cart[key]=(cart[key]||0)+1;showCart();toast('Выбранный вариант добавлен в корзину')}
if(b.dataset.fav!==undefined){const id=b.dataset.fav;fav=fav.includes(id)?fav.filter(x=>x!==id):[...fav,id];render()}
if(b.dataset.minus!==undefined){if(--cart[b.dataset.minus]<=0)delete cart[b.dataset.minus];showCart()}
if(b.dataset.plus!==undefined){cart[b.dataset.plus]++;showCart()}
if(b.dataset.remove!==undefined){delete cart[b.dataset.remove];showCart()}
if(b.dataset.detail!==undefined){e.preventDefault();showDetail(b.dataset.detail)}});
['#search','#sort','#brandFilter'].forEach(s=>document.querySelector(s).addEventListener(s==='#search'?'input':'change',()=>{page=1;render()}));
document.querySelector('#favorites').onclick=openFavorites;
document.querySelector('#cartBtn').onclick=openCart;
document.querySelectorAll('dialog:not(#mobileMenu)').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
document.querySelector('#checkout').onclick=()=>{const text='Здравствуйте! Подскажите цену и наличие:\n'+Object.entries(cart).map(([key,n])=>{const {p,v}=cartItem(key);return p.brand+' '+p.name+' / '+v.ref+' / '+v.color+' — '+n+' шт.'}).join('\n');const o=document.querySelector('#orderSummary');o.hidden=false;o.replaceChildren();const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-line';const a=document.createElement('a');a.className='btn primary';const contact=new URL(window.shopSettings?.whatsapp||'https://wa.me/79659695064');contact.searchParams.set('text',text);a.href=contact.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Открыть запрос в WhatsApp';o.append(p,a)};
document.querySelector('#year').textContent=new Date().getFullYear();render();

const footerInformation={delivery:{title:'Доставка и оплата',text:'Магазин пока работает как демонстрационная витрина. Реальные заказы и платежи не принимаются. Условия доставки, способы оплаты и сроки будут опубликованы перед запуском продаж.'},returns:{title:'Гарантия и возврат',text:'Условия гарантии и возврата будут добавлены перед запуском продаж после утверждения ассортимента и данных продавца. Наличие и условия покупки конкретной модели уточняйте у магазина.'},contacts:{title:'Связаться с One Second',text:'Наш Instagram: @one_second. Telegram: @onesecondwatch. WhatsApp: +7 965 969-50-64. Напишите нам через ссылки в футере.'},privacy:{title:'Конфиденциальность',text:'Эта витрина сохраняет избранное и состав корзины локально в вашем браузере. Для очистки этих данных удалите данные сайта в настройках браузера. Формы сбора контактных данных и приём платежей сейчас отсутствуют.'}};
document.addEventListener('click',event=>{const social=event.target.closest('[data-social]');if(social){toast('Ссылка на '+social.dataset.social+' пока не добавлена');return}const button=event.target.closest('[data-info]');if(!button)return;const info=footerInformation[button.dataset.info];document.querySelector('#footerInfoContent').innerHTML='<h2>'+info.title+'</h2><p>'+info.text+'</p>';document.querySelector('#footerInfo').showModal()});

