import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Trash2, RefreshCw, Calendar } from 'lucide-react';

interface DemoAccount {
  id: string;
  email: string;
  balance: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export default function DemoAccounts() {
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('1000');
  const { toast } = useToast();

  useEffect(() => {
    fetchDemoAccounts();
  }, []);

  const fetchDemoAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('demo_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDemoAccounts(data || []);
    } catch (error) {
      console.error('Error fetching demo accounts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas demo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoAccount = async () => {
    if (!newAccountEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email para a conta demo",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { data, error } = await supabase
        .from('demo_accounts')
        .insert({
          email: newAccountEmail,
          balance: parseFloat(newAccountBalance),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Conta demo criada",
        description: `Conta demo criada para ${newAccountEmail}`,
      });

      setNewAccountEmail('');
      setNewAccountBalance('1000');
      await fetchDemoAccounts();
    } catch (error) {
      console.error('Error creating demo account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta demo",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteDemoAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('demo_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta removida",
        description: "Conta demo removida com sucesso",
      });

      await fetchDemoAccounts();
    } catch (error) {
      console.error('Error deleting demo account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a conta demo",
        variant: "destructive",
      });
    }
  };

  const extendAccount = async (id: string) => {
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);

      const { error } = await supabase
        .from('demo_accounts')
        .update({ expires_at: newExpiryDate.toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta estendida",
        description: "Prazo da conta demo estendido por mais 7 dias",
      });

      await fetchDemoAccounts();
    } catch (error) {
      console.error('Error extending demo account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível estender a conta demo",
        variant: "destructive",
      });
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-casino-gold">Contas Demo</h1>
          <Button
            onClick={fetchDemoAccounts}
            variant="outline"
            className="border-casino-gold/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Create Demo Account */}
        <Card className="p-6 bg-gradient-card border-casino-gold/20">
          <h2 className="text-lg font-semibold text-casino-gold mb-4">
            <UserPlus className="w-5 h-5 inline mr-2" />
            Criar Nova Conta Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-casino-gold mb-2 block">Email</Label>
              <Input
                type="email"
                value={newAccountEmail}
                onChange={(e) => setNewAccountEmail(e.target.value)}
                placeholder="demo@exemplo.com"
                className="bg-casino-surface border-casino-gold/20"
              />
            </div>
            
            <div>
              <Label className="text-casino-gold mb-2 block">Saldo Inicial (R$)</Label>
              <Input
                type="number"
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(e.target.value)}
                placeholder="1000"
                className="bg-casino-surface border-casino-gold/20"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={createDemoAccount}
                disabled={creating}
                className="w-full bg-casino-gold text-casino-bg hover:bg-casino-gold-muted"
              >
                {creating ? 'Criando...' : 'Criar Conta Demo'}
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">
              🔒 <strong>Sistema Seguro:</strong> Contas demo usam tokens de sessão seguros (sem senhas). 
              Cada conta expira automaticamente em 7 dias e sessões inativas expiram em 24 horas.
            </p>
          </div>
        </Card>

        {/* Demo Accounts List */}
        <Card className="bg-gradient-card border-casino-gold/20">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-casino-gold mb-4">
              Contas Demo Ativas ({demoAccounts.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Carregando contas demo...</div>
              </div>
            ) : demoAccounts.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <div className="text-muted-foreground">Nenhuma conta demo criada</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-casino-gold/20">
                      <th className="text-left py-3 text-casino-gold font-semibold">Email</th>
                      <th className="text-left py-3 text-casino-gold font-semibold">Saldo</th>
                      <th className="text-left py-3 text-casino-gold font-semibold">Status</th>
                      <th className="text-left py-3 text-casino-gold font-semibold">Criada em</th>
                      <th className="text-left py-3 text-casino-gold font-semibold">Expira em</th>
                      <th className="text-left py-3 text-casino-gold font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoAccounts.map((account) => (
                      <tr key={account.id} className="border-b border-casino-gold/10 hover:bg-casino-surface/20">
                        <td className="py-3 text-casino-gold">{account.email}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            R$ {Number(account.balance).toFixed(2)}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {isExpired(account.expires_at) ? (
                            <Badge variant="destructive">Expirada</Badge>
                          ) : (
                            <Badge className="bg-green-500">Ativa</Badge>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(account.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(account.expires_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => extendAccount(account.id)}
                              className="border-casino-gold/20"
                            >
                              <Calendar className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDemoAccount(account.id)}
                              className="border-red-500/20 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}