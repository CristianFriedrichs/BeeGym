import axios from 'axios';
import https from 'https';
import fs from 'fs';
import { efiConfig } from './efi.config';
import { EfiAuthError, EfiCertError } from './efi.errors';

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface TokenCache {
    token: string;
    expiresAt: number;
}

class EfiAuthService {
    private cache: TokenCache | null = null;
    private httpsAgent: https.Agent | null = null;

    /**
     * Inicializa e retorna o Agent HTTPS configurado com o certificado mTLS
     */
    public getHttpsAgent(): https.Agent {
        if (this.httpsAgent) return this.httpsAgent;

        try {
            if (!fs.existsSync(efiConfig.certPath)) {
                throw new EfiCertError(`Certificado não encontrado no caminho: ${efiConfig.certPath}`);
            }

            const certBuffer = fs.readFileSync(efiConfig.certPath);

            this.httpsAgent = new https.Agent({
                pfx: certBuffer,
                passphrase: efiConfig.certPassword || '',
            });

            return this.httpsAgent;
        } catch (error: any) {
            if (error instanceof EfiCertError) throw error;
            throw new EfiCertError(`Erro ao carregar certificado mTLS: ${error.message}`);
        }
    }

    /**
     * Obtém o token de acesso (via Cache ou nova requisição)
     */
    public async getToken(): Promise<string> {
        const now = Date.now();

        // Se temos um token no cache e ele expira em mais de 60 segundos, usa o cache
        if (this.cache && this.cache.expiresAt > now + 60000) {
            return this.cache.token;
        }

        return this.authenticate();
    }

    /**
     * Realiza a requisição OAuth2 para obter novo token
     */
    private async authenticate(): Promise<string> {
        try {
            // Basic Auth: base64(client_id:client_secret)
            const credentials = Buffer.from(`${efiConfig.clientId}:${efiConfig.clientSecret}`).toString('base64');

            const agent = this.getHttpsAgent();

            const response = await axios.post<TokenResponse>(
                efiConfig.baseUrlOauth,
                { grant_type: 'client_credentials' },
                {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                        'Content-Type': 'application/json',
                    },
                    httpsAgent: agent,
                }
            );

            const { access_token, expires_in } = response.data;

            // Salva no cache. expires_in vem em segundos.
            this.cache = {
                token: access_token,
                // expiresAt = agora + (tempo de expiracao em milissegundos)
                expiresAt: Date.now() + expires_in * 1000,
            };

            return access_token;
        } catch (error: any) {
            if (error.response) {
                throw new EfiAuthError(`Falha na autenticação EFI: [${error.response.status}] ${JSON.stringify(error.response.data)}`);
            }
            throw new EfiAuthError(`Falha na autenticação EFI: ${error.message}`);
        }
    }
}

// Singleton export
export const efiAuthService = new EfiAuthService();
