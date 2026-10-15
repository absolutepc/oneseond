import {endSession,clearCookie} from '../../../../lib/admin-auth';
import {checkOrigin} from '../../../../lib/catalog';
import {authRedirect} from '../../../../lib/admin-form';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{checkOrigin(request);await endSession(request.headers.get('cookie'));return authRedirect(request,'/admin/login',clearCookie())}catch{return new Response('Не удалось выйти',{status:403})}}
