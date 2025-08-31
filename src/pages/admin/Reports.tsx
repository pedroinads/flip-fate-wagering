import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportData {
  totalBets: number;
  totalRevenue: number;
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  profitMargin: number;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: { full_name: string };
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    totalBets: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    profitMargin: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateFrom, setDateFrom] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    generateReport();
  }, [dateFrom, dateTo, reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Buscar dados de apostas
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('amount, won, created_at')
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);

      if (betsError) throw betsError;

      // Buscar dados de transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          type,
          amount,
          status,
          created_at
        `)
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Buscar nomes dos usuários
      const userIds = [...new Set(transactionsData?.map(t => t.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Mapear nomes aos usuários
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]) || []);
      const transactionsWithProfiles = transactionsData?.map(t => ({
        ...t,
        profiles: { full_name: profilesMap.get(t.user_id) || 'N/A' }
      })) || [];

      // Buscar total de usuários
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);

      if (userError) throw userError;

      // Calcular métricas
      const totalBets = bets?.length || 0;
      const totalBetAmount = bets?.reduce((sum, bet) => sum + Number(bet.amount), 0) || 0;
      const totalWins = bets?.filter(bet => bet.won).length || 0;
      const totalWinAmount = bets?.filter(bet => bet.won).reduce((sum, bet) => sum + Number(bet.amount), 0) || 0;
      
      const deposits = transactionsWithProfiles.filter(t => t.type === 'deposit' && t.status === 'completed');
      const withdrawals = transactionsWithProfiles.filter(t => t.type === 'withdrawal' && t.status === 'completed');
      
      const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalRevenue = totalBetAmount - totalWinAmount;
      const profitMargin = totalBetAmount > 0 ? (totalRevenue / totalBetAmount) * 100 : 0;

      setReportData({
        totalBets,
        totalRevenue,
        totalUsers: userCount || 0,
        totalDeposits,
        totalWithdrawals,
        profitMargin
      });

      setTransactions(transactionsWithProfiles);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Usuário', 'Valor', 'Status'],
      ...transactions.map(t => [
        format(new Date(t.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        t.type === 'deposit' ? 'Depósito' : 'Saque',
        t.profiles?.full_name || 'N/A',
        `R$ ${Number(t.amount).toFixed(2)}`,
        t.status === 'completed' ? 'Completo' : t.status === 'pending' ? 'Pendente' : 'Rejeitado'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${dateFrom}_${dateTo}.csv`;
    a.click();
  };

  const statsCards = [
    {
      title: "Total de Apostas",
      value: reportData.totalBets.toLocaleString(),
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      title: "Receita Total",
      value: `R$ ${reportData.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Novos Usuários",
      value: reportData.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "Margem de Lucro",
      value: `${reportData.profitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: reportData.profitMargin > 0 ? "text-green-500" : "text-red-500"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-casino-gold">Relatórios</h1>
          <Button onClick={exportReport} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtros do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="dateFrom">Data Início</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Data Fim</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral</SelectItem>
                    <SelectItem value="transactions">Transações</SelectItem>
                    <SelectItem value="bets">Apostas</SelectItem>
                    <SelectItem value="users">Usuários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={generateReport} disabled={loading} className="w-full">
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <TrendingUp className="w-5 h-5" />
                Depósitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                R$ {reportData.totalDeposits.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total de depósitos no período</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <TrendingDown className="w-5 h-5" />
                Saques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">
                R$ {reportData.totalWithdrawals.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total de saques no período</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Lista de todas as transações no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{transaction.profiles?.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                          {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {Number(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {transaction.status === 'completed' ? 'Completo' : 
                           transaction.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}