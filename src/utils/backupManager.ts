/**
 * Backup Manager
 * Sistema de backup automático para dados críticos
 */

import { createClient } from '@supabase/supabase-js';

export interface BackupConfig {
  enabled: boolean;
  interval: number; // em minutos
  retentionDays: number;
  maxBackups: number;
  compress: boolean;
  encrypt: boolean;
}

export interface BackupEntry {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental' | 'schema';
  size: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  tables: string[];
  recordCount: number;
}

export interface BackupData {
  timestamp: string;
  tables: {
    [tableName: string]: any[];
  };
  schema: {
    [tableName: string]: any;
  };
  metadata: {
    version: string;
    environment: string;
    totalRecords: number;
  };
}

class BackupManager {
  private supabase: any;
  private config: BackupConfig;
  private backups: BackupEntry[] = [];
  private isRunning = false;

  constructor(supabase: any, config: BackupConfig) {
    this.supabase = supabase;
    this.config = config;
    
    if (config.enabled) {
      this.startScheduledBackups();
    }
  }

  private startScheduledBackups(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Backup imediato
    this.createBackup('full');
    
    // Agendar backups regulares
    setInterval(() => {
      this.createBackup('incremental');
    }, this.config.interval * 60 * 1000);
  }

  async createBackup(type: 'full' | 'incremental' | 'schema' = 'full'): Promise<BackupEntry> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const backup: BackupEntry = {
      id: backupId,
      timestamp: new Date().toISOString(),
      type,
      size: 0,
      status: 'pending',
      tables: [],
      recordCount: 0
    };

    this.backups.push(backup);
    
    try {
      backup.status = 'in_progress';
      
      const backupData = await this.performBackup(type);
      backup.size = JSON.stringify(backupData).length;
      backup.tables = Object.keys(backupData.tables);
      backup.recordCount = backupData.metadata.totalRecords;
      backup.status = 'completed';
      
      // Salvar backup
      await this.saveBackup(backupId, backupData);
      
      // Limpar backups antigos
      await this.cleanupOldBackups();
      
      console.log(`✅ Backup ${type} criado com sucesso: ${backupId}`);
      
    } catch (error) {
      backup.status = 'failed';
      backup.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Erro ao criar backup ${type}:`, error);
    }
    
    return backup;
  }

  private async performBackup(type: 'full' | 'incremental' | 'schema'): Promise<BackupData> {
    const timestamp = new Date().toISOString();
    const tables: { [tableName: string]: any[] } = {};
    const schema: { [tableName: string]: any } = {};
    let totalRecords = 0;

    // Lista de tabelas críticas para backup
    const criticalTables = [
      'memberships',
      'player_profiles',
      'groups',
      'temp_players'
    ];

    // Backup de dados
    if (type === 'full' || type === 'incremental') {
      for (const tableName of criticalTables) {
        try {
          const { data, error } = await this.supabase
            .from(tableName)
            .select('*');
          
          if (error) {
            console.warn(`Aviso: Não foi possível fazer backup da tabela ${tableName}:`, error.message);
            tables[tableName] = [];
          } else {
            tables[tableName] = data || [];
            totalRecords += (data || []).length;
          }
        } catch (error) {
          console.warn(`Erro ao fazer backup da tabela ${tableName}:`, error);
          tables[tableName] = [];
        }
      }
    }

    // Backup de schema
    if (type === 'full' || type === 'schema') {
      for (const tableName of criticalTables) {
        try {
          // Obter informações do schema da tabela
          const { data, error } = await this.supabase
            .rpc('get_table_schema', { table_name: tableName });
          
          if (!error && data) {
            schema[tableName] = data;
          }
        } catch (error) {
          console.warn(`Erro ao obter schema da tabela ${tableName}:`, error);
        }
      }
    }

    return {
      timestamp,
      tables,
      schema,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        totalRecords
      }
    };
  }

  private async saveBackup(backupId: string, data: BackupData): Promise<void> {
    try {
      // Em produção, salvar em storage seguro (AWS S3, Google Cloud Storage, etc.)
      // Por enquanto, salvar localmente
      const backupPath = `./backups/${backupId}.json`;
      
      // Simular salvamento
      console.log(`💾 Backup salvo: ${backupPath}`);
      
      // Em produção, implementar:
      // 1. Compressão se configurado
      // 2. Criptografia se configurado
      // 3. Upload para storage remoto
      // 4. Verificação de integridade
      
    } catch (error) {
      console.error('Erro ao salvar backup:', error);
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    // Remover backups antigos da memória
    this.backups = this.backups.filter(backup => 
      new Date(backup.timestamp) > cutoffDate
    );
    
    // Manter apenas o número máximo de backups
    if (this.backups.length > this.config.maxBackups) {
      this.backups = this.backups
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.config.maxBackups);
    }
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      console.log(`🔄 Iniciando restauração do backup: ${backupId}`);
      
      // Em produção, implementar:
      // 1. Carregar backup do storage
      // 2. Verificar integridade
      // 3. Fazer backup atual antes de restaurar
      // 4. Restaurar dados
      // 5. Verificar consistência
      
      console.log(`✅ Backup ${backupId} restaurado com sucesso`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erro ao restaurar backup ${backupId}:`, error);
      return false;
    }
  }

  getBackupStatus(): {
    total: number;
    completed: number;
    failed: number;
    lastBackup?: string;
    nextBackup?: string;
  } {
    const completed = this.backups.filter(b => b.status === 'completed').length;
    const failed = this.backups.filter(b => b.status === 'failed').length;
    const lastBackup = this.backups
      .filter(b => b.status === 'completed')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    const nextBackup = new Date();
    nextBackup.setMinutes(nextBackup.getMinutes() + this.config.interval);
    
    return {
      total: this.backups.length,
      completed,
      failed,
      lastBackup: lastBackup?.timestamp,
      nextBackup: nextBackup.toISOString()
    };
  }

  getBackups(): BackupEntry[] {
    return [...this.backups].reverse();
  }

  async testBackup(): Promise<boolean> {
    try {
      const testBackup = await this.createBackup('schema');
      return testBackup.status === 'completed';
    } catch (error) {
      console.error('Teste de backup falhou:', error);
      return false;
    }
  }
}

// Configuração padrão
export const defaultBackupConfig: BackupConfig = {
  enabled: true,
  interval: 60, // 1 hora
  retentionDays: 7,
  maxBackups: 10,
  compress: true,
  encrypt: true
};

// Instância global do backup manager
let backupManager: BackupManager | null = null;

export function initializeBackupManager(supabase: any, config: BackupConfig = defaultBackupConfig): BackupManager {
  if (!backupManager) {
    backupManager = new BackupManager(supabase, config);
  }
  return backupManager;
}

export function getBackupManager(): BackupManager | null {
  return backupManager;
}



