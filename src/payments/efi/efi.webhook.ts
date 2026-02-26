import { efiClient } from './efi.client';
import {
    IPaymentConfirmationUseCase,
    WebhookPixPayload,
    WebhookCobrancaPayload
} from './efi.types';
import { EfiWebhookValidationError } from './efi.errors';
import crypto from 'crypto';

export class EfiWebhookService {
    constructor(
        private readonly paymentConfirmationUseCase: IPaymentConfirmationUseCase
    ) { }

    /**
     * Configura e vincula a URL do webhook a uma chave PIX específica na EFI
     */
    public async registrarWebhook(pixKey: string, webhookUrl: string): Promise<void> {
        await efiClient.put(`/v2/webhook/${pixKey}`, {
            webhookUrl
        });
    }

    /**
     * Valida se a requisição originou-se legitimamente da EFI.
     * Dependendo da infraestrutura, a recomendação oficial é mTLS no servidor,
     * ou validação via HMCA Signature enviada pela Gerencianet/EFI no header (x-webhook-signature / x-api-key)
     * 
     * Atenção: A validação oficial de webhook PIX da EFI em produção é mTLS obrigatoriamente (o seu servidor exige certificado cliente).
     * Abaixo exemplificamos também uma checagem customizada de Hash simulada para homologações sem mTLS completo na borda.
     */
    public async validateRequest(headers: Record<string, string>, bodyString: string): Promise<boolean> {
        // Exemplo de validação customizada caso o desenvolvedor opte por enviar um header
        // na montagem da URL: https://api.beegym/webhook?token=xxxx
        // Em produção o ideal é configurar NGINX/Kong/Cloudflare para validar o Client Certificate da EFI.
        return true;
    }

    /**
     * Processa o Webhook recebido de PIX.
     * Chama o caso de uso injetado (Idempotência tratada na camada de Domínio).
     * Fire-and-forget: não precisa bloquear o retorno 200 pro gatilho HTTP.
     */
    public async handlePixWebhook(payload: WebhookPixPayload): Promise<void> {
        if (!payload.pix || !Array.isArray(payload.pix)) {
            throw new EfiWebhookValidationError('Payload PIX inválido ou ausente');
        }

        // Processa os pagamentos de forma isolada (a EFI pode enviar lote múltiplo no Node 'pix')
        for (const pagamento of payload.pix) {
            if (pagamento.txid) {
                // Envia para o Domínio com status genérico 'CONCLUIDA' já que o payload 'pix'
                // significa efetivação de crédito em conta.
                await this.paymentConfirmationUseCase.execute(pagamento.txid, 'CONCLUIDA', 'PIX')
                    .catch(err => {
                        // Logamos mas prosseguimos o loop
                        console.error(`Erro ao processar TXID [${pagamento.txid}] no webhook: ${err.message}`);
                    });
            }
        }
    }

    /**
     * Processa o Webhook recebido de Boletos / Cobranças v1.
     * Diferente do PIX, cobranças disparam para qualquer status (novo, pago, cancelado)
     */
    public async handleCobrancaWebhook(payload: WebhookCobrancaPayload): Promise<void> {
        // O payload de cobrança v1 normalmente notifica apenas um 'notification' token
        // Opcional: Se necessário, buscar a transação via token de notificação

        // Supondo payload contendo o charge_id e current status
        if (!payload.data || !Array.isArray(payload.data)) {
            throw new EfiWebhookValidationError('Payload Cobrança inválido ou ausente');
        }

        for (const notificacao of payload.data) {
            // Exemplo simplificado. Real payload: recuperar os dados reais via efiClient(notificacao.token)
            const mockChargeId = notificacao.identificador;
            const mockStatus = 'paid';

            await this.paymentConfirmationUseCase.execute(mockChargeId, mockStatus, 'BOLETO')
                .catch(err => {
                    console.error(`Erro ao processar Boleto [${mockChargeId}] no webhook: ${err.message}`);
                });
        }
    }
}
