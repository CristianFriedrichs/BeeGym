import { NextRequest, NextResponse } from 'next/server';
import { EfiWebhookService, efiConfig } from '@/payments/efi';
import { ConfirmInvoiceUseCase } from '@/application/use-cases/ConfirmInvoiceUseCase';
import { EfiWebhookValidationError } from '@/payments/efi/efi.errors';

export async function POST(request: NextRequest) {
    try {
        // Para ambientes serverless, instanciamos os services necessários
        const confirmInvoiceUseCase = new ConfirmInvoiceUseCase();
        const webhookService = new EfiWebhookService(confirmInvoiceUseCase);

        // Converte os headers para um formato suportado
        const headersList: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headersList[key.toLowerCase()] = value;
        });

        const textBody = await request.text();

        // Validação de autenticidade (Mock ou validação real de mTLS/Signature)
        const isValid = await webhookService.validateRequest(headersList, textBody);
        if (!isValid) {
            console.error('[EFI Webhook] Requisição não autorizada falhou na validação de origem.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = JSON.parse(textBody);

        // O PIX Webhook root element costuma ser `pix`
        if (payload.pix) {
            // Fire-and-forget: não bloquear a reposta 200 pro EFI Gateway
            webhookService.handlePixWebhook(payload).catch((err) => {
                console.error('[EFI Webhook PIX] Erro de background:', err);
            });
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // O Cobranças Webhook root element costuma ter `data` / `notification` ou base structure
        if (payload.data && Array.isArray(payload.data)) {
            webhookService.handleCobrancaWebhook(payload).catch((err) => {
                console.error('[EFI Webhook Cobranca] Erro de background:', err);
            });
            return NextResponse.json({ received: true }, { status: 200 });
        }

        throw new EfiWebhookValidationError('Payload desconhecido na raiz do webhook');

    } catch (error: any) {
        console.error('[EFI Webhook] Erro geral:', error.message);

        // Retornamos 200 para evitar retentativas desnecessárias em erros de payload parsing,
        // ou 400 apenas se requirido caso a caso. 200 é mais seguro.
        return NextResponse.json({ received: true, error: error.message }, { status: 200 });
    }
}
