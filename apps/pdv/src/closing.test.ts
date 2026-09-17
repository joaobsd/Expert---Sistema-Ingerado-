import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyAmounts, parseAmount, reconcileClosing } from './closing.ts';

test('separa fundo de troco e movimentos do recebimento líquido', () => {
  const payments = { ...emptyAmounts(), cash: 10000, debit: 5000 };
  const reversals = { ...emptyAmounts(), cash: 1000, debit: 500 };
  const counted = { ...emptyAmounts(), cash: 13000, debit: 4500 };
  const result = reconcileClosing({
    openingCash: 2000,
    supplies: 3000,
    withdrawals: 1500,
    payments,
    reversals,
    counted,
  });
  assert.equal(result.lines[0].expected, 12500);
  assert.equal(result.lines[0].difference, 500);
  assert.equal(result.lines[1].expected, 4500);
  assert.equal(result.salesNet, 13500);
  assert.equal(result.expectedTotal, 17000);
  assert.equal(result.differenceTotal, 500);
});

test('não aceita montante inválido nem previsto negativo', () => {
  assert.equal(parseAmount('1.234,56'), 123456);
  assert.equal(parseAmount('1,999'), null);
  assert.equal(parseAmount('-1'), null);
  assert.throws(() =>
    reconcileClosing({
      openingCash: 0,
      supplies: 0,
      withdrawals: 1,
      payments: emptyAmounts(),
      reversals: emptyAmounts(),
      counted: emptyAmounts(),
    }),
  );
});

test('convênio e troca conciliam como meios próprios, sem mudar o dinheiro da gaveta', () => {
  const result = reconcileClosing({
    openingCash: 2000,
    supplies: 0,
    withdrawals: 0,
    payments: { ...emptyAmounts(), convenio: 7500, troca: 3000 },
    reversals: emptyAmounts(),
    counted: { ...emptyAmounts(), cash: 2000, convenio: 7500, troca: 2500 },
  });
  assert.equal(result.lines.find((line) => line.method === 'cash')?.expected, 2000);
  assert.equal(result.lines.find((line) => line.method === 'troca')?.difference, -500);
  assert.equal(result.salesNet, 10500);
  assert.equal(result.differenceTotal, -500);
});
