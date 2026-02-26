import { efiClient } from './efi.client';
import { efiConfig } from './efi.config';
import {
    CriarBoletoInput,
    BoletoCobranca
} from './efi.types';

/**
 * Nota da API de Cobranças:
 * As APIs de Boletos usam a base URL `https://cobrancas.api.efipay.com.br` ao invés da API PIX.
 * Precisamos gerenciar isso internamente se o efi.client.ts estiver apontando só para o PIX.
 */

export class EfiBoletoService {
    /**
     * Helper para trocar dinamicamente a URL base
     */
    private getBaseUrl() {
        return efiConfig.baseUrlOauth.replace('/v1/authorize', '');
    }

    /**
     * Criação simplificada de cobrança e em seguida vínculo de boleto, 
     * ou chamada para api `POST /v1/charge/one-step` (caso documentado pela EFI)
     * 
     * O fluxo original da API Gerencianet v1 requer:
     * 1. Criar transação (charge)
     * 2. Pagar transação via método billet (banking_billet)
     */
    public async criarBoleto(dados: CriarBoletoInput): Promise<BoletoCobranca> {

        const baseUrl = this.getBaseUrl();

        // Passo 1: Criar Cobrança (Charge)
        const chargeResponse = await efiClient.post(`${baseUrl}/v1/charge`, {
            items: dados.items,
            metadata: dados.message ? { custom_id: dados.message } : undefined
        });

        const chargeId = chargeResponse.data.data.charge_id;

        // Passo 2: Emitir o boleto para o charge_id criadado
        const payResponse = await efiClient.post(`${baseUrl}/v1/charge/${chargeId}/pay`, {
            payment: {
                banking_billet: {
                    expire_at: dados.expire_at,
                    customer: dados.customer
                }
            }
        });

        return payResponse.data as BoletoCobranca;
    }

    /**
     * Consultar dados de um boleto / charge
     */
    public async consultarBoleto(chargeId: number): Promise<BoletoCobranca> {
        const baseUrl = this.getBaseUrl();
        const response = await efiClient.get(`${baseUrl}/v1/charge/${chargeId}`);
        return response.data as BoletoCobranca;
    }

    /**
     * Cancelar um boleto existente e aguardando pagamento
     */
    public async cancelarBoleto(chargeId: number): Promise<void> {
        const baseUrl = this.getBaseUrl();
        await efiClient.put(`${baseUrl}/v1/charge/${chargeId}/cancel`);
    }

    /**
     * Obter a URL visível (PDF/HTML) do boleto. Consulta primeira e tira do payload.
     */
    public async obterUrlBoleto(chargeId: number): Promise<string> {
        const boleto = await this.consultarBoleto(chargeId);

        // Na API da EFI v1, a URL do boleto gerado fica em data.link ou data.pdf.charge
        if (boleto.data.pdf && boleto.data.pdf.charge) {
            return boleto.data.pdf.charge;
        }

        if (boleto.data.link) {
            return boleto.data.link;
        }

        throw new Error(`Não foi possível resgatar URL do boleto para charge_id: ${chargeId}`);
    }
}

// Singleton export
export const efiBoleto = new EfiBoletoService();
