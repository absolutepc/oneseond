import {chatGPTSignInPath,chatGPTSignOutPath} from '../app/chatgpt-auth';
export const adminHeaders={
  'Content-Type':'text/html; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex, nofollow',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'same-origin',
};
export function loginPage(state:'signed-out'|'owner'|'forbidden'|'error'='signed-out'){
  const title=state==='forbidden'?'Нет доступа':state==='error'?'Вход временно недоступен':'Вход в админ-панель';
  const description=state==='forbidden'?'Этот аккаунт не является владельцем магазина. Войдите через аккаунт владельца.':state==='owner'?'Вы вошли как владелец магазина. Можно перейти к управлению каталогом.':state==='error'?'Не удалось проверить доступ. Попробуйте обновить страницу позже.':'Управление магазином доступно только владельцу. Для входа используйте свой аккаунт ChatGPT.';
  const action=state==='owner'?'<a class="primary" href="/admin">Открыть панель</a>':state==='signed-out'?`<a class="primary" href="${chatGPTSignInPath('/admin')}" target="_top">Войти через ChatGPT</a>`:'';
  const logout=state==='owner'||state==='forbidden'?`<a href="${chatGPTSignOutPath('/admin/login')}" target="_top">Выйти из аккаунта</a>`:'';
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} — One Second</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;background:#0a0e17;color:#f1f5f9;font:16px/1.6 Arial,sans-serif;display:grid;place-items:center;padding:24px}main{width:100%;max-width:460px;padding:32px;background:#141d2d;border:1px solid #ffffff14;border-radius:20px}.logo{font-size:25px;font-weight:700;text-decoration:none;color:#f1f5f9}.logo b{color:#62b5ff}.eyebrow{font-size:11px;letter-spacing:2px;color:#81b9e9;margin-top:32px}h1{font-size:27px;line-height:1.2;margin:12px 0 18px}p{color:#a9b9ce}a{color:#81b9e9;outline-offset:5px}.links{display:flex;flex-direction:column;gap:18px;margin-top:28px}.primary{display:block;text-align:center;border-radius:10px;padding:13px;background:#244e7b;color:white;text-decoration:none;font-weight:700}.back{display:block;margin-top:32px;font-size:14px}</style></head><body><main><a class="logo" href="/">◷ One <b>Second</b></a><div class="eyebrow">УПРАВЛЕНИЕ МАГАЗИНОМ</div><h1>${title}</h1><p>${description}</p><div class="links">${action}${logout}</div><a class="back" href="/">Вернуться в магазин</a></main></body></html>`;
}
