import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WalletOperation {
  walletId: string;
  amount: number;
  type: 'deposit' | 'payment' | 'withdrawal' | 'refund' | 'transfer_in' | 'transfer_out';
  description: string;
  referenceType?: string;
  referenceId?: string;
  pixTransactionId?: string;
}

interface PaymentOperation {
  walletId: string;
  paymentOptionId: string;
  quantity?: number;
}

interface WithdrawalRequest {
  walletId: string;
  amount: number;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'wallet_operation':
        return await handleWalletOperation(supabaseClient, data as WalletOperation)
      
      case 'process_payment':
        return await handlePayment(supabaseClient, data as PaymentOperation)
      
      case 'request_withdrawal':
        return await handleWithdrawalRequest(supabaseClient, data as WithdrawalRequest)
      
      case 'get_wallet':
        return await getWallet(supabaseClient, data.walletId)
      
      case 'get_transactions':
        return await getTransactions(supabaseClient, data.walletId, data.limit || 50)
      
      case 'get_payment_options':
        return await getPaymentOptions(supabaseClient, data.groupId)
      
      case 'test':
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Função Edge funcionando corretamente!',
            timestamp: new Date().toISOString(),
            data: data || {}
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      
      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleWalletOperation(supabaseClient: any, operation: WalletOperation) {
  // Validações básicas
  if (!operation.walletId || !operation.amount || !operation.type) {
    return new Response(
      JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  // Buscar carteira atual
  const { data: wallet, error: walletError } = await supabaseClient
    .from('digital_wallets')
    .select('*')
    .eq('id', operation.walletId)
    .eq('is_active', true)
    .single()

  if (walletError || !wallet) {
    return new Response(
      JSON.stringify({ error: 'Carteira não encontrada ou inativa' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  // Verificar saldo para operações de débito
  if (['payment', 'withdrawal', 'transfer_out'].includes(operation.type) && 
      wallet.balance_brl < operation.amount) {
    return new Response(
      JSON.stringify({ 
        error: 'Saldo insuficiente',
        required: operation.amount,
        available: wallet.balance_brl
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  // Criar transação
  const { data: transaction, error: transactionError } = await supabaseClient
    .from('wallet_transactions')
    .insert({
      wallet_id: operation.walletId,
      type: operation.type,
      amount_brl: operation.amount,
      description: operation.description,
      reference_type: operation.referenceType || 'manual',
      reference_id: operation.referenceId,
      pix_transaction_id: operation.pixTransactionId,
      status: 'completed'
    })
    .select()
    .single()

  if (transactionError) {
    console.error('Erro ao criar transação:', transactionError)
    return new Response(
      JSON.stringify({ error: 'Erro ao processar transação' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  // Buscar saldo atualizado
  const { data: updatedWallet } = await supabaseClient
    .from('digital_wallets')
    .select('balance_brl')
    .eq('id', operation.walletId)
    .single()

  return new Response(
    JSON.stringify({ 
      success: true,
      transaction: transaction,
      newBalance: updatedWallet?.balance_brl || 0
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handlePayment(supabaseClient: any, payment: PaymentOperation) {
  // Usar a função do banco para processar pagamento
  const { data, error } = await supabaseClient
    .rpc('process_payment', {
      p_wallet_id: payment.walletId,
      p_payment_option_id: payment.paymentOptionId,
      p_quantity: payment.quantity || 1
    })

  if (error) {
    console.error('Erro ao processar pagamento:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao processar pagamento' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  if (!data.success) {
    return new Response(
      JSON.stringify(data),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function handleWithdrawalRequest(supabaseClient: any, withdrawal: WithdrawalRequest) {
  // Usar a função do banco para solicitar saque
  const { data, error } = await supabaseClient
    .rpc('request_withdrawal', {
      p_wallet_id: withdrawal.walletId,
      p_amount_brl: withdrawal.amount,
      p_pix_key: withdrawal.pixKey,
      p_pix_key_type: withdrawal.pixKeyType
    })

  if (error) {
    console.error('Erro ao solicitar saque:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao solicitar saque' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  if (!data.success) {
    return new Response(
      JSON.stringify(data),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function getWallet(supabaseClient: any, walletId: string) {
  const { data: wallet, error } = await supabaseClient
    .from('digital_wallets')
    .select('*')
    .eq('id', walletId)
    .eq('is_active', true)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Carteira não encontrada' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ wallet }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function getTransactions(supabaseClient: any, walletId: string, limit: number = 50) {
  const { data: transactions, error } = await supabaseClient
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar transações' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ transactions }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function getPaymentOptions(supabaseClient: any, groupId?: string) {
  let query = supabaseClient
    .from('payment_options')
    .select('*')
    .eq('is_active', true)

  if (groupId) {
    query = query.or(`group_id.is.null,group_id.eq.${groupId}`)
  } else {
    query = query.is('group_id', null)
  }

  const { data: options, error } = await query.order('category', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar opções de pagamento' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  return new Response(
    JSON.stringify({ paymentOptions: options }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}