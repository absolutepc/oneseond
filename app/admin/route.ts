import html from '../../lib/admin.html?raw';
import {requireOwner} from '../../lib/catalog';
import {adminHeaders,loginPage} from '../../lib/admin-access';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{await requireOwner();return new Response(html,{headers:adminHeaders})}
  catch(error){
    const message=error instanceof Error?error.message:'';
    if(message==='UNAUTHORIZED')return new Response(null,{status:302,headers:{Location:new URL('/admin/login',request.url).href,'Cache-Control':'no-store'}});
    return new Response(loginPage(message==='FORBIDDEN'?'forbidden':'error'),{status:message==='FORBIDDEN'?403:503,headers:adminHeaders});
  }
}
