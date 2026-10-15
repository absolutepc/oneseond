import { env } from 'cloudflare:workers';
import {requireAdmin} from './admin-auth';
import seed from './seed.json';
import { catalogSchema } from './catalog-validation';
export const initialCatalog=catalogSchema.parse(seed);
export const requireOwner=requireAdmin;
export function checkOrigin(request:Request){const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin)throw new Error('BAD_ORIGIN')}
export async function readCatalog(){
  if(!env.DB)throw new Error('DB unavailable');
  // Update the untouched initial contact once; subsequent admin edits remain authoritative.
  await env.DB.prepare("UPDATE catalog_state SET body=json_set(body,'$.settings.whatsapp',?),revision=revision+1,updated_at=? WHERE id=? AND revision=0 AND json_extract(body,'$.settings.whatsapp')=?")
    .bind('https://wa.me/79626542959',new Date().toISOString(),'catalog','https://wa.me/79659695064').run();
  const row=await env.DB.prepare('SELECT body,revision,updated_at FROM catalog_state WHERE id = ?').bind('catalog').first<{body:string;revision:number;updated_at:string}>();
  return row?{document:catalogSchema.parse(JSON.parse(row.body)),revision:row.revision,updatedAt:row.updated_at}:{document:initialCatalog,revision:0,updatedAt:null};
}
export async function ensureCatalog(){await env.DB!.prepare('INSERT OR IGNORE INTO catalog_state(id,body,revision,updated_at) VALUES(?,?,?,?)').bind('catalog',JSON.stringify(initialCatalog),0,new Date().toISOString()).run()}
export function apiError(error:unknown){const m=error instanceof Error?error.message:'Ошибка сервера';const status=m==='UNAUTHORIZED'?401:m==='FORBIDDEN'||m==='BAD_ORIGIN'?403:500;return Response.json({error:status===401?'Войдите в админ-панель':status===403?'Нет доступа':'Не удалось выполнить операцию'}, {status,headers:{'Cache-Control':'no-store'}})}
