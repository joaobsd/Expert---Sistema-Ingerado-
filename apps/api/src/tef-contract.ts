export type TefMethod = 'debit' | 'credit' | 'pix';
export type TefStatus =
  | 'created'
  | 'sent'
  | 'approved'
  | 'denied'
  | 'cancelled'
  | 'unknown'
  | 'reconciled';

export type TefRequest = {
  requestId: string;
  saleId: string;
  checkoutId: string;
  amountCents: number;
  method: TefMethod;
  idempotencyKey: string;
};

export type TefTransaction = {
  requestId: string;
  providerReference?: string;
  status: TefStatus;
  nsu?: string;
  authorizationCode?: string;
  terminalId?: string;
};

// A implementação depende do provedor contratado e de sua homologação.
export interface TefGateway {
  authorize(request: TefRequest): Promise<TefTransaction>;
  query(requestId: string): Promise<TefTransaction>;
  cancel(requestId: string, reason: string): Promise<TefTransaction>;
}
