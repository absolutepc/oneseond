const assert=require('node:assert/strict'),fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const {catalogSchema}=require('../lib/catalog-validation.ts');
const {productPage}=require('../lib/product-page.ts');
const doc=JSON.parse(fs.readFileSync(require.resolve('../lib/seed.json'))),p=doc.products[0];
p.variants[0].gallery=['/assets/catalog/pwg1092-370.webp','/assets/catalog/pwg1092-380.webp'];
p.variants[1].gallery=['/assets/catalog/qmg1226-360.webp'];
assert.deepEqual(catalogSchema.parse(doc).products[0].variants[0].gallery,p.variants[0].gallery);
const bad=structuredClone(doc);bad.products[0].variants[0].gallery=['javascript:alert(1)'];assert.equal(catalogSchema.safeParse(bad).success,false);
bad.products[0].variants[0].gallery=Array(13).fill('/assets/test.webp');assert.equal(catalogSchema.safeParse(bad).success,false);
(async()=>{
 const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://shop.test/**',route=>{const u=new URL(route.request().url());if(u.pathname.startsWith('/product/'))return route.fulfill({contentType:'text/html',body:productPage(p,'https://wa.me/79626542959',u)});const path=require('node:path').join(__dirname,'../public',u.pathname);if(fs.existsSync(path))return route.fulfill({path});return route.fulfill({status:404,body:''})});
 await page.goto('http://shop.test/product/'+p.id+'?color='+p.variants[1].ref);
 const thumbs=page.locator('#galleryThumbnails button');await thumbs.first().waitFor();assert.equal(await thumbs.count(),2);
 await thumbs.nth(1).click();assert((await page.locator('#mainPhoto').getAttribute('src')).includes('qmg1226-360'));
 await page.locator('#zoomPhoto').click();assert((await page.locator('#zoomImage').getAttribute('src')).includes('qmg1226-360'));await page.locator('#photoDialog .close').click();
 await page.locator('#productColors button').first().click();assert.equal(await thumbs.count(),3);assert((await page.locator('#mainPhoto').getAttribute('src')).endsWith(p.variants[0].image));
 await thumbs.nth(2).click();assert((await page.locator('#mainPhoto').getAttribute('src')).includes('pwg1092-380'));assert.equal(new URL(page.url()).searchParams.get('color'),p.variants[0].ref);
 assert(decodeURIComponent(await page.locator('#inquire').getAttribute('href')).includes(p.variants[0].ref));
 await page.locator('#productColors button').nth(1).click();assert.equal(await thumbs.count(),2);assert((await page.locator('#mainPhoto').getAttribute('src')).endsWith(p.variants[1].image));
 assert.deepEqual(errors,[]);console.log('PASS: gallery data validation, direct color URL, isolated thumbnails, reset, zoom and inquiry color link');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
