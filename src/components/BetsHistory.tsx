import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Bet {
  id: string;
  amount: number;
  choice: 'cara' | 'coroa';
  result: 'cara' | 'coroa';
  won: boolean;
  payout: number;
  createdAt: string;
}

interface BetsStats {
  totalBets: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  netProfit: number;
}

interface BetsHistoryProps {
  userId: string;
}

export function BetsHistory({ userId }: BetsHistoryProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<BetsStats>({
    totalBets: 0,
    totalWon: 0,
    totalLost: 0,
    winRate: 0,
    netProfit: 0,
  });

  useEffect(() => {
    fetchBets();
  }, [userId]);

  const fetchBets = async () => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching bets:', error);
      return;
    }

    const formattedBets = data?.map(bet => ({
      id: bet.id,
      amount: Number(bet.amount),
      choice: bet.choice as 'cara' | 'coroa',
      result: bet.result as 'cara' | 'coroa',
      won: bet.won,
      payout: Number(bet.payout),
      createdAt: bet.created_at,
    })) || [];

    setBets(formattedBets);
    calculateStats(formattedBets);
  };

  const calculateStats = (bets: Bet[]) => {
    const totalBets = bets.length;
    const wonBets = bets.filter(bet => bet.won);
    const totalWon = wonBets.length;
    const totalLost = totalBets - totalWon;
    const winRate = totalBets > 0 ? (totalWon / totalBets) * 100 : 0;
    
    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalPayout = bets.reduce((sum, bet) => sum + bet.payout, 0);
    const netProfit = totalPayout - totalAmount;

    setStats({
      totalBets,
      totalWon,
      totalLost,
      winRate,
      netProfit,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-brand-gold/20 hover:bg-brand-gold/10 text-foreground">
          <History className="w-4 h-4 mr-2" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-gradient-card border-brand-gold/20">
        <DialogHeader>
          <DialogTitle className="text-brand-gold">Histórico de Apostas</DialogTitle>
        </DialogHeader>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-brand-surface border-brand-gold/20">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-brand-gold" />
              <div className="text-lg font-bold text-foreground">{stats.totalBets}</div>
              <div className="text-xs text-muted-foreground">Total de Apostas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-surface border-brand-gold/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-brand-green" />
              <div className="text-lg font-bold text-brand-green">{stats.totalWon}</div>
              <div className="text-xs text-muted-foreground">Vitórias</div>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-surface border-brand-gold/20">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-destructive" />
              <div className="text-lg font-bold text-destructive">{stats.totalLost}</div>
              <div className="text-xs text-muted-foreground">Derrotas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-surface border-brand-gold/20">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-brand-gold">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Taxa de Vitória</div>
            </CardContent>
          </Card>
        </div>

        {/* Net Profit */}
        <Card className="bg-brand-surface border-brand-gold/20">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${
              stats.netProfit >= 0 ? 'text-brand-green' : 'text-destructive'
            }`}>
              {stats.netProfit >= 0 ? '+' : ''} R$ {stats.netProfit.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Lucro Líquido</div>
          </CardContent>
        </Card>

        {/* Bets List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-brand-gold mb-2">Apostas Recentes</h3>
          {bets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma aposta encontrada. Faça sua primeira aposta!
            </p>
          ) : (
            bets.map((bet) => (
              <Card key={bet.id} className="p-3 bg-brand-surface border-brand-gold/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={`${
                        bet.won ? 'bg-brand-green' : 'bg-destructive'
                      } text-white`}
                    >
                      {bet.won ? 'GANHOU' : 'PERDEU'}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Apostou <span className="text-brand-gold">R$ {bet.amount.toFixed(2)}</span> em{' '}
                        <span className="uppercase font-bold">{bet.choice}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Resultado: <span className="uppercase">{bet.result}</span> •{' '}
                        {new Date(bet.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      bet.won ? 'text-brand-green' : 'text-destructive'
                    }`}>
                      {bet.won ? '+' : '-'} R$ {bet.won ? bet.payout.toFixed(2) : bet.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}