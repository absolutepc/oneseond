import {requireAdmin,account,takeAttempt,verifyPassword,hashPassword,replacePassword,clearCookie} from '../../../../lib/admin-auth';
import {readAuthForm,authRedirect} from '../../../../lib/admin-form';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 await requireAdmin();const form=await readAuthForm(request);await takeAttempt();
 const current=form.get('current')||'',password=form.get('password')||'';
 if(current.length>256||password.length<16||password.length>128||password!==form.get('confirm'))return authRedirect(request,'/admin/security?error=length');
 const row=await account();if(!await verifyPassword(current,row.password_hash))return authRedirect(request,'/admin/security?error=current');
 await replacePassword(await hashPassword(password),row.version);
 return authRedirect(request,'/admin/login?changed=1',clearCookie());
}catch(e){const m=e instanceof Error?e.message:'';if(m==='UNAUTHORIZED')return authRedirect(request,'/admin/login');if(m==='BAD_ORIGIN'||m==='BAD_FORM')return new Response('Недопустимый запрос',{status:403});return authRedirect(request,'/admin/security?error=unavailable')}}
