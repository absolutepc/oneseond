import {pbkdf2Sync,randomBytes} from 'node:crypto';
import {createInterface} from 'node:readline';
import {Writable} from 'node:stream';
if(!process.stdin.isTTY){console.error('Run interactively to enter a password without displaying it.');process.exit(1)}
let muted=false;
const output=new Writable({write(chunk,encoding,done){if(!muted)process.stderr.write(chunk);done()}});
const rl=createInterface({input:process.stdin,output,terminal:true});
function ask(prompt){return new Promise(resolve=>{muted=false;rl.question(prompt,value=>{muted=false;process.stderr.write('\n');resolve(value)});muted=true})}
const password=await ask('New admin password (16–128 characters; hidden): ');
const confirmation=await ask('Repeat password (hidden): ');rl.close();
if(password.length<16||password.length>128||password!==confirmation){console.error('Passwords must match and contain 16–128 characters.');process.exit(1)}
const salt=randomBytes(32).toString('hex');
const hash=pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
process.stdout.write(`pbkdf2$100000$${salt}$${hash}\n`);
