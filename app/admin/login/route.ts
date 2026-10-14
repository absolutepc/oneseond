import {requireOwner} from '../../../lib/catalog';
import {adminHeaders,loginPage} from '../../../lib/admin-access';
export const dynamic='force-dynamic';
export async function GET(){
  try{await requireOwner();return new Response(loginPage('owner'),{headers:adminHeaders})}
  catch(error){
    const message=error instanceof Error?error.message:'';
    if(message==='UNAUTHORIZED')return new Response(loginPage(),{headers:adminHeaders});
    if(message==='FORBIDDEN')return new Response(loginPage('forbidden'),{status:403,headers:adminHeaders});
    return new Response(loginPage('error'),{status:503,headers:adminHeaders});
  }
}
