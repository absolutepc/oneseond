import {Buffer} from 'node:buffer';
const CHUNK=256*1024;
export async function savePhoto(db:D1Database,name:string,type:string,raw:ArrayBuffer){
 const bytes=new Uint8Array(raw);
 const statements=[db.prepare('INSERT INTO uploaded_photos(name,content_type,size,created_at) VALUES(?,?,?,?)').bind(name,type,bytes.length,new Date().toISOString())];
 for(let offset=0;offset<bytes.length;offset+=CHUNK){
  statements.push(db.prepare('INSERT INTO uploaded_photo_chunks(photo_name,part,body) VALUES(?,?,?)').bind(name,offset/CHUNK,Buffer.from(bytes.subarray(offset,offset+CHUNK)).toString('base64')));
 }
 await db.batch(statements);
}
export async function loadPhoto(db:D1Database,name:string){
 const info=await db.prepare('SELECT content_type,size FROM uploaded_photos WHERE name=?').bind(name).first<{content_type:string;size:number}>();
 if(!info)return null;
 const chunks=await db.prepare('SELECT part,body FROM uploaded_photo_chunks WHERE photo_name=? ORDER BY part').bind(name).all<{part:number;body:string}>();
 const bytes=new Uint8Array(info.size);let offset=0;
 for(const [i,row] of chunks.results.entries()){
  if(row.part!==i)throw Error('Incomplete photo');
  const part=Buffer.from(row.body,'base64');bytes.set(part,offset);offset+=part.length;
 }
 if(offset!==info.size)throw Error('Incomplete photo');
 return {body:bytes,contentType:info.content_type};
}
