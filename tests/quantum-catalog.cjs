const {DatabaseSync}=require('node:sqlite');
const {readFileSync,existsSync}=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
const seed=JSON.parse(readFileSync(path.join(root,'lib/seed.json'),'utf8'));
const model=seed.products.find(p=>p.id==='quantum-hunter-pwg930');
assert(model);assert.equal(model.gender,'men');
assert.deepEqual(model.variants.map(v=>[v.ref,v.color,v.price,v.stock]),[['PWG930.390','Синий',18900,'in_stock'],['PWG930.370','Зелёный',18900,'in_stock']]);
for(const v of model.variants)assert(existsSync(path.join(root,'public',v.image)));
const sql=readFileSync(path.join(root,'drizzle/0002_add_quantum_hunter.sql'),'utf8');
function database(doc){const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE catalog_state(id TEXT,body TEXT,revision INTEGER,updated_at TEXT)');db.prepare('INSERT INTO catalog_state VALUES(?,?,?,?)').run('catalog',JSON.stringify(doc),7,'before');return db;}
const doc=structuredClone(seed);doc.products=doc.products.filter(p=>p.id!==model.id);doc.products[0].name='Custom admin edit';doc.settings.whatsapp='https://wa.me/12345678';
const db=database(doc);db.exec(sql);let row=db.prepare('SELECT * FROM catalog_state').get(),updated=JSON.parse(row.body);assert.equal(row.revision,8);assert.deepEqual(updated.products.slice(0,-1),doc.products);assert.deepEqual(updated.products.at(-1),model);assert.deepEqual(updated.settings,doc.settings);assert.deepEqual(updated.brands,doc.brands);
db.exec(sql);assert.deepEqual(db.prepare('SELECT * FROM catalog_state').get(),row);db.close();
const existing=database(seed);existing.exec(sql);assert.equal(existing.prepare('SELECT revision FROM catalog_state').get().revision,7);existing.close();
const withoutBrand=structuredClone(doc);withoutBrand.brands=withoutBrand.brands.filter(b=>b!=='Quantum');const brandDb=database(withoutBrand);brandDb.exec(sql);assert(JSON.parse(brandDb.prepare('SELECT body FROM catalog_state').get().body).brands.includes('Quantum'));brandDb.close();
console.log('Quantum: variants and assets valid; migration preserves edits, adds brand when needed, and prevents duplicates.');
