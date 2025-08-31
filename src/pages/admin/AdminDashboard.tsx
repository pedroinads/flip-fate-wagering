import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Calendar,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  todayRevenue: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBets: 0,
    todayRevenue: 0,
    activeUsers: 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get transactions data
      const { data: deposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');

      const { data: withdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed');

      // Get bets data
      const { count: betsCount } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true });

      // Get today's revenue (deposits - withdrawals)
      const startOfDay = new Date(selectedDate + 'T00:00:00Z').toISOString();
      const endOfDay = new Date(selectedDate + 'T23:59:59Z').toISOString();

      const { data: todayDeposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      const { data: todayWithdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      // Calculate totals
      const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const todayDepositsTotal = todayDeposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const todayWithdrawalsTotal = todayWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalDeposits,
        totalWithdrawals,
        totalBets: betsCount || 0,
        todayRevenue: todayDepositsTotal - todayWithdrawalsTotal,
        activeUsers: Math.floor((usersCount || 0) * 0.3), // Simulated active users
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Depositado',
      value: `R$ ${stats.totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: ArrowUpIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Sacado',
      value: `R$ ${stats.totalWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: ArrowDownIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Faturamento do Dia',
      value: `R$ ${stats.todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-casino-gold',
      bgColor: 'bg-casino-gold/10',
    },
    {
      title: 'Total de Apostas',
      value: stats.totalBets,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Usuários Ativos',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Date Filter */}
        <Card className="p-4 bg-gradient-card border-casino-gold/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-casino-gold">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto bg-casino-surface border-casino-gold/20"
              />
              <Button
                onClick={fetchDashboardData}
                size="sm"
                className="bg-casino-gold text-casino-bg hover:bg-casino-gold-muted"
              >
                Atualizar
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="p-6 bg-gradient-card border-casino-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-casino-gold">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h3 className="text-lg font-semibold text-casino-gold mb-4">
              Atividade Recente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-casino-gold">Novo usuário cadastrado</p>
                  <p className="text-xs text-muted-foreground">Há 5 minutos</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-casino-gold">Depósito realizado</p>
                  <p className="text-xs text-muted-foreground">Há 12 minutos</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-casino-gold">Saque aprovado</p>
                  <p className="text-xs text-muted-foreground">Há 25 minutos</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h3 className="text-lg font-semibold text-casino-gold mb-4">
              Resumo do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                <span className="text-sm font-medium text-casino-gold">23.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Margem de Lucro</span>
                <span className="text-sm font-medium text-green-500">
                  {((stats.todayRevenue / Math.max(stats.totalDeposits, 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Aprovações Pendentes</span>
                <span className="text-sm font-medium text-orange-500">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status do Sistema</span>
                <span className="text-sm font-medium text-green-500">Online</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}