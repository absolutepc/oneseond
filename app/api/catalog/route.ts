import {readCatalog,apiError} from '../../../lib/catalog';
export const dynamic='force-dynamic';
export async function GET(){try{const data=await readCatalog();return Response.json({...data,document:{...data.document,products:data.document.products.filter(p=>p.active!==false)}},{headers:{'Cache-Control':'no-store'}})}catch(e){return apiError(e)}}
