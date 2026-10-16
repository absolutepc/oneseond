import {storefront} from '../../lib/storefront';
export const dynamic='force-dynamic';
export function GET(){
 const section=storefront.match(/<section id="catalog"[\s\S]*?<\/section>/)![0]
  .replace('КАТАЛОГ МАГАЗИНА','ВАШ ВЫБОР')
  .replace('Выберите свои часы','Избранное');
 const html=storefront.replace(/<main>[\s\S]*?<\/main>/,'<main>'+section+'</main>')
  .replace('<title>One Second — Время быть собой</title>','<title>Избранное — One Second</title>')
  .replace(/href="#([^"]*)"/g,'href="/#$1"');
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
}
