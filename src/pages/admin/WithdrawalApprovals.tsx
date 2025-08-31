import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, DollarSign, User } from 'lucide-react';

interface PendingWithdrawal {
  id: string;
  user_id: string;
  amount: number;
  pix_key: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export default function WithdrawalApprovals() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingWithdrawals();
    
    // Set up real-time subscription for new withdrawal requests
    const channel = supabase
      .channel('withdrawal-approvals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: 'type=eq.withdrawal'
        },
        () => {
          fetchPendingWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingWithdrawals = async () => {
    setLoading(true);
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          amount,
          pix_key,
          created_at
        `)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get user details for each transaction
      const transactionsWithUsers = await Promise.all(
        (transactions || []).map(async (transaction) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', transaction.user_id)
            .single();

          return {
            ...transaction,
            user_email: `user${transaction.user_id.slice(0, 8)}@exemplo.com`, // Simulated
            user_name: profile?.full_name || 'Usuário'
          };
        })
      );

      setPendingWithdrawals(transactionsWithUsers);
    } catch (error) {
      console.error('Error fetching pending withdrawals:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os saques pendentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveWithdrawal = async (transactionId: string) => {
    setProcessingId(transactionId);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          approved_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Saque aprovado",
        description: "O saque foi aprovado e processado com sucesso",
      });

      await fetchPendingWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o saque",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const rejectWithdrawal = async (transactionId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Digite o motivo da rejeição",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(transactionId);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Return money to user's wallet
      const transaction = pendingWithdrawals.find(t => t.id === transactionId);
      if (transaction) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', transaction.user_id)
          .single();

        if (wallet) {
          await supabase
            .from('wallets')
            .update({
              balance: Number(wallet.balance) + Number(transaction.amount)
            })
            .eq('user_id', transaction.user_id);
        }
      }

      toast({
        title: "Saque rejeitado",
        description: "O saque foi rejeitado e o valor retornado ao usuário",
      });

      setRejectionReason('');
      setShowRejectionForm(null);
      await fetchPendingWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o saque",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-casino-gold" />
            <h1 className="text-2xl font-bold text-casino-gold">Aprovação de Saques</h1>
          </div>
          <Badge variant="outline" className="text-casino-gold border-casino-gold/30">
            {pendingWithdrawals.length} pendente(s)
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saques Pendentes</p>
                <p className="text-2xl font-bold text-casino-gold">{pendingWithdrawals.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-casino-gold">
                  R$ {pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Usuários Únicos</p>
                <p className="text-2xl font-bold text-casino-gold">
                  {new Set(pendingWithdrawals.map(w => w.user_id)).size}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Pending Withdrawals */}
        <Card className="bg-gradient-card border-casino-gold/20">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-casino-gold mb-4">
              Saques Aguardando Aprovação
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Carregando saques pendentes...</div>
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <div className="text-muted-foreground">Todos os saques foram processados!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="border border-casino-gold/20 rounded-lg p-4 bg-casino-surface/50">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                      {/* User Info */}
                      <div>
                        <div className="font-semibold text-casino-gold">{withdrawal.user_name}</div>
                        <div className="text-sm text-muted-foreground">{withdrawal.user_email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(withdrawal.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>

                      {/* Amount and PIX */}
                      <div>
                        <div className="text-lg font-bold text-green-500">
                          R$ {Number(withdrawal.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          PIX: {withdrawal.pix_key}
                        </div>
                      </div>

                      {/* Rejection Form */}
                      <div>
                        {showRejectionForm === withdrawal.id && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Motivo da rejeição..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="bg-casino-surface border-casino-gold/20 text-sm"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        {showRejectionForm === withdrawal.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => rejectWithdrawal(withdrawal.id)}
                              disabled={processingId === withdrawal.id}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Confirmar Rejeição
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowRejectionForm(null);
                                setRejectionReason('');
                              }}
                              className="border-casino-gold/20"
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveWithdrawal(withdrawal.id)}
                              disabled={processingId === withdrawal.id}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {processingId === withdrawal.id ? 'Processando...' : 'Aprovar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRejectionForm(withdrawal.id)}
                              className="border-red-500/20 text-red-500"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}