import { PixConfiguration, PixTransaction } from '@/hooks/usePixPayment';

/**
 * Interface para resposta dos provedores PIX
 */
export interface PixProviderResponse {
  qr_code: string;
  qr_code_image?: string;
  txid: string;
  end_to_end_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider_response: Record<string, any>;
}

/**
 * Classe base para provedores PIX
 */
abstract class PixProvider {
  protected config: PixConfiguration;

  constructor(config: PixConfiguration) {
    this.config = config;
  }

  abstract createPixTransaction(transaction: PixTransaction): Promise<PixProviderResponse>;
  abstract getTransactionStatus(txid: string): Promise<string>;
  abstract validateWebhook(payload: any, signature: string): boolean;
}

/**
 * Provedor Mercado Pago
 */
export class MercadoPagoProvider extends PixProvider {
  private accessToken: string;
  private publicKey: string;
  private baseUrl: string;

  constructor(config: PixConfiguration) {
    super(config);
    this.accessToken = config.config.access_token;
    this.publicKey = config.config.public_key;
    this.baseUrl = config.config.base_url || 'https://api.mercadopago.com';
  }

  async createPixTransaction(transaction: PixTransaction): Promise<PixProviderResponse> {
    try {
      // Criar payment no Mercado Pago
      const paymentData = {
        transaction_amount: transaction.amount_brl,
        description: transaction.description || 'Pagamento Maestros FC',
        payment_method_id: 'pix',
        payer: {
          email: transaction.email || 'test@example.com',
          identification: {
            type: 'CPF',
            number: '12345678901' // Em produção, usar CPF real
          }
        },
        notification_url: `${window.location.origin}/api/pix/webhook/mercadopago`,
        external_reference: transaction.external_id
      };

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': transaction.external_id
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mercado Pago API Error: ${error.message || 'Unknown error'}`);
      }

      const payment = await response.json();

      // Buscar dados do PIX
      const pixResponse = await fetch(`${this.baseUrl}/v1/payments/${payment.id}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const pixData = await pixResponse.json();

      return {
        qr_code: pixData.point_of_interaction?.transaction_data?.qr_code || '',
        qr_code_image: pixData.point_of_interaction?.transaction_data?.qr_code_base64,
        txid: payment.id.toString(),
        end_to_end_id: pixData.point_of_interaction?.transaction_data?.ticket_url,
        status: payment.status === 'approved' ? 'completed' : 'pending',
        provider_response: payment
      };
    } catch (error) {
      console.error('❌ Erro ao criar transação PIX no Mercado Pago:', error);
      throw error;
    }
  }

  async getTransactionStatus(txid: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${txid}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar status da transação');
      }

      const payment = await response.json();
      
      switch (payment.status) {
        case 'approved': return 'completed';
        case 'pending': return 'pending';
        case 'rejected': return 'failed';
        case 'cancelled': return 'cancelled';
        default: return 'pending';
      }
    } catch (error) {
      console.error('❌ Erro ao buscar status no Mercado Pago:', error);
      return 'failed';
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Implementar validação de webhook do Mercado Pago
    // Por enquanto, retorna true para testes
    return true;
  }
}

/**
 * Provedor PagSeguro
 */
export class PagSeguroProvider extends PixProvider {
  private email: string;
  private token: string;
  private baseUrl: string;

  constructor(config: PixConfiguration) {
    super(config);
    this.email = config.config.email;
    this.token = config.config.token;
    this.baseUrl = config.config.base_url || 'https://ws.pagseguro.uol.com.br';
  }

  async createPixTransaction(transaction: PixTransaction): Promise<PixProviderResponse> {
    try {
      // Criar transação no PagSeguro
      const transactionData = {
        email: this.email,
        token: this.token,
        currency: 'BRL',
        itemId1: transaction.external_id,
        itemDescription1: transaction.description || 'Pagamento Maestros FC',
        itemAmount1: transaction.amount_brl.toFixed(2),
        itemQuantity1: 1,
        reference: transaction.external_id,
        notificationURL: `${window.location.origin}/api/pix/webhook/pagseguro`,
        paymentMethod: 'pix'
      };

      const formData = new URLSearchParams();
      Object.entries(transactionData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch(`${this.baseUrl}/v2/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PagSeguro API Error: ${errorText}`);
      }

      const transactionResult = await response.text();
      
      // Parse XML response (PagSeguro retorna XML)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(transactionResult, 'text/xml');
      const code = xmlDoc.querySelector('code')?.textContent;
      const paymentLink = xmlDoc.querySelector('paymentLink')?.textContent;

      return {
        qr_code: paymentLink || '',
        txid: code || transaction.external_id,
        status: 'pending',
        provider_response: { xml_response: transactionResult }
      };
    } catch (error) {
      console.error('❌ Erro ao criar transação PIX no PagSeguro:', error);
      throw error;
    }
  }

  async getTransactionStatus(txid: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/transactions/${txid}?email=${this.email}&token=${this.token}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar status da transação');
      }

      const xmlResponse = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');
      const status = xmlDoc.querySelector('status')?.textContent;

      switch (status) {
        case '3': return 'completed'; // Pago
        case '1': return 'pending';   // Aguardando pagamento
        case '7': return 'cancelled'; // Cancelado
        default: return 'pending';
      }
    } catch (error) {
      console.error('❌ Erro ao buscar status no PagSeguro:', error);
      return 'failed';
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Implementar validação de webhook do PagSeguro
    return true;
  }
}

/**
 * Provedor Offline (para testes)
 */
export class OfflineProvider extends PixProvider {
  async createPixTransaction(transaction: PixTransaction): Promise<PixProviderResponse> {
    // Simular criação de transação PIX
    const qrCode = `pix_offline_${transaction.external_id}_${Date.now()}`;
    
    return {
      qr_code: qrCode,
      txid: `offline_${transaction.external_id}`,
      status: 'pending',
      provider_response: {
        provider: 'offline',
        mode: 'test',
        created_at: new Date().toISOString()
      }
    };
  }

  async getTransactionStatus(txid: string): Promise<string> {
    // Simular status aleatório para testes
    const statuses = ['pending', 'completed', 'failed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  validateWebhook(payload: any, signature: string): boolean {
    return true;
  }
}

/**
 * Factory para criar provedores PIX
 */
export function createPixProvider(config: PixConfiguration): PixProvider {
  switch (config.provider) {
    case 'mercadopago':
      return new MercadoPagoProvider(config);
    case 'pagseguro':
      return new PagSeguroProvider(config);
    case 'offline':
      return new OfflineProvider(config);
    default:
      throw new Error(`Provedor PIX não suportado: ${config.provider}`);
  }
}

/**
 * Utilitários para PIX
 */
export const PixUtils = {
  /**
   * Validar chave PIX
   */
  validatePixKey(pixKey: string, keyType: string): boolean {
    switch (keyType) {
      case 'cpf':
        return /^\d{11}$/.test(pixKey);
      case 'cnpj':
        return /^\d{14}$/.test(pixKey);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
      case 'phone':
        return /^\d{10,13}$/.test(pixKey);
      case 'random':
        return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(pixKey);
      default:
        return false;
    }
  },

  /**
   * Gerar código PIX único
   */
  generatePixCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Formatar valor monetário
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
};
