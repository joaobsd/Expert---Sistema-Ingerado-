export const paymentMethods = [
  { code: 'cash', label: 'Dinheiro' },
  { code: 'debit', label: 'Débito' },
  { code: 'credit', label: 'Crédito' },
  { code: 'pix', label: 'PIX' },
  { code: 'convenio', label: 'Convênio' },
  { code: 'troca', label: 'Troca' },
  { code: 'other', label: 'Outros' },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]['code'];
export type Amounts = Record<PaymentMethod, number>;

export type ClosingInput = {
  openingCash: number;
  supplies: number;
  withdrawals: number;
  payments: Amounts;
  reversals: Amounts;
  counted: Amounts;
};

export type ClosingLine = {
  method: PaymentMethod;
  label: string;
  expected: number;
  counted: number;
  difference: number;
};

export function emptyAmounts(): Amounts {
  return { cash: 0, debit: 0, credit: 0, pix: 0, convenio: 0, troca: 0, other: 0 };
}

export function parseAmount(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(/^R\$/i, '');
  if (!normalized) return 0;
  if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized.replace(/\./g, '').replace(',', '.')) * 100);
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
}

export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function reconcileClosing(input: ClosingInput) {
  const values = [
    input.openingCash,
    input.supplies,
    input.withdrawals,
    ...Object.values(input.payments),
    ...Object.values(input.reversals),
    ...Object.values(input.counted),
  ];
  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error('Valores devem ser inteiros não negativos em centavos.');
  }

  const lines: ClosingLine[] = paymentMethods.map(({ code, label }) => {
    const expected =
      input.payments[code] -
      input.reversals[code] +
      (code === 'cash' ? input.openingCash + input.supplies - input.withdrawals : 0);
    if (expected < 0) {
      throw new Error(`O valor previsto de ${label.toLowerCase()} não pode ser negativo.`);
    }
    return {
      method: code,
      label,
      expected,
      counted: input.counted[code],
      difference: input.counted[code] - expected,
    };
  });

  return {
    lines,
    expectedTotal: lines.reduce((sum, line) => sum + line.expected, 0),
    countedTotal: lines.reduce((sum, line) => sum + line.counted, 0),
    differenceTotal: lines.reduce((sum, line) => sum + line.difference, 0),
    salesNet: paymentMethods.reduce(
      (sum, { code }) => sum + input.payments[code] - input.reversals[code],
      0,
    ),
  };
}
