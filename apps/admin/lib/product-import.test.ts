import assert from 'node:assert/strict';
import test from 'node:test';
import { optionalProductHeaders, productHeaders, reviewProductCsv } from './product-import.ts';

const header = productHeaders.join(';');

test('preserva GTIN textual e lê aspas, ponto e vírgula e preço brasileiro', () => {
  const review = reviewProductCsv(
    `\uFEFF${header}\r\n001;"Descrição; detalhada";Mercearia;UN;12345670;12345678;;12,34;9,10\r\n`,
  );
  assert.equal(review.rows.length, 1);
  assert.equal(review.rows[0].sku, '001');
  assert.equal(review.rows[0].description, 'Descrição; detalhada');
  assert.equal(review.rows[0].gtin, '12345670');
  assert.equal(review.rows[0].priceCents, 1234);
  assert.equal(review.issues.length, 0);
});

test('aponta SKU repetido, GTIN inválido e dados pendentes sem gravar', () => {
  const review = reviewProductCsv(
    `${header}\nABC;Produto um;Hortifruti;KG;12345671;;;5,00;\nabc;Produto dois;Hortifruti;KG;;;;;`,
  );
  assert.equal(review.rows.length, 2);
  assert.deepEqual(review.departments, ['Hortifruti']);
  assert.ok(review.issues.some((issue) => issue.message.includes('GTIN')));
  assert.ok(review.issues.some((issue) => issue.message.includes('SKU repetido')));
  assert.ok(review.issues.some((issue) => issue.message.includes('NCM pendente')));
});

test('rejeita cabeçalho incompleto e aspas abertas', () => {
  assert.throws(() => reviewProductCsv('sku;descricao\n1;Teste'), /Colunas ausentes/);
  assert.throws(() => reviewProductCsv(`${header}\n1;"Teste`), /não foi fechado/);
});

test('lê a hierarquia opcional e avisa sobre tributação ainda não mapeada', () => {
  const fullHeader = [
    ...productHeaders,
    ...optionalProductHeaders.map((header) => (header === 'secao' ? 'Seção' : header)),
    'tributacao',
  ].join(';');
  const review = reviewProductCsv(
    `${fullHeader}\n001;Produto;Mercearia;UN;;12345678;;12,34;9,10;Alimentos;Básicos;Massas;REF-TRIB`,
  );
  assert.equal(review.rows[0].department, 'Mercearia');
  assert.equal(review.rows[0].section, 'Alimentos');
  assert.equal(review.rows[0].group, 'Básicos');
  assert.equal(review.rows[0].subgroup, 'Massas');
  assert.deepEqual(review.unmappedColumns, ['tributacao']);
  assert.equal(review.issues.length, 0);
});
