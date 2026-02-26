import { IPaymentConfirmationUseCase } from '@/payments/efi';

/**
 * Skeleton Implementation para confirmar pagamentos na aplicação BeeGym.
 * 
 * Nesta classe, injetamos dependências de DB (ex: Prisma, Supabase)
 * e executamos a lógica de Idempotência.
 */
export class ConfirmInvoiceUseCase implements IPaymentConfirmationUseCase {

    /**
     * Executa a confirmação de uma fatura
     * @param txidOrChargeId ID da transação na EFI (Txid para PIX, ChargeId para Boleto)
     * @param status Status novo (ex: 'CONCLUIDA', 'paid')
     * @param method Método de pagamento (PIX ou BOLETO)
     */
    public async execute(txidOrChargeId: string, status: string, method: 'PIX' | 'BOLETO'): Promise<void> {
        console.log(`[ConfirmInvoiceUseCase] Processando pagamento ${method} - ID: ${txidOrChargeId} - Status: ${status}`);

        // Fluxo a ser implementado:
        // 1. SELECT * FROM invoices WHERE txid = txidOrChargeId
        // 2. Se a fatura não existir, ignorar ou logar erro
        // 3. Se a fatura já estiver com status PAGO (Idempotência):
        //    console.info(`Fatura ${txidOrChargeId} já está paga. Webhook descartado silenciosamente.`);
        //    return;
        // 4. Update status para PAGO no BD, usando uma query atômica
        // 5. Opcional: emitir evento para NotificationService enviar recibo
        // 6. Opcional: OrderService.activateSubscription()

        console.log(`[ConfirmInvoiceUseCase] Fatura ${txidOrChargeId} marcada como paga com sucesso (Mock)`);
    }
}
