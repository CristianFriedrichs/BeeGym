import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EfiWebhookService } from '../efi.webhook';
import { IPaymentConfirmationUseCase } from '../efi.types';
import { EfiWebhookValidationError } from '../efi.errors';

describe('EfiWebhookService', () => {
    const mockUseCase: IPaymentConfirmationUseCase = {
        execute: vi.fn().mockResolvedValue(undefined),
    };

    let service: EfiWebhookService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new EfiWebhookService(mockUseCase);
    });

    // -------- PIX --------
    it('deve processar múltiplos pix no payload', async () => {
        const payload = {
            pix: [
                { txid: 'tx1', endToEndId: 'e1', chave: 'c1', valor: '10', horario: 'h1' },
                { txid: 'tx2', endToEndId: 'e2', chave: 'c1', valor: '20', horario: 'h2' },
            ],
        };

        await service.handlePixWebhook(payload as any);

        expect(mockUseCase.execute).toHaveBeenCalledTimes(2);
        expect(mockUseCase.execute).toHaveBeenCalledWith('tx1', 'CONCLUIDA', 'PIX');
        expect(mockUseCase.execute).toHaveBeenCalledWith('tx2', 'CONCLUIDA', 'PIX');
    });

    it('deve lançar erro se o payload pix for inválido', async () => {
        await expect(service.handlePixWebhook({} as any)).rejects.toThrow(EfiWebhookValidationError);
    });

    // -------- BOLETO --------
    it('deve processar notificações de cobrança múltiplas', async () => {
        const payload = {
            data: [
                { identificador: 'charge_123' },
                { identificador: 'charge_456' },
            ],
        };

        await service.handleCobrancaWebhook(payload as any);

        expect(mockUseCase.execute).toHaveBeenCalledTimes(2);
        expect(mockUseCase.execute).toHaveBeenCalledWith('charge_123', 'paid', 'BOLETO');
        expect(mockUseCase.execute).toHaveBeenCalledWith('charge_456', 'paid', 'BOLETO');
    });

    it('deve lançar erro se o payload de cobrança for inválido', async () => {
        await expect(service.handleCobrancaWebhook({} as any)).rejects.toThrow(EfiWebhookValidationError);
    });

    // -------- SECRET VALIDATION --------
    it('deve validar um request retornando true para bypass de desenvolvimento', async () => {
        const headers = { 'x-webhook-signature': 'sha256=123456789' };
        const bodyString = JSON.stringify({ pix: [] });

        const isValid = await service.validateRequest(headers, bodyString);
        expect(isValid).toBe(true);
    });
});
