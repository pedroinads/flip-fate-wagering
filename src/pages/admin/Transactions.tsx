import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  pix_key?: string;
  external_id?: string;
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  profiles?: { full_name: string };
}

interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  completedToday: number;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingTransactions: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          type,
          amount,
          status,
          pix_key,
          external_id,
          rejection_reason,
          created_at,
          approved_at,
          approved_by
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar nomes dos usuários
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Mapear nomes aos usuários
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]) || []);
      const transactionsWithProfiles = data?.map(t => ({
        ...t,
        profiles: { full_name: profilesMap.get(t.user_id) || 'N/A' }
      })) || [];

      setTransactions(transactionsWithProfiles);
      calculateStats(transactionsWithProfiles);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionsData: Transaction[]) => {
    const today = new Date().toDateString();
    
    const totalDeposits = transactionsData
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalWithdrawals = transactionsData
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const pendingTransactions = transactionsData.filter(t => t.status === 'pending').length;
    
    const completedToday = transactionsData.filter(t => 
      t.status === 'completed' && 
      new Date(t.created_at).toDateString() === today
    ).length;

    setStats({
      totalDeposits,
      totalWithdrawals,
      pendingTransactions,
      completedToday
    });
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.external_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.pix_key?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: string, rejectionReason?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        approved_at: newStatus === 'completed' ? new Date().toISOString() : null,
      };

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Transação ${newStatus === 'completed' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });

      fetchTransactions();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'deposit' ? 
      <Badge className="bg-blue-500 text-white">Depósito</Badge> :
      <Badge className="bg-purple-500 text-white">Saque</Badge>;
  };

  const statsCards = [
    {
      title: "Total Depósitos",
      value: `R$ ${stats.totalDeposits.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Total Saques",
      value: `R$ ${stats.totalWithdrawals.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Pendentes",
      value: stats.pendingTransactions.toString(),
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Completas Hoje",
      value: stats.completedToday.toString(),
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-casino-gold">Carregando transações...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-casino-gold">Gerenciamento de Transações</h1>

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
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome, PIX ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Completo</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="deposit">Depósito</SelectItem>
                    <SelectItem value="withdrawal">Saque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }} variant="outline" className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações ({filteredTransactions.length})</CardTitle>
            <CardDescription>Lista de todas as transações do sistema</CardDescription>
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
                    <TableHead>PIX/ID</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.profiles?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(transaction.type)}
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {Number(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.pix_key || transaction.external_id || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalhes da Transação</DialogTitle>
                                <DialogDescription>
                                  Informações completas da transação
                                </DialogDescription>
                              </DialogHeader>
                              {selectedTransaction && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>ID da Transação</Label>
                                      <p className="text-sm font-mono">{selectedTransaction.id}</p>
                                    </div>
                                    <div>
                                      <Label>Usuário</Label>
                                      <p className="text-sm">{selectedTransaction.profiles?.full_name}</p>
                                    </div>
                                    <div>
                                      <Label>Tipo</Label>
                                      <p className="text-sm">{selectedTransaction.type === 'deposit' ? 'Depósito' : 'Saque'}</p>
                                    </div>
                                    <div>
                                      <Label>Valor</Label>
                                      <p className="text-sm font-bold">R$ {Number(selectedTransaction.amount).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                    </div>
                                    <div>
                                      <Label>Data de Criação</Label>
                                      <p className="text-sm">
                                        {format(new Date(selectedTransaction.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                      </p>
                                    </div>
                                    {selectedTransaction.pix_key && (
                                      <div>
                                        <Label>Chave PIX</Label>
                                        <p className="text-sm font-mono">{selectedTransaction.pix_key}</p>
                                      </div>
                                    )}
                                    {selectedTransaction.external_id && (
                                      <div>
                                        <Label>ID Externo</Label>
                                        <p className="text-sm font-mono">{selectedTransaction.external_id}</p>
                                      </div>
                                    )}
                                    {selectedTransaction.rejection_reason && (
                                      <div className="col-span-2">
                                        <Label>Motivo da Rejeição</Label>
                                        <p className="text-sm text-red-500">{selectedTransaction.rejection_reason}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {selectedTransaction.status === 'pending' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button
                                        onClick={() => updateTransactionStatus(selectedTransaction.id, 'completed')}
                                        className="gap-2"
                                        size="sm"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Aprovar
                                      </Button>
                                      <Button
                                        onClick={() => updateTransactionStatus(selectedTransaction.id, 'rejected', 'Rejeitado pelo administrador')}
                                        variant="destructive"
                                        className="gap-2"
                                        size="sm"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Rejeitar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {transaction.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                                size="sm"
                                className="gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => updateTransactionStatus(transaction.id, 'rejected', 'Rejeitado pelo administrador')}
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
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