import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Bell } from 'lucide-react';

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Card className="bg-casino-surface/50 border-casino-gold/20 rounded-none border-l-0 border-r-0 border-t-0">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-semibold text-casino-gold">
            Bem-vindo ao Painel Administrativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua plataforma de jogos
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-casino-gold">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-casino-gold/20 hover:bg-casino-gold/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}