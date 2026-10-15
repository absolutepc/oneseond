import {checkOrigin} from './catalog';
export async function readAuthForm(request:Request){
 checkOrigin(request);
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))throw Error('BAD_FORM');
 if(Number(request.headers.get('content-length'))>8192)throw Error('BAD_FORM');
 const raw=await request.text();if(raw.length>8192)throw Error('BAD_FORM');return new URLSearchParams(raw);
}
export const authRedirect=(request:Request,path:string,cookie?:string)=>new Response(null,{status:303,headers:{Location:new URL(path,request.url).href,'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
