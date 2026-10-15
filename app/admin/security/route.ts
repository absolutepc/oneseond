import {requireAdmin} from '../../../lib/admin-auth';
import {adminHeaders,securityPage,loginPage} from '../../../lib/admin-access';
import {authRedirect} from '../../../lib/admin-form';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{await requireAdmin();return new Response(securityPage(new URL(request.url).searchParams.get('error')||''),{headers:adminHeaders})}catch(e){if(e instanceof Error&&e.message==='UNAUTHORIZED')return authRedirect(request,'/admin/login');return new Response(loginPage('error'),{status:503,headers:adminHeaders})}}
