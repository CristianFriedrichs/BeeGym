import axios, { AxiosInstance, AxiosError } from 'axios';
import { efiConfig } from './efi.config';
import { efiAuthService } from './efi.auth';
import { EfiApiError } from './efi.errors';

const MAX_RETRIES = 3;

class EfiClientFactory {
    /**
     * Cria a instância do Axios pré-configurada
     */
    public createClient(): AxiosInstance {
        const client = axios.create({
            baseURL: efiConfig.baseUrlPix, // Base URL padrao é PIX, cobraça pode sobrepor
            timeout: 15000,
            httpsAgent: efiAuthService.getHttpsAgent(), // Injetando o certificado mTLS
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupRequestInterceptor(client);
        this.setupResponseInterceptor(client);

        return client;
    }

    /**
     * Intercepta a requisição ANTES dela sair para injetar o Token
     */
    private setupRequestInterceptor(client: AxiosInstance) {
        client.interceptors.request.use(
            async (config) => {
                // Obter token garantido (novo ou do cache)
                const token = await efiAuthService.getToken();

                // Injetar o Bearer Token
                config.headers.Authorization = `Bearer ${token}`;

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    /**
     * Intercepta a resposta para tratamento de erro e retentativas (Retry)
     */
    private setupResponseInterceptor(client: AxiosInstance) {
        client.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error: AxiosError | any) => {
                const config = error.config;

                // Inicializa o contador de retrys na configuracao
                if (!config || !config.retryCount) {
                    if (config) config.retryCount = 0;
                }

                // Condições para ativar o Retry: Timeout ou erro 5xx, maximo 3 vezes
                const shouldRetry = config &&
                    config.retryCount < MAX_RETRIES &&
                    (error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500));

                if (shouldRetry) {
                    config.retryCount += 1;
                    console.warn(`[EFI Gateway] Requisição falhou. Tentativa de retry ${config.retryCount}/${MAX_RETRIES}...`);

                    // Aguarda um pequeno delay (Backoff simples: 1s, 2s, 3s)
                    await new Promise(resolve => setTimeout(resolve, config.retryCount * 1000));

                    // Retenta a requisição original
                    return client(config);
                }

                // Se falhou e não devemos retentar, normalizamos o erro para o App Error Customizado
                if (error.response) {
                    const status = error.response.status;
                    const data = error.response.data as any;

                    let efiCode = 'UNKNOWN';
                    let efiMessage = 'Erro desconhecido retornado pela API EFI';

                    // A API da EFI retorna os erros com chaves `nome` e `mensagem` geralmente
                    if (data) {
                        efiCode = data.nome || data.error || 'UNKNOWN';
                        efiMessage = data.mensagem || data.error_description || JSON.stringify(data);
                    }

                    console.error(`[EFI Gateway] API Error: ${status} - ${efiCode} - ${efiMessage}`);

                    throw new EfiApiError(
                        `Erro na API EFI: ${efiMessage}`,
                        status,
                        efiCode,
                        efiMessage
                    );
                }

                // Erros de rede sem response (Timeout final, Drop connection)
                console.error(`[EFI Gateway] Network Error: ${error.message}`);
                throw error;
            }
        );
    }
}

// Client Exportado (Pronto para Uso)
export const efiClient = new EfiClientFactory().createClient();
