import dotenv from 'dotenv';
import { EfiConfig, EfiEnv } from './efi.types';
import { EfiAuthError } from './efi.errors';

// Garante que o .env seja carregado
dotenv.config();

export function getEfiConfig(): EfiConfig {
    const ambiente = (process.env.EFI_AMBIENTE as EfiEnv) || 'homologacao';

    const isProd = ambiente === 'producao';

    const clientId = isProd ? process.env.EFI_CLIENT_ID_PRD : process.env.EFI_CLIENT_ID_HML;
    const clientSecret = isProd ? process.env.EFI_CLIENT_SECRET_PRD : process.env.EFI_CLIENT_SECRET_HML;
    const baseUrlPix = isProd ? process.env.EFI_BASE_URL_PRD : process.env.EFI_BASE_URL_HML;
    const baseUrlOauth = isProd ? process.env.EFI_OAUTH_URL_PRD : process.env.EFI_OAUTH_URL_HML;

    const certPath = process.env.EFI_CERT_PATH;
    const certPassword = process.env.EFI_CERT_PASSWORD;
    const webhookSecret = process.env.EFI_WEBHOOK_SECRET;

    if (!clientId || !clientSecret) {
        throw new EfiAuthError(`As credenciais EFI_CLIENT_ID e EFI_CLIENT_SECRET para o ambiente '${ambiente}' não estão configuradas no .env`);
    }

    if (!certPath) {
        throw new EfiAuthError('O caminho para o certificado mTLS (EFI_CERT_PATH) não está configurado no .env');
    }

    if (!baseUrlPix || !baseUrlOauth) {
        throw new EfiAuthError(`As URLs base (EFI_BASE_URL e EFI_OAUTH_URL) para o ambiente '${ambiente}' não estão configuradas no .env`);
    }

    return {
        ambiente,
        clientId,
        clientSecret,
        certPath,
        certPassword,
        webhookSecret: webhookSecret || '',
        baseUrlPix,
        baseUrlOauth,
    };
}

// Exporta o singleton de configuração
export const efiConfig = getEfiConfig();
