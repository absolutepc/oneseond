import html from '../../lib/admin.html?raw';
import {requireOwner} from '../../lib/catalog';
export const dynamic='force-dynamic';
export async function GET(){try{await requireOwner();return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}catch(e){const m=e instanceof Error?e.message:'';if(m==='UNAUTHORIZED')return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2Fadmin','https://one-second.u-dakaev2016.chatgpt.site'),302);return new Response('Доступ только для владельца магазина',{status:403,headers:{'Content-Type':'text/plain; charset=utf-8'}})}}
