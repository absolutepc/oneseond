import {account,takeAttempt,verifyPassword,startSession} from '../../../../lib/admin-auth';
import {readAuthForm,authRedirect} from '../../../../lib/admin-form';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const form=await readAuthForm(request);await takeAttempt();const row=await account();
 const username=form.get('username'),password=form.get('password')||'';
 if(password.length>256)return authRedirect(request,'/admin/login?error=credentials');
 const valid=await verifyPassword(password,row.password_hash);
 if(!valid||username!=='admin')return authRedirect(request,'/admin/login?error=credentials');
 return authRedirect(request,'/admin',await startSession(row.version,request.headers.get('cookie')));
}catch(e){const m=e instanceof Error?e.message:'';if(m==='BAD_ORIGIN'||m==='BAD_FORM')return new Response('Недопустимый запрос',{status:403});if(m==='RATE_LIMIT')return authRedirect(request,'/admin/login?error=limit');return authRedirect(request,'/admin/login?error=unavailable')}}
