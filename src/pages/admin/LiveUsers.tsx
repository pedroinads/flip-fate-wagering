import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, Activity, TrendingUp, Gamepad2 } from 'lucide-react';

interface LiveUser {
  id: string;
  email: string;
  full_name?: string;
  balance: number;
  status: 'online' | 'playing' | 'idle';
  last_activity: string;
  current_bet?: number;
  total_bets_today: number;
}

interface LiveBet {
  id: string;
  user_email: string;
  user_name?: string;
  amount: number;
  choice: 'cara' | 'coroa';
  level: number;
  won: boolean;
  payout: number;
  created_at: string;
}

export default function LiveUsers() {
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [stats, setStats] = useState({
    onlineUsers: 0,
    activePlayers: 0,
    totalBetsToday: 0,
    revenueToday: 0,
  });

  useEffect(() => {
    fetchLiveData();
    
    // Set up real-time subscriptions
    const betsChannel = supabase
      .channel('live-bets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bets'
        },
        () => {
          fetchLiveData();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);

    return () => {
      supabase.removeChannel(betsChannel);
      clearInterval(interval);
    };
  }, []);

  const fetchLiveData = async () => {
    try {
      await Promise.all([
        fetchLiveUsers(),
        fetchLiveBets(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const fetchLiveUsers = async () => {
    try {
      // Get recent profiles (simulating online users)
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!profiles) return;

      // Get wallet info for each user
      const usersWithWallets = await Promise.all(
        profiles.map(async (profile) => {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', profile.user_id)
            .single();

          // Get today's bets count
          const today = new Date().toISOString().split('T')[0];
          const { count: betsCount } = await supabase
            .from('bets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id)
            .gte('created_at', `${today}T00:00:00Z`);

          return {
            id: profile.user_id,
            email: `user${profile.user_id.slice(0, 8)}@exemplo.com`,
            full_name: profile.full_name,
            balance: Number(wallet?.balance || 0),
            status: Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'playing' : 'idle',
            last_activity: new Date(Date.now() - Math.random() * 300000).toISOString(),
            total_bets_today: betsCount || 0,
          } as LiveUser;
        })
      );

      setLiveUsers(usersWithWallets);
    } catch (error) {
      console.error('Error fetching live users:', error);
    }
  };

  const fetchLiveBets = async () => {
    try {
      // Get recent bets
      const { data: bets } = await supabase
        .from('bets')
        .select(`
          id,
          user_id,
          amount,
          choice,
          level,
          won,
          payout,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!bets) return;

      // Get user details for each bet
      const betsWithUsers = await Promise.all(
        bets.map(async (bet) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', bet.user_id)
            .single();

          return {
            ...bet,
            choice: bet.choice as 'cara' | 'coroa',
            user_email: `user${bet.user_id.slice(0, 8)}@exemplo.com`,
            user_name: profile?.full_name || 'Usuário'
          };
        })
      );

      setLiveBets(betsWithUsers);
    } catch (error) {
      console.error('Error fetching live bets:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Count today's bets
      const { count: betsCount } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00Z`);

      // Calculate today's revenue
      const { data: todayBets } = await supabase
        .from('bets')
        .select('amount, payout')
        .gte('created_at', `${today}T00:00:00Z`);

      const revenueToday = todayBets?.reduce((sum, bet) => {
        return sum + Number(bet.amount) - Number(bet.payout);
      }, 0) || 0;

      setStats({
        onlineUsers: liveUsers.filter(u => u.status === 'online').length,
        activePlayers: liveUsers.filter(u => u.status === 'playing').length,
        totalBetsToday: betsCount || 0,
        revenueToday,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'playing': return 'bg-blue-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'playing': return 'Jogando';
      case 'idle': return 'Ausente';
      default: return 'Offline';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-casino-gold" />
          <h1 className="text-2xl font-bold text-casino-gold">Usuários em Tempo Real</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Usuários Online</p>
                <p className="text-2xl font-bold text-green-500">{stats.onlineUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Jogadores Ativos</p>
                <p className="text-2xl font-bold text-blue-500">{stats.activePlayers}</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Apostas Hoje</p>
                <p className="text-2xl font-bold text-casino-gold">{stats.totalBetsToday}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-casino-gold" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lucro Hoje</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {stats.revenueToday.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Users */}
          <Card className="bg-gradient-card border-casino-gold/20">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-casino-gold mb-4">
                Usuários Ativos ({liveUsers.length})
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status)}`}></div>
                      <div>
                        <div className="font-medium text-casino-gold text-sm">
                          {user.full_name || user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          R$ {user.balance.toFixed(2)} • {user.total_bets_today} apostas
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)} text-white border-0`}>
                      {getStatusText(user.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Live Bets */}
          <Card className="bg-gradient-card border-casino-gold/20">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-casino-gold mb-4">
                Apostas ao Vivo
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveBets.slice(0, 20).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-casino-gold text-sm">
                          {bet.user_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Nível {bet.level}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        R$ {Number(bet.amount).toFixed(2)} em {bet.choice.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={bet.won ? 'bg-green-500' : 'bg-red-500'}>
                        {bet.won ? `+R$ ${Number(bet.payout).toFixed(2)}` : 'Perdeu'}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(bet.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}