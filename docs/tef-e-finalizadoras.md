# TEF e finalizadoras do PDV

**Piloto:** CompreMai$ Estivas, RN. **Estado:** contrato funcional em preparação; o provedor TEF ainda será escolhido. As telas atuais não processam pagamentos nem criam crédito real.

## Finalizadoras

| Meio | Origem do valor confirmado | Conferência no fechamento | Regra de negócio pendente |
| --- | --- | --- | --- |
| Dinheiro | Valor recebido e troco registrados na venda | Contagem da gaveta, com fundo de troco, suprimentos e sangrias | Política de diferença e sangria |
| Débito | Aprovação do TEF | Total do provedor/comprovantes por turno | Provedor, bandeiras e terminais |
| Crédito | Aprovação do TEF | Total do provedor/comprovantes por turno, incluindo parcelas | Provedor, parcelamento e taxas |
| PIX | Confirmação da integração escolhida, nunca apenas imagem ou promessa de pagamento | Total confirmado no provedor | PIX no TEF ou integração separada |
| Convênio | Lançamento autorizado em conta vinculada ao cliente/conveniado | Relação de autorizações e lançamentos | Quem pode comprar, limite, prazo e aprovação |
| Troca | Resgate de crédito válido vinculado a devolução/troca original | Créditos usados e saldo remanescente | Emissão, validade, uso parcial e aprovação |
| Outros | Finalizadora cadastrada e autorizada | Comprovante ou controle correspondente | Quais meios serão permitidos |

Convênio e Troca entram como formas de liquidação da **venda atual**. Não entram como dinheiro físico da gaveta. Troca deve consumir um crédito existente e rastreável; criar o crédito e resgatá-lo não pode aumentar o faturamento duas vezes. Convênio cria uma obrigação a receber de acordo com a regra aprovada pela loja; não deve aparecer como valor recebido em dinheiro ou cartão.

## Contrato mínimo da integração TEF

1. Configurar empresa, filial, check-out, terminal, credenciais e ambiente por instalação. O PDV web chama a API do EXPERT; o adaptador do provedor executa a operação exigida pela solução escolhida. Se o fornecedor exigir aplicativo, arquivos ou biblioteca no caixa, avaliar um conector local antes de homologar a arquitetura.
2. Criar uma tentativa de pagamento com identificador único, venda, valor em centavos, finalizadora e chave de idempotência. Estados: `criada`, `enviada`, `aprovada`, `negada`, `cancelada`, `desconhecida` e `conciliada`.
3. Confirmar uma venda apenas após os pagamentos exigidos estarem aprovados/confirmados. Em timeout ou queda de conexão, consultar a transação no provedor antes de nova tentativa. Respostas tardias não podem gerar pagamento duplicado.
4. Registrar identificadores de transação, NSU, código de autorização, bandeira e terminal **somente quando retornados e necessários**, com controle de acesso. Não guardar PIN, CVV, trilha completa ou dados de autenticação sensíveis após autorização.
5. Implementar cancelamento/estorno vinculado à transação original, comprovante do cliente e da loja conforme retorno do provedor, reimpressão identificada e conciliação diária entre vendas, TEF e recebíveis.
6. Homologar compra aprovada, negada, timeout, cancelamento, queda entre aprovação e gravação da venda, pagamento misto, múltiplas parcelas, fechamento de caixa e reimpressão. Validar os três modelos de impressora Elgin indicados.

O provedor ainda está **a definir**. Portanto não existe adaptador TEF operacional neste repositório. A documentação de [PayGo Windows](https://paygodev.readme.io/docs/o-protocolo-de-troca-de-arquivos) descreve uma integração por troca de arquivos; a documentação do [m-SiTef](https://dev.softwareexpress.com.br/docs/m-sitef/) descreve aplicativo Android. Elas servem para avaliar a arquitetura, não indicam escolha por nenhum dos dois. O [PCI SSC](https://www.pcisecuritystandards.org/faqs/1533/) esclarece a proibição de armazenar dados de autenticação sensíveis após autorização.

## Decisões com a loja

- Escolher provedor TEF, modalidade de integração, adquirentes, pinpad e plano de homologação.
- Descrever Convênio: cadastro e elegibilidade, identificador do conveniado, limite, bloqueio, vencimento, aprovação e relatório financeiro.
- Descrever Troca: documento original, criação do crédito, valor/saldo, validade, uso parcial, devolução do excedente e autorização.
- Confirmar se PIX ocorrerá no TEF ou em integração própria e quais meios cabem em “Outros”.
