import {env} from 'cloudflare:workers';
import {loadPhoto} from '../../../lib/photo-storage';
export async function GET(request:Request,{params}:{params:Promise<{name:string}>}){
 const {name}=await params;if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(name))return new Response('Not found',{status:404});
 try{
 const obj=await env.BUCKET?.get('photos/'+name);
 let body:BodyInit|null=obj?.body||null,type=obj?.httpMetadata?.contentType;
 if(!body&&env.DB){const photo=await loadPhoto(env.DB,name);if(photo){body=photo.body;type=photo.contentType}}
 if(!body)return new Response('Not found',{status:404});
 return new Response(body,{headers:{'Content-Type':type||'application/octet-stream','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Photo storage unavailable',{status:503,headers:{'Cache-Control':'no-store'}})}
}
