import { getServiceClient, corsHeaders } from '../_client.ts';

interface BankData {
  bank: string;
  account: string;
  agency?: string;
  accountType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() });

  try {
    const body = await req.json();
    const { walletId, amount, pixKey, bankData, withdrawalType } = body || {};
    
    if (!walletId || !amount || amount <= 0) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Dados inválidos' 
      }), { headers: corsHeaders(), status: 400 });
    }

    const supabase = getServiceClient();

    // Verificar saldo da carteira
    const { data: wallet, error: walletError } = await supabase
      .from('credit_wallets')
      .select('balance, responsible_user_id')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Carteira não encontrada' 
      }), { headers: corsHeaders(), status: 404 });
    }

    if (wallet.balance < amount) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Saldo insuficiente' 
      }), { headers: corsHeaders(), status: 400 });
    }

    // Criar transação de saque
    const withdrawalDescription = withdrawalType === 'pix' 
      ? `Saque via PIX: ${pixKey}` 
      : `Saque bancário: ${bankData?.bank} - ${bankData?.account}`;

    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        wallet_id: walletId,
        type: 'spent',
        amount: amount,
        description: withdrawalDescription,
        reference_type: 'withdrawal',
        created_by: wallet.responsible_user_id
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Processar transferência via Mercado Pago
    let transferResult;
    
    if (withdrawalType === 'pix') {
      transferResult = await processPixTransfer(amount, pixKey);
    } else {
      transferResult = await processBankTransfer(amount, bankData);
    }

    if (transferResult.success) {
      // A transação já foi criada e o saldo já foi debitado automaticamente pelo trigger
      return new Response(JSON.stringify({ 
        ok: true, 
        transactionId: transaction.id,
        transferId: transferResult.transferId,
        message: 'Saque processado com sucesso'
      }), { headers: corsHeaders() });
    } else {
      // Falha na transferência - reverter a transação
      await supabase.from('credit_transactions').delete().eq('id', transaction.id);

      return new Response(JSON.stringify({ 
        ok: false, 
        error: transferResult.error 
      }), { headers: corsHeaders(), status: 500 });
    }

  } catch (e) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: String(e?.message ?? e) 
    }), { headers: corsHeaders(), status: 500 });
  }
});

// Função para processar PIX via Mercado Pago
async function processPixTransfer(amount: number, pixKey: string) {
  try {
    // Aqui você integraria com a API real do Mercado Pago
    // Documentação: https://www.mercadopago.com.br/developers/pt/reference/money_requests/_money_requests/post
    
    const transferData = {
      amount: amount,
      currency_id: 'BRL',
      payment_method_id: 'pix',
      payment_method_option_id: 'bank_transfer',
      payer: {
        entity_type: 'individual',
        type: 'customer',
        identification: {
          type: 'CPF',
          number: pixKey // se for CPF
        }
      }
    };

    // Mock da resposta - substitua pela chamada real
    const mockTransferId = `MP_${Date.now()}`;
    
    return {
      success: true,
      transferId: mockTransferId
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao processar PIX'
    };
  }
}

// Função para processar transferência bancária
async function processBankTransfer(amount: number, bankData: BankData) {
  try {
    // Implementar transferência bancária via Mercado Pago
    const mockTransferId = `MP_BANK_${Date.now()}`;
    
    return {
      success: true,
      transferId: mockTransferId
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao processar transferência bancária'
    };
  }
}