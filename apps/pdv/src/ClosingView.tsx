import { useMemo, useState } from 'react';
import {
  emptyAmounts,
  formatAmount,
  parseAmount,
  paymentMethods,
  reconcileClosing,
  type ClosingInput,
} from './closing.ts';

type Field = 'opening' | 'supply' | 'withdrawal' | `${'sale' | 'reversal' | 'count'}.${string}`;
type Fields = Record<Field, string>;

function blankFields(): Fields {
  const fields = { opening: '', supply: '', withdrawal: '' } as Fields;
  for (const { code } of paymentMethods) {
    fields[`sale.${code}`] = '';
    fields[`reversal.${code}`] = '';
    fields[`count.${code}`] = '';
  }
  return fields;
}

function toInput(fields: Fields): ClosingInput | null {
  const amount = (field: Field) => parseAmount(fields[field] ?? '');
  const openingCash = amount('opening');
  const supplies = amount('supply');
  const withdrawals = amount('withdrawal');
  if (openingCash === null || supplies === null || withdrawals === null) return null;
  const payments = emptyAmounts();
  const reversals = emptyAmounts();
  const counted = emptyAmounts();
  for (const { code } of paymentMethods) {
    const sale = amount(`sale.${code}`);
    const reversal = amount(`reversal.${code}`);
    const count = amount(`count.${code}`);
    if (sale === null || reversal === null || count === null) return null;
    payments[code] = sale;
    reversals[code] = reversal;
    counted[code] = count;
  }
  return { openingCash, supplies, withdrawals, payments, reversals, counted };
}

function AmountField({
  label,
  field,
  fields,
  setFields,
}: {
  label: string;
  field: Field;
  fields: Fields;
  setFields: React.Dispatch<React.SetStateAction<Fields>>;
}) {
  const invalid = parseAmount(fields[field]) === null;
  return (
    <label className={`amount-field ${invalid ? 'invalid' : ''}`}>
      <span>{label}</span>
      <span className="amount-input">
        <small>R$</small>
        <input
          inputMode="decimal"
          value={fields[field]}
          placeholder="0,00"
          aria-invalid={invalid}
          onChange={(event) =>
            setFields((current) => ({ ...current, [field]: event.target.value }))
          }
        />
      </span>
    </label>
  );
}

export function ClosingView() {
  const [fields, setFields] = useState(blankFields);
  const [receiptDate, setReceiptDate] = useState('');
  const input = useMemo(() => toInput(fields), [fields]);
  const calculation = useMemo(() => {
    if (!input)
      return { result: null, error: 'Confira os valores: use 0,00 ou outro valor positivo.' };
    try {
      return { result: reconcileClosing(input), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : 'Valores inválidos.' };
    }
  }, [input]);
  const result = calculation.result;
  const hasSystemValues = Boolean(
    input &&
      (input.openingCash ||
        input.supplies ||
        input.withdrawals ||
        Object.values(input.payments).some(Boolean) ||
        Object.values(input.reversals).some(Boolean)),
  );

  function printPreview() {
    setReceiptDate(
      new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
        timeZone: 'America/Fortaleza',
      }).format(new Date()),
    );
    window.requestAnimationFrame(() => window.print());
  }

  return (
    <main className="closing-page">
      <div className="simulation-banner">
        <strong>SIMULAÇÃO · SEM DADOS REAIS</strong>
        <span>
          Preencha os valores do sistema e os valores conferidos para testar a diferença e o
          comprovante. Nenhum fechamento é gravado.
        </span>
      </div>
      <div className="closing-intro">
        <div>
          <p className="section-overline">CONFERÊNCIA DO TURNO</p>
          <h2>Fechamento de caixa</h2>
          <p>Valor previsto, contagem física e diferença por forma de recebimento.</p>
        </div>
        <span className="draft-tag">Sem sessão aberta</span>
      </div>
      <div className="closing-layout">
        <div className="closing-forms">
          <section className="closing-card">
            <div className="closing-section-title">
              <b>01</b>
              <div>
                <h3>Valores do sistema</h3>
                <p>Na operação real, esses números virão das vendas e movimentos registrados.</p>
              </div>
            </div>
            <div className="closing-fields three">
              <AmountField
                label="Fundo de troco"
                field="opening"
                fields={fields}
                setFields={setFields}
              />
              <AmountField
                label="Suprimentos"
                field="supply"
                fields={fields}
                setFields={setFields}
              />
              <AmountField
                label="Sangrias"
                field="withdrawal"
                fields={fields}
                setFields={setFields}
              />
            </div>
            <div className="closing-entry-head">
              <span>RECEBIMENTO</span>
              <span>VENDAS</span>
              <span>ESTORNOS</span>
            </div>
            {paymentMethods.map(({ code, label }) => (
              <div className="closing-entry" key={code}>
                <strong>{label}</strong>
                <AmountField
                  label={`${label}: vendas`}
                  field={`sale.${code}`}
                  fields={fields}
                  setFields={setFields}
                />
                <AmountField
                  label={`${label}: estornos`}
                  field={`reversal.${code}`}
                  fields={fields}
                  setFields={setFields}
                />
              </div>
            ))}
          </section>
          <section className="closing-card">
            <div className="closing-section-title">
              <b>02</b>
              <div>
                <h3>Conferência dos recebimentos</h3>
                <p>
                  Digite o dinheiro contado e o valor confirmado nos comprovantes ou controles dos
                  demais meios.
                </p>
              </div>
            </div>
            <div className="closing-fields count">
              {paymentMethods.map(({ code, label }) => (
                <AmountField
                  key={code}
                  label={
                    code === 'cash'
                      ? 'Dinheiro contado'
                      : code === 'troca'
                        ? 'Troca conferida'
                        : `${label} conferido`
                  }
                  field={`count.${code}`}
                  fields={fields}
                  setFields={setFields}
                />
              ))}
            </div>
          </section>
        </div>
        <aside className="closing-card closing-results">
          <div className="closing-section-title">
            <b>03</b>
            <div>
              <h3>Resultado da conferência</h3>
              <p>Diferença = conferido − previsto.</p>
            </div>
          </div>
          {calculation.error && (
            <p className="closing-error" role="alert">
              {calculation.error}
            </p>
          )}
          <div className="closing-result-head">
            <span>MEIO</span>
            <span>SISTEMA</span>
            <span>CONF.</span>
            <span>DIF.</span>
          </div>
          {result?.lines.map((line) => (
            <div className="closing-result-line" key={line.method}>
              <strong>{line.label}</strong>
              <span>{formatAmount(line.expected)}</span>
              <span>{formatAmount(line.counted)}</span>
              <span className={line.difference ? 'variance' : ''}>
                {formatAmount(line.difference)}
              </span>
            </div>
          ))}
          <div className="closing-difference">
            <span>Diferença total</span>
            <strong>{result ? formatAmount(result.differenceTotal) : '—'}</strong>
            <small>
              {result?.differenceTotal === 0 ? 'Valores conferem' : 'Requer conferência'}
            </small>
          </div>
          <p className="closing-help">
            O dinheiro previsto inclui fundo de troco, vendas em dinheiro e suprimentos, menos
            sangrias e estornos. Vendas líquidas aparecem à parte, sem contar o troco como venda.
          </p>
          <button
            className="print-button"
            onClick={printPreview}
            disabled={!result || !hasSystemValues}
          >
            Imprimir comprovante de teste
          </button>
          <p className="print-note">
            Diálogo do navegador · bobina de 80 mm · Elgin i9 / i9 Full / i9 Full2. Teste físico e
            ajuste do driver pendentes.
          </p>
        </aside>
      </div>
      {result && input && hasSystemValues && (
        <section className="receipt" aria-label="Comprovante de fechamento em simulação">
          <div className="receipt-center">
            <strong>COMPREMAI$ ESTIVAS</strong>
            <br />
            EXPERT · FECHAMENTO DE CAIXA
            <br />
            SIMULAÇÃO — NÃO É FECHAMENTO REAL
            <br />
            DOCUMENTO NÃO FISCAL
          </div>
          <div className="receipt-rule" />
          <div>Data/hora: {receiptDate || 'Prévia não impressa'}</div>
          <div>Filial: Piloto RN</div>
          <div>Check-out: não vinculado</div>
          <div>Operador: não vinculado</div>
          <div className="receipt-rule" />
          <div className="receipt-row">
            <span>Fundo de troco</span>
            <span>{formatAmount(input.openingCash)}</span>
          </div>
          <div className="receipt-row">
            <span>Suprimentos</span>
            <span>{formatAmount(input.supplies)}</span>
          </div>
          <div className="receipt-row">
            <span>Sangrias</span>
            <span>- {formatAmount(input.withdrawals)}</span>
          </div>
          <div className="receipt-row">
            <span>Vendas líquidas</span>
            <span>{formatAmount(result.salesNet)}</span>
          </div>
          <div className="receipt-rule" />
          {result.lines.map((line) => (
            <div className="receipt-method" key={line.method}>
              <strong>{line.label}</strong>
              <div className="receipt-row">
                <span>Previsto</span>
                <span>{formatAmount(line.expected)}</span>
              </div>
              <div className="receipt-row">
                <span>Conferido</span>
                <span>{formatAmount(line.counted)}</span>
              </div>
              <div className="receipt-row">
                <span>Diferença</span>
                <span>{formatAmount(line.difference)}</span>
              </div>
            </div>
          ))}
          <div className="receipt-rule" />
          <div className="receipt-row receipt-bold">
            <span>Total previsto</span>
            <span>{formatAmount(result.expectedTotal)}</span>
          </div>
          <div className="receipt-row receipt-bold">
            <span>Total conferido</span>
            <span>{formatAmount(result.countedTotal)}</span>
          </div>
          <div className="receipt-row receipt-bold">
            <span>Diferença total</span>
            <span>{formatAmount(result.differenceTotal)}</span>
          </div>
          <div className="receipt-rule" />
          <div className="receipt-center">
            SIMULAÇÃO SEM GRAVAÇÃO
            <br />
            Não comprova fechamento de turno
          </div>
        </section>
      )}
    </main>
  );
}
