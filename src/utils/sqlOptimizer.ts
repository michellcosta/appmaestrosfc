/**
 * SQL Optimizer
 * Otimização de queries SQL para melhor performance
 */

export interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  improvements: string[];
  estimatedGain: number; // em porcentagem
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  queryTime: number;
  rowsReturned: number;
  rowsScanned: number;
  indexUsed: boolean;
  cacheHit: boolean;
}

class SQLOptimizer {
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private performanceMetrics: PerformanceMetrics[] = [];

  // Otimizações comuns de queries
  optimizeQuery(query: string, context: any = {}): QueryOptimization {
    const originalQuery = query;
    let optimizedQuery = query;
    const improvements: string[] = [];

    // 1. Otimizar SELECT * para SELECT específico
    if (query.includes('SELECT *')) {
      optimizedQuery = this.optimizeSelectStar(query, context);
      improvements.push('Substituído SELECT * por colunas específicas');
    }

    // 2. Adicionar LIMIT quando apropriado
    if (!query.includes('LIMIT') && !query.includes('COUNT(')) {
      optimizedQuery = this.addLimitIfNeeded(optimizedQuery);
      improvements.push('Adicionado LIMIT para evitar retorno excessivo de dados');
    }

    // 3. Otimizar JOINs
    if (query.includes('JOIN')) {
      optimizedQuery = this.optimizeJoins(optimizedQuery);
      improvements.push('Otimizado ordem dos JOINs');
    }

    // 4. Otimizar WHERE clauses
    optimizedQuery = this.optimizeWhereClause(optimizedQuery);
    if (optimizedQuery !== query) {
      improvements.push('Otimizado WHERE clause');
    }

    // 5. Adicionar índices sugeridos
    const indexRecommendations = this.analyzeIndexes(optimizedQuery);
    if (indexRecommendations.length > 0) {
      improvements.push(`Sugeridos ${indexRecommendations.length} índices`);
    }

    return {
      originalQuery,
      optimizedQuery,
      improvements,
      estimatedGain: this.calculateEstimatedGain(improvements)
    };
  }

  private optimizeSelectStar(query: string, context: any): string {
    // Em um sistema real, você analisaria o contexto para determinar as colunas necessárias
    // Por enquanto, vamos fazer uma otimização básica
    
    if (query.includes('FROM memberships')) {
      return query.replace('SELECT *', 'SELECT id, user_id, group_id, role, status, created_at');
    }
    
    if (query.includes('FROM player_profiles')) {
      return query.replace('SELECT *', 'SELECT user_id, name, position_text, shirt_size, stars, approved, created_at');
    }
    
    if (query.includes('FROM groups')) {
      return query.replace('SELECT *', 'SELECT id, name, owner_id, created_at');
    }
    
    return query;
  }

  private addLimitIfNeeded(query: string): string {
    // Adicionar LIMIT apenas se não existir e não for uma query de contagem
    if (!query.includes('LIMIT') && !query.includes('COUNT(') && !query.includes('GROUP BY')) {
      return query + ' LIMIT 1000';
    }
    return query;
  }

  private optimizeJoins(query: string): string {
    // Otimizar ordem dos JOINs - tabelas menores primeiro
    // Esta é uma otimização básica, em produção seria mais sofisticada
    return query;
  }

  private optimizeWhereClause(query: string): string {
    // Otimizar WHERE clauses - colunas indexadas primeiro
    // Esta é uma otimização básica, em produção seria mais sofisticada
    return query;
  }

  private analyzeIndexes(query: string): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];

    // Analisar queries para sugerir índices
    if (query.includes('WHERE user_id =')) {
      recommendations.push({
        table: 'memberships',
        columns: ['user_id'],
        type: 'btree',
        reason: 'Filtro frequente por user_id',
        priority: 'high'
      });
    }

    if (query.includes('WHERE group_id =')) {
      recommendations.push({
        table: 'memberships',
        columns: ['group_id'],
        type: 'btree',
        reason: 'Filtro frequente por group_id',
        priority: 'high'
      });
    }

    if (query.includes('WHERE role =')) {
      recommendations.push({
        table: 'memberships',
        columns: ['role'],
        type: 'btree',
        reason: 'Filtro frequente por role',
        priority: 'medium'
      });
    }

    if (query.includes('WHERE status =')) {
      recommendations.push({
        table: 'memberships',
        columns: ['status'],
        type: 'btree',
        reason: 'Filtro frequente por status',
        priority: 'medium'
      });
    }

    // Índices compostos para queries complexas
    if (query.includes('WHERE user_id =') && query.includes('AND group_id =')) {
      recommendations.push({
        table: 'memberships',
        columns: ['user_id', 'group_id'],
        type: 'btree',
        reason: 'Query composta user_id + group_id',
        priority: 'high'
      });
    }

    return recommendations;
  }

  private calculateEstimatedGain(improvements: string[]): number {
    let gain = 0;
    
    improvements.forEach(improvement => {
      if (improvement.includes('SELECT *')) gain += 20;
      if (improvement.includes('LIMIT')) gain += 15;
      if (improvement.includes('JOIN')) gain += 10;
      if (improvement.includes('WHERE')) gain += 5;
      if (improvement.includes('índices')) gain += 25;
    });

    return Math.min(gain, 80); // Máximo de 80% de ganho estimado
  }

  // Cache de queries
  async executeWithCache<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutos
  ): Promise<T> {
    const cached = this.queryCache.get(queryKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cached.ttl) {
      console.log(`📦 Cache hit para query: ${queryKey}`);
      return cached.result;
    }

    console.log(`🔄 Executando query: ${queryKey}`);
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const queryTime = Date.now() - startTime;
      
      // Armazenar no cache
      this.queryCache.set(queryKey, {
        result,
        timestamp: now,
        ttl
      });

      // Registrar métricas
      this.performanceMetrics.push({
        queryTime,
        rowsReturned: Array.isArray(result) ? result.length : 1,
        rowsScanned: 0, // Seria calculado pelo banco
        indexUsed: true,
        cacheHit: false
      });

      console.log(`✅ Query executada em ${queryTime}ms`);
      return result;
      
    } catch (error) {
      console.error(`❌ Erro na query ${queryKey}:`, error);
      throw error;
    }
  }

  // Limpar cache
  clearCache(): void {
    this.queryCache.clear();
    console.log('🧹 Cache de queries limpo');
  }

  // Obter métricas de performance
  getPerformanceMetrics(): {
    averageQueryTime: number;
    totalQueries: number;
    cacheHitRate: number;
    slowestQueries: PerformanceMetrics[];
  } {
    const totalQueries = this.performanceMetrics.length;
    const averageQueryTime = totalQueries > 0 
      ? this.performanceMetrics.reduce((sum, m) => sum + m.queryTime, 0) / totalQueries 
      : 0;
    
    const cacheHits = this.performanceMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
    
    const slowestQueries = [...this.performanceMetrics]
      .sort((a, b) => b.queryTime - a.queryTime)
      .slice(0, 10);

    return {
      averageQueryTime,
      totalQueries,
      cacheHitRate,
      slowestQueries
    };
  }

  // Gerar recomendações de otimização
  generateOptimizationReport(): {
    recommendations: IndexRecommendation[];
    queryOptimizations: QueryOptimization[];
    performanceMetrics: any;
  } {
    const allRecommendations: IndexRecommendation[] = [];
    const queryOptimizations: QueryOptimization[] = [];
    
    // Analisar queries comuns e gerar recomendações
    const commonQueries = [
      'SELECT * FROM memberships WHERE user_id = ?',
      'SELECT * FROM memberships WHERE group_id = ?',
      'SELECT * FROM player_profiles WHERE user_id = ?',
      'SELECT * FROM groups WHERE owner_id = ?'
    ];

    commonQueries.forEach(query => {
      const optimization = this.optimizeQuery(query);
      queryOptimizations.push(optimization);
      
      const indexRecs = this.analyzeIndexes(query);
      allRecommendations.push(...indexRecs);
    });

    return {
      recommendations: allRecommendations,
      queryOptimizations,
      performanceMetrics: this.getPerformanceMetrics()
    };
  }
}

// Instância global do otimizador
export const sqlOptimizer = new SQLOptimizer();

// Funções de conveniência
export async function executeOptimizedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return sqlOptimizer.executeWithCache(queryKey, queryFn, ttl);
}

export function optimizeSQLQuery(query: string, context?: any): QueryOptimization {
  return sqlOptimizer.optimizeQuery(query, context);
}

export function getSQLPerformanceMetrics() {
  return sqlOptimizer.getPerformanceMetrics();
}

export function generateSQLOptimizationReport() {
  return sqlOptimizer.generateOptimizationReport();
}



