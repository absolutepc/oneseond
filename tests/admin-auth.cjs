const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite'),{webcrypto}=require('node:crypto');
const root=require('node:path').resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript');
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(root+'/drizzle/0001_yielding_sunset_bain.sql','utf8'));
let cookie='',now=Date.now();class Clock extends Date{static now(){return now}}
const env={DB:{prepare(sql){const stmt=db.prepare(sql);let args=[];return {bind(...a){args=a;return this},async first(){return stmt.get(...args)||null},async run(){return {meta:{changes:stmt.run(...args).changes}}}}}}};
const code=ts.transpileModule(fs.readFileSync(root+'/lib/admin-auth.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const auth={};vm.runInNewContext(code,{exports:auth,require:n=>{if(n==='cloudflare:workers')return {env};if(n==='next/headers')return {headers:async()=>new Headers({cookie})};throw Error(n)},crypto:webcrypto,TextEncoder,Uint8Array,Date:Clock,Error});
(async()=>{
const password='temporary-test-password-123';env.ADMIN_INITIAL_PASSWORD_HASH=await auth.hashPassword(password);const row=await auth.account();
assert(await auth.verifyPassword(password,row.password_hash));assert.equal(await auth.verifyPassword('wrong',row.password_hash),false);
await assert.rejects(auth.requireAdmin(),/UNAUTHORIZED/);
const issued=await auth.startSession(row.version,null);assert.match(issued,/HttpOnly; Secure; SameSite=Strict/);cookie=issued.split(';')[0];assert.equal((await auth.requireAdmin()).userId,'admin');
const saved=cookie;cookie=saved.slice(0,-1)+(saved.endsWith('0')?'1':'0');await assert.rejects(auth.requireAdmin(),/UNAUTHORIZED/);cookie=saved;
await auth.endSession(cookie);await assert.rejects(auth.requireAdmin(),/UNAUTHORIZED/);
cookie=(await auth.startSession(row.version,null)).split(';')[0];now+=28800001;await assert.rejects(auth.requireAdmin(),/UNAUTHORIZED/);now-=28800001;
cookie=(await auth.startSession(row.version,null)).split(';')[0];await auth.replacePassword(await auth.hashPassword('replacement-password-456'),row.version);await assert.rejects(auth.requireAdmin(),/UNAUTHORIZED/);await assert.rejects(auth.startSession(row.version,null),/UNAUTHORIZED/);assert.equal(await auth.verifyPassword(password,(await auth.account()).password_hash),false);
for(let i=0;i<20;i++)await auth.takeAttempt();await assert.rejects(auth.takeAttempt(),/RATE_LIMIT/);now+=900001;await auth.takeAttempt();
console.log('PASS: password verification, cookie security, tampering, logout, expiry, session revocation and persistent rate limiting.');
})().catch(e=>{console.error(e);process.exitCode=1});
