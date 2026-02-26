/**
 * Tipagens para o Gateway EFI
 */

export type EfiEnv = 'homologacao' | 'producao';

export interface EfiConfig {
    ambiente: EfiEnv;
    clientId: string;
    clientSecret: string;
    certPath: string;
    certPassword?: string;
    webhookSecret: string;
    baseUrlPix: string;
    baseUrlOauth: string;
}

// ------------------------
// PIX
// ------------------------

export interface CriarPixInput {
    calendario: {
        expiracao: number; // Em segundos
    };
    devedor: {
        cpf?: string;
        cnpj?: string;
        nome: string;
    };
    valor: {
        original: string; // Ex: "10.00"
    };
    chave: string; // Chave Pix cadastrada na EFI
    solicitacaoPagador?: string;
}

export type PixStatus = 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA_PELO_USUARIO_RECEBEDOR' | 'REMOVIDA_PELO_PSP';

export interface PixCobranca {
    txid: string;
    calendario: {
        criacao: string;
        expiracao: number;
    };
    status: PixStatus;
    valor: {
        original: string;
    };
    chave: string;
    solicitacaoPagador?: string;
    pixCopiaECola: string;
    revisao: number;
    infoAdicionais?: Array<{
        nome: string;
        valor: string;
    }>;
}

export interface ListarPixFiltros {
    inicio: string; // Data inicial, ISO 8601 ex: 2021-01-01T00:00:00Z
    fim: string;    // Data final, ISO 8601 ex: 2021-01-31T23:59:59Z
    status?: PixStatus;
}

export interface ListarPixResponse {
    parametros: {
        inicio: string;
        fim: string;
        paginacao: {
            paginaAtual: number;
            itensPorPagina: number;
            quantidadeDePaginas: number;
            quantidadeTotalDeItens: number;
        };
    };
    cobs: PixCobranca[];
}

// ------------------------
// WEBHOOKS
// ------------------------

export interface WebhookPixPayload {
    pix: Array<{
        endToEndId: string;
        txid: string;
        chave: string;
        valor: string;
        horario: string;
        infoPagador?: string;
        devolucoes?: Array<any>;
    }>;
}

export interface WebhookCobrancaPayload {
    // A definir com base na documentação exata de cobranças da EFI
    data: Array<{
        identificador: string;
        notification?: string;
    }>;
}

// ------------------------
// BOLETOS / COBRANÇAS
// ------------------------

export interface CriarBoletoInput {
    items: Array<{
        name: string;
        value: number; // Em centavos. Ex: R$ 10,00 -> 1000
        amount: number;
    }>;
    customer: {
        name: string;
        cpf?: string;
        cnpj?: string;
        phone_number?: string;
        email?: string;
        birth?: string; // YYYY-MM-DD
    };
    expire_at: string; // YYYY-MM-DD
    message?: string;
}

export type BoletoStatus = 'waiting' | 'paid' | 'unpaid' | 'canceled' | 'settled' | 'link' | 'expired';

export interface BoletoCobranca {
    code: number;
    data: {
        barcode: string;
        link: string;
        billet_link: string;
        pdf: {
            charge: string;
        };
        expire_at: string;
        charge_id: number;
        status: BoletoStatus;
        total: number;
        custom_id?: string;
        created_at: string;
    };
}

// ------------------------
// INJEÇÃO DE DEPENDÊNCIA
// ------------------------

export interface IPaymentConfirmationUseCase {
    execute(txidOrChargeId: string, status: string, method: 'PIX' | 'BOLETO'): Promise<void>;
}
