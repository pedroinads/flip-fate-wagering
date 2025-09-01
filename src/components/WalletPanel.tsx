import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WalletData {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  pixKey?: string;
}

interface WalletPanelProps {
  userId: string;
  onBalanceUpdate: (balance: number) => void;
  openDeposit?: boolean;
  onDepositClose?: () => void;
}

const depositAmounts = [10, 30, 50, 100, 300, 500];

export function WalletPanel({ userId, onBalanceUpdate, openDeposit = false, onDepositClose }: WalletPanelProps) {
  const [open, setOpen] = useState(openDeposit);
  const [walletData, setWalletData] = useState<WalletData>({ balance: 0, totalDeposited: 0, totalWithdrawn: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, [userId]);

  useEffect(() => {
    if (openDeposit) {
      setOpen(true);
    }
  }, [openDeposit]);

  const handleClose = () => {
    setOpen(false);
    if (onDepositClose) {
      onDepositClose();
    }
  };

  const fetchWalletData = async () => {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance, total_deposited, total_withdrawn')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return;
    }

    if (data) {
      const wallet = {
        balance: Number(data.balance),
        totalDeposited: Number(data.total_deposited),
        totalWithdrawn: Number(data.total_withdrawn),
      };
      setWalletData(wallet);
      onBalanceUpdate(wallet.balance);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions(data?.map(t => ({
      id: t.id,
      type: t.type as 'deposit' | 'withdrawal',
      amount: Number(t.amount),
      status: t.status as 'pending' | 'completed' | 'cancelled',
      createdAt: t.created_at,
      pixKey: t.pix_key,
    })) || []);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (amount < 10) {
      toast({
        title: "Valor inválido",
        description: "O valor mínimo para depósito é R$ 10,00.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simular processamento PIX (no MVP)
      const { error } = await supabase.functions.invoke('process-deposit', {
        body: { amount, userId }
      });

      if (error) throw error;

      toast({
        title: "Depósito solicitado!",
        description: "Seu depósito está sendo processado. Aguarde alguns minutos.",
      });

      setDepositAmount('');
      fetchWalletData();
      fetchTransactions();
    } catch (error) {
      toast({
        title: "Erro no depósito",
        description: "Erro ao processar depósito. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para saque",
        variant: "destructive",
      });
      return;
    }

    if (amount < 20) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para saque é R$ 20,00",
        variant: "destructive",
      });
      return;
    }

    if (amount > walletData.balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para este saque",
        variant: "destructive",
      });
      return;
    }

    if (!pixKey) {
      toast({
        title: "Chave PIX obrigatória",
        description: "Digite sua chave PIX para saque",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('process-withdrawal', {
        body: { amount, userId, pixKey }
      });

      if (error) throw error;

      toast({
        title: "Saque solicitado!",
        description: "Seu saque está sendo processado. Aguarde até 24 horas.",
      });

      setWithdrawAmount('');
      setPixKey('');
      fetchWalletData();
      fetchTransactions();
    } catch (error) {
      toast({
        title: "Erro no saque",
        description: "Erro ao processar saque. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen && onDepositClose) {
        onDepositClose();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-brand-gold/20 hover:bg-brand-gold/10 text-foreground">
          <Wallet className="w-4 h-4 mr-2" />
          Carteira
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-card border-brand-gold/20">
        <DialogHeader>
          <DialogTitle className="text-brand-gold">Carteira Digital</DialogTitle>
        </DialogHeader>
        
        {/* Balance Display */}
        <Card className="bg-brand-surface border-brand-gold/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-gold">
                R$ {walletData.balance.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Saldo disponível</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center text-brand-green">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  R$ {walletData.totalDeposited.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total depositado</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-destructive">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  R$ {walletData.totalWithdrawn.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total sacado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-brand-surface">
            <TabsTrigger 
              value="deposit" 
              className="text-foreground data-[state=active]:bg-brand-gold data-[state=active]:text-brand-bg"
            >
              <Plus className="w-4 h-4 mr-1" />
              Depósito
            </TabsTrigger>
            <TabsTrigger 
              value="withdraw" 
              className="text-foreground data-[state=active]:bg-brand-gold data-[state=active]:text-brand-bg"
            >
              <Minus className="w-4 h-4 mr-1" />
              Saque
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-foreground data-[state=active]:bg-brand-gold data-[state=active]:text-brand-bg"
            >
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-brand-gold font-semibold">Valores Recomendados</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {depositAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setDepositAmount(amount.toString())}
                      className={`text-sm relative border-brand-gold/30 hover:border-brand-gold hover:bg-brand-gold/10 text-foreground ${
                        amount === 30 ? "border-2 border-brand-gold bg-brand-gold/20" : ""
                      }`}
                    >
                      R$ {amount}
                      {amount === 30 && (
                        <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-bg text-xs px-1.5 py-0.5 rounded-full font-bold">
                          POPULAR
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deposit-amount" className="text-foreground">Ou digite um valor</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="10"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Mín. R$ 10,00"
                  className="bg-brand-surface border-brand-gold/20 text-foreground"
                />
              </div>
            </div>
            <Button 
              onClick={handleDeposit}
              disabled={loading}
              className="w-full bg-brand-gold text-brand-bg hover:bg-brand-gold-muted"
            >
              {loading ? 'Processando...' : 'Depositar Instantâneo'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              * Depósitos são creditados instantaneamente no sistema
            </p>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="text-foreground">Valor do Saque (mín. R$ 20,00)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                min="20"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="R$ 0,00"
                className="bg-brand-surface border-brand-gold/20 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix-key" className="text-foreground">Chave PIX</Label>
              <Input
                id="pix-key"
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Digite sua chave PIX"
                className="bg-brand-surface border-brand-gold/20 text-foreground"
              />
            </div>
            <Button 
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-brand-gold text-brand-bg hover:bg-brand-gold-muted"
            >
              {loading ? 'Processando...' : 'Solicitar Saque'}
            </Button>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma transação encontrada
                </p>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-3 bg-brand-surface border-brand-gold/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {transaction.type === 'deposit' ? (
                          <Plus className="w-4 h-4 text-brand-green" />
                        ) : (
                          <Minus className="w-4 h-4 text-destructive" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-brand-green' : 'text-destructive'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </div>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status === 'completed' ? 'Concluído' : 
                           transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}