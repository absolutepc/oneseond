-- Add the requested in-stock Quantum Hunter model without replacing saved catalog edits.
-- Existing matching IDs or references are left authoritative; this is safe to apply once again.
UPDATE catalog_state
SET body = json_set(
  json_insert(body, '$.products[#]', json('{"id":"quantum-hunter-pwg930","brand":"Quantum","name":"Hunter PWG930","type":"Спорт","gender":"men","mechanism":"Кварцевый","size":"44 мм","material":"Нержавеющая сталь","source":"https://quantumgermany.de/products/quantum-watches-pwg930-390","active":true,"variants":[{"ref":"PWG930.390","color":"Синий","hex":"#234e72","image":"assets/catalog/pwg930-390.webp","source":"https://quantumgermany.de/products/quantum-watches-pwg930-390","price":18900,"stock":"in_stock"},{"ref":"PWG930.370","color":"Зелёный","hex":"#245340","image":"assets/catalog/pwg930-370.webp","source":"https://chrono.ru/katalog/chasy/quantum/quantum-pwg930370.html","price":18900,"stock":"in_stock"}]}')),
  '$.brands', json(CASE WHEN EXISTS (SELECT 1 FROM json_each(body, '$.brands') WHERE value = 'Quantum')
    THEN json_extract(body, '$.brands') ELSE json_insert(json_extract(body, '$.brands'), '$[#]', 'Quantum') END)
), revision = revision + 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'catalog'
AND NOT EXISTS (SELECT 1 FROM json_each(body, '$.products') WHERE json_extract(value, '$.id') = 'quantum-hunter-pwg930')
AND NOT EXISTS (SELECT 1 FROM json_each(body, '$.products') AS product, json_each(product.value, '$.variants') AS variant
  WHERE json_extract(variant.value, '$.ref') IN ('PWG930.390', 'PWG930.370'));
