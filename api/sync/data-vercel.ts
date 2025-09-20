// Este arquivo é usado apenas para deploy no Vercel
// Durante desenvolvimento, o middleware do Vite é usado

// Armazenamento temporário em memória (em produção, usar banco de dados)
let syncData: any = null;

export default function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Retornar dados sincronizados
        return res.status(200).json({
          success: true,
          data: syncData,
          timestamp: Date.now()
        });

      case 'POST':
        // Salvar dados para sincronização
        const { matches, userId } = req.body;
        
        if (!matches) {
          return res.status(400).json({
            success: false,
            error: 'Dados de partidas são obrigatórios'
          });
        }

        // Atualizar dados sincronizados
        syncData = {
          matches: matches,
          lastUpdated: Date.now(),
          updatedBy: userId || 'anonymous'
        };

        return res.status(200).json({
          success: true,
          message: 'Dados sincronizados com sucesso',
          timestamp: syncData.lastUpdated
        });

      case 'DELETE':
        // Limpar dados sincronizados
        syncData = {
          matches: [],
          lastUpdated: Date.now()
        };

        return res.status(200).json({
          success: true,
          message: 'Dados limpos com sucesso'
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Método não permitido'
        });
    }
  } catch (error) {
    console.error('Erro no endpoint de sincronização:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}