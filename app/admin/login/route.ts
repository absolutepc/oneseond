import {adminHeaders,loginPage} from '../../../lib/admin-access';
export const dynamic='force-dynamic';
export async function GET(request:Request){const query=new URL(request.url).searchParams;return new Response(loginPage('signed-out',query.get('changed')==='1'?'changed':query.get('error')||''),{headers:adminHeaders})}
