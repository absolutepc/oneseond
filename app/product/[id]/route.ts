import {readCatalog} from '../../../lib/catalog';
import {productPage} from '../../../lib/product-page';
export const dynamic='force-dynamic';
export async function GET(request:Request, context:{params:Promise<{id:string}>}){
  const {id}=await context.params;
  const {document}=await readCatalog();
  const product=document.products.find(p=>p.id===id&&p.active!==false);
  if(!product)return new Response('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Товар не найден</title><h1>Товар не найден</h1><a href="/#catalog">Вернуться в каталог</a></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8'}});
  return new Response(productPage(product,document.settings.whatsapp,new URL(request.url)),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
