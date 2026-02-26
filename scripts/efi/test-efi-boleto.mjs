/**
 * TESTE 3 — Criar Boleto Bancário
 * Cria um boleto real em HML e verifica link e barcode.
 *
 * Executar: npm run test:efi:boleto
 */

import 'dotenv/config';
import https from 'node:https';
import fs from 'node:fs';
import axios from 'axios';

const CLIENT_ID_HML = process.env.EFI_CLIENT_ID_HML;
const CLIENT_SECRET_HML = process.env.EFI_CLIENT_SECRET_HML;
const CERT_PATH = process.env.EFI_CERT_PATH;
const BASE_URL_BOLETO = process.env.EFI_OAUTH_URL_HML.replace('/v1/authorize', '');
const OAUTH_URL = process.env.EFI_OAUTH_URL_HML;

async function testBoleto() {
    console.log('\n🎫 [TESTE 3] Criação de Boleto\n');

    if (!fs.existsSync(CERT_PATH)) {
        console.error(`❌ Certificado não encontrado em: ${CERT_PATH}`);
        process.exit(1);
    }

    const cert = fs.readFileSync(CERT_PATH);
    const agent = new https.Agent({ pfx: cert, passphrase: process.env.EFI_CERT_PASSWORD || '' });

    // 1. Autenticar via endpoint de cobranças (boleto usa URL diferente do Pix)
    const tokenResp = await axios.post(
        OAUTH_URL,
        { grant_type: 'client_credentials' },
        {
            headers: {
                Authorization: `Basic ${Buffer.from(
                    `${CLIENT_ID_HML}:${CLIENT_SECRET_HML}`
                ).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            httpsAgent: agent,
        }
    );
    const token = tokenResp.data.access_token;
    console.log('   ✅ Token obtido');

    // 2. Criar boleto
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 3); // vence em 3 dias
    const expireDateStr = expireDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const payload = {
        items: [{ name: 'Teste BeeGym Integração', value: 1, amount: 1 }], // R$ 0,01
        customer: {
            name: 'Cliente Teste Antigravity',
            cpf: '94271564656',
            email: 'teste@beegym.com.br',
            phone_number: '11999999999',
        },
        expire_at: expireDateStr,
        message: '[TESTE HML] Verificação de integração EFI - BeeGym',
    };

    const boletoResp = await axios.post(
        `${BASE_URL_BOLETO}/v1/charge`,
        payload,
        {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            httpsAgent: agent,
        }
    );

    const chargeId = boletoResp.data.data.charge_id;

    // 3. Pagar transação via método billet (banking_billet)
    const payResp = await axios.post(`${BASE_URL_BOLETO}/v1/charge/${chargeId}/pay`, {
        payment: {
            banking_billet: {
                expire_at: expireDateStr,
                customer: payload.customer
            }
        }
    }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        httpsAgent: agent,
    });

    const boleto = payResp.data.data;
    console.log(`   ✅ Boleto criado!`);
    console.log(`   charge_id: ${boleto.charge_id}`);
    console.log(`   Status: ${boleto.status}`);
    console.log(`   Barcode: ${boleto.barcode}`);
    console.log(`   Link: ${boleto.link}`);

    console.log('\n🟢 RESULTADO: PASSOU\n');
}

testBoleto().catch((err) => {
    console.error('🔴 FALHOU:', err.response?.data || err.message);
    process.exit(1);
});
