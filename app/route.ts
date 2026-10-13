import { storefront } from '../lib/storefront';
export const dynamic='force-dynamic';
export function GET(){return new Response(storefront,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})}
