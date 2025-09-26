import React from 'react';
import { Download, FileText, Trophy, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PlayerStats {
  name: string;
  goals: number;
  assists: number;
}

interface MatchHistory {
  round: number;
  left: string;
  right: string;
  leftScore: number;
  rightScore: number;
  winner: string;
  ts: number;
  goals: any[];
}

interface PDFExporterProps {
  playerStats: PlayerStats[];
  matchHistory: MatchHistory[];
  currentDate: string;
  isOwner: boolean;
}

export const PDFExporter: React.FC<PDFExporterProps> = ({
  playerStats,
  matchHistory,
  currentDate,
  isOwner
}) => {
  const generatePDF = async () => {
    console.log('🔄 Iniciando geração de PDF...');
    
    try {
      // Importação dinâmica do jsPDF
      const { default: jsPDF } = await import('jspdf');
      console.log('✅ jsPDF importado com sucesso');
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MAESTROS FC - RELATÓRIO DE PARTIDA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const safeDate = currentDate || new Date().toLocaleDateString('pt-BR');
    doc.text(`Data: ${safeDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Estatísticas dos Jogadores
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTATÍSTICAS DOS JOGADORES', 20, yPosition);
    yPosition += 15;

    if (playerStats.length > 0) {
      // Cabeçalho da tabela
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Posição', 20, yPosition);
      doc.text('Jogador', 40, yPosition);
      doc.text('Gols', 120, yPosition);
      doc.text('Assistências', 140, yPosition);
      doc.text('Total', 170, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      // Dados dos jogadores
      doc.setFont('helvetica', 'normal');
      playerStats.forEach((player, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const safeName = player?.name || 'Jogador Desconhecido';
        const safeGoals = player?.goals || 0;
        const safeAssists = player?.assists || 0;
        const total = safeGoals + safeAssists;
        
        doc.text(`${index + 1}º`, 20, yPosition);
        doc.text(safeName, 40, yPosition);
        doc.text(safeGoals.toString(), 120, yPosition);
        doc.text(safeAssists.toString(), 140, yPosition);
        doc.text(total.toString(), 170, yPosition);
        yPosition += 8;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma estatística registrada', 20, yPosition);
      yPosition += 10;
    }

    yPosition += 10;

    // Histórico de Partidas
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTÓRICO DE PARTIDAS', 20, yPosition);
    yPosition += 15;

    if (matchHistory.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Rodada', 20, yPosition);
      doc.text('Partida', 40, yPosition);
      doc.text('Placar', 120, yPosition);
      doc.text('Vencedor', 140, yPosition);
      doc.text('Data/Hora', 170, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      matchHistory.forEach((match) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const safeTs = match?.ts || Date.now();
        const safeRound = match?.round || 0;
        const safeLeft = match?.left || 'Time A';
        const safeRight = match?.right || 'Time B';
        const safeLeftScore = match?.leftScore || 0;
        const safeRightScore = match?.rightScore || 0;
        const safeWinner = match?.winner || 'Empate';
        
        const matchDate = new Date(safeTs).toLocaleString('pt-BR');
        const score = `${safeLeftScore} x ${safeRightScore}`;
        const matchTeams = `${safeLeft} vs ${safeRight}`;
        
        doc.text(`#${safeRound}`, 20, yPosition);
        doc.text(matchTeams, 40, yPosition);
        doc.text(score, 120, yPosition);
        doc.text(safeWinner, 140, yPosition);
        doc.text(matchDate, 170, yPosition);
        yPosition += 8;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma partida registrada', 20, yPosition);
    }

    // Rodapé
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Relatório gerado automaticamente pelo sistema Maestros FC', pageWidth / 2, footerY, { align: 'center' });

    // Salvar o PDF
    const safeDate = currentDate || new Date().toLocaleDateString('pt-BR');
    const fileName = `maestros-fc-relatorio-${safeDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + (error as Error).message);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Card className="rounded-2xl border border-emerald-200 shadow-sm dark:border-emerald-800 mb-3">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Exportar Relatório</h3>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            PDF completo
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                {playerStats.length} jogadores
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-zinc-700 dark:text-zinc-300">
                {matchHistory.length} partidas
              </span>
            </div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 mb-2">
              <FileText className="w-3 h-3" />
              <span className="font-medium">O que será incluído:</span>
            </div>
            <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
              <li>• Ranking completo dos jogadores</li>
              <li>• Estatísticas de gols e assistências</li>
              <li>• Histórico de todas as partidas</li>
              <li>• Placar e vencedores por rodada</li>
            </ul>
          </div>
          
          <Button 
            onClick={generatePDF}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
