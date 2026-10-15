import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
const COOKIE='__Host-onesecond-admin';
const TTL=8*60*60*1000;
const encoder=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
export const randomToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export const digest=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
export async function hashPassword(password:string,salt=randomToken()){
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256);
 return `pbkdf2$100000$${salt}$${hex(bits)}`;
}
export async function verifyPassword(password:string,stored:string){
 const parts=stored.split('$');if(parts.length!==4||parts[0]!=='pbkdf2'||parts[1]!=='100000'||!/^[a-f0-9]{64}$/.test(parts[2])||!/^[a-f0-9]{64}$/.test(parts[3]))throw Error('AUTH_CONFIG');
 const actual=await hashPassword(password,parts[2]);let diff=0;for(let i=0;i<stored.length;i++)diff|=stored.charCodeAt(i)^actual.charCodeAt(i);return diff===0;
}
export async function account(){
 if(!env.DB)throw Error('DB unavailable');
 const initial=(env as unknown as {ADMIN_INITIAL_PASSWORD_HASH?:string}).ADMIN_INITIAL_PASSWORD_HASH;
 if(initial)await env.DB.prepare('INSERT OR IGNORE INTO admin_account(id,password_hash,version) VALUES(?,?,1)').bind('admin',initial).run();
 const row=await env.DB.prepare('SELECT password_hash,version FROM admin_account WHERE id=?').bind('admin').first<{password_hash:string;version:number}>();
 if(!row)throw Error('AUTH_CONFIG');return row;
}
export function cookieToken(cookie:string|null){const token=cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);return token&&/^[a-f0-9]{64}$/.test(token)?token:null}
export async function requireAdmin(){
 const token=cookieToken((await headers()).get('cookie'));if(!token)throw Error('UNAUTHORIZED');
 const row=await env.DB!.prepare('SELECT s.token_hash FROM admin_session s JOIN admin_account a ON a.id=? AND a.version=s.account_version WHERE s.token_hash=? AND s.expires_at>?').bind('admin',await digest(token),Date.now()).first();
 if(!row)throw Error('UNAUTHORIZED');return {displayName:'Администратор',userId:'admin'};
}
export async function takeAttempt(){
 const now=Date.now();
 const row=await env.DB!.prepare('INSERT INTO admin_login_limit(id,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END RETURNING attempts,reset_at').bind('admin',now+900000,now,now,now+900000).first<{attempts:number;reset_at:number}>();
 if(!row||row.attempts>20)throw Error('RATE_LIMIT');
}
export function sessionCookie(token:string){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL/1000}`}
export const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
export async function startSession(version:number,oldCookie:string|null){
 const token=randomToken(),old=cookieToken(oldCookie);
 if(old)await env.DB!.prepare('DELETE FROM admin_session WHERE token_hash=?').bind(await digest(old)).run();
 await env.DB!.prepare('DELETE FROM admin_session WHERE expires_at<=?').bind(Date.now()).run();
 const r=await env.DB!.prepare('INSERT INTO admin_session(token_hash,account_version,expires_at) SELECT ?,version,? FROM admin_account WHERE id=? AND version=?').bind(await digest(token),Date.now()+TTL,'admin',version).run();
 if(!r.meta.changes)throw Error('UNAUTHORIZED');return sessionCookie(token);
}
export async function endSession(cookie:string|null){const token=cookieToken(cookie);if(token)await env.DB!.prepare('DELETE FROM admin_session WHERE token_hash=?').bind(await digest(token)).run()}
export async function replacePassword(passwordHash:string,version:number){
 const result=await env.DB!.prepare('UPDATE admin_account SET password_hash=?,version=version+1 WHERE id=? AND version=?').bind(passwordHash,'admin',version).run();
 if(!result.meta.changes)throw Error('UNAUTHORIZED');
 await env.DB!.prepare('DELETE FROM admin_session WHERE account_version<=?').bind(version).run();
}
