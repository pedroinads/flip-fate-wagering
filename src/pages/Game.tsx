import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { CoinFlip } from '@/components/CoinFlip';
import { WalletPanel } from '@/components/WalletPanel';
import { BetsHistory } from '@/components/BetsHistory';
import { WithdrawNotifications } from '@/components/WithdrawNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Game() {
  const { user, signOut } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return;
    }

    if (data) {
      setBalance(Number(data.balance));
    }
  };

  const handleBet = async (choice: 'cara' | 'coroa', amount: number, level: number) => {
    if (!user) return { won: false, result: 'cara' as const, payout: 0 };

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('place-bet', {
        body: { choice, amount, level }
      });

      if (error) throw error;

      setBalance(data.newBalance);
      
      return {
        won: data.won,
        result: data.result,
        payout: data.payout,
      };
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return null; // This will be handled by the auth redirect in App.tsx
  }

  return (
    <div className="min-h-screen bg-gradient-casino">
      <WithdrawNotifications />
      {/* Header */}
      <header className="border-b border-casino-gold/20 bg-casino-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-casino-gold">🪙 Cara ou Coroa</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Bem-vindo, {user.email?.split('@')[0]}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Card className="px-2 sm:px-4 py-2 bg-casino-surface border-casino-gold/20">
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-casino-gold">
                    R$ {balance.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Saldo</div>
                </div>
              </Card>
              
              <div className="hidden sm:flex space-x-2">
                <WalletPanel userId={user.id} onBalanceUpdate={setBalance} />
                <BetsHistory userId={user.id} />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-casino-gold/20 hover:bg-casino-gold/10"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex justify-center space-x-4 py-2 sm:hidden border-t border-casino-gold/20">
            <WalletPanel userId={user.id} onBalanceUpdate={setBalance} />
            <BetsHistory userId={user.id} />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Game Section */}
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-8 bg-gradient-card border-casino-gold/20 shadow-casino">
              <CoinFlip 
                onBet={handleBet}
                balance={balance}
                disabled={loading}
              />
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Game Info */}
            <Card className="p-6 bg-gradient-card border-casino-gold/20">
              <h3 className="text-lg font-semibold text-casino-gold mb-4">
                Como Jogar
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-casino-gold mt-2 flex-shrink-0" />
                  <p>Escolha entre <strong>Cara</strong> ou <strong>Coroa</strong></p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-casino-gold mt-2 flex-shrink-0" />
                  <p>Selecione o valor da aposta (R$1 a R$10)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-casino-gold mt-2 flex-shrink-0" />
                  <p>Se acertar, ganhe <strong>1.9x</strong> o valor apostado</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-casino-gold mt-2 flex-shrink-0" />
                  <p>O resultado é 100% aleatório e justo</p>
                </div>
              </div>
            </Card>

            {/* Responsible Gaming */}
            <Card className="p-4 bg-casino-surface border-casino-gold/20">
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-semibold text-casino-gold mb-2">🎰 Jogue com Responsabilidade</p>
                <p>Defina limites para suas apostas e nunca aposte mais do que pode perder.</p>
              </div>
            </Card>

            {/* Game Statistics */}
            <Card className="p-4 bg-casino-surface border-casino-gold/20">
              <h4 className="text-sm font-semibold text-casino-gold mb-2">Estatísticas do Jogo</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Chance de vitória:</span>
                  <span className="font-semibold">50%</span>
                </div>
                <div className="flex justify-between">
                  <span>Payout:</span>
                  <span className="font-semibold">1.9x</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa da casa:</span>
                  <span className="font-semibold">5%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}