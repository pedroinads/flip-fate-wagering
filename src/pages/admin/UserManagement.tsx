import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Edit, Trash2, UserPlus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
  balance?: number;
  total_deposited?: number;
  total_withdrawn?: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get users from profiles with wallet information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get wallet data for each user
      const usersWithWallets = await Promise.all(
        profiles?.map(async (profile) => {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance, total_deposited, total_withdrawn')
            .eq('user_id', profile.user_id)
            .single();

          // Get user email from auth (we'll simulate this for now)
          return {
            id: profile.user_id,
            email: `user${profile.user_id.slice(0, 8)}@exemplo.com`, // Simulated email
            created_at: profile.created_at,
            full_name: profile.full_name,
            balance: wallet?.balance || 0,
            total_deposited: wallet?.total_deposited || 0,
            total_withdrawn: wallet?.total_withdrawn || 0,
          };
        }) || []
      );

      setUsers(usersWithWallets);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-casino-gold">Gerenciamento de Usuários</h1>
          <Button className="bg-casino-gold text-casino-bg hover:bg-casino-gold-muted">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-gradient-card border-casino-gold/20">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-casino-surface border-casino-gold/20"
              />
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="border-casino-gold/20"
            >
              Atualizar
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-gradient-card border-casino-gold/20">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-casino-gold/20">
                    <th className="text-left py-3 text-casino-gold font-semibold">Email</th>
                    <th className="text-left py-3 text-casino-gold font-semibold">Nome</th>
                    <th className="text-left py-3 text-casino-gold font-semibold">Saldo</th>
                    <th className="text-left py-3 text-casino-gold font-semibold">Total Depositado</th>
                    <th className="text-left py-3 text-casino-gold font-semibold">Total Sacado</th>
                    <th className="text-left py-3 text-casino-gold font-semibold">Cadastro</th>
                    <th className="text-left py-3 text-casino-gold font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-casino-gold/10 hover:bg-casino-surface/20">
                        <td className="py-3 text-casino-gold">{user.email}</td>
                        <td className="py-3 text-casino-gold">{user.full_name || '-'}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            R$ {Number(user.balance).toFixed(2)}
                          </Badge>
                        </td>
                        <td className="py-3 text-casino-gold">
                          R$ {Number(user.total_deposited).toFixed(2)}
                        </td>
                        <td className="py-3 text-casino-gold">
                          R$ {Number(user.total_withdrawn).toFixed(2)}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-casino-gold/20">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500/20 text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}