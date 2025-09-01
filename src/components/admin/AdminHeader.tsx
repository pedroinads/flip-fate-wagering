import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Bell, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  UserPlus,
  CheckCircle,
  Gamepad2,
  Palette,
  Webhook,
  PiggyBank
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Usuários', href: '/admin/users' },
  { icon: CreditCard, label: 'Transações', href: '/admin/transactions' },
  { icon: CheckCircle, label: 'Aprovações', href: '/admin/approvals' },
  { icon: TrendingUp, label: 'Relatórios', href: '/admin/reports' },
  { icon: Gamepad2, label: 'Jogos ao Vivo', href: '/admin/live-games' },
  { icon: UserPlus, label: 'Contas Demo', href: '/admin/demo-accounts' },
  { icon: PiggyBank, label: 'Controle de Ganhos', href: '/admin/game-control' },
  { icon: Palette, label: 'Personalização', href: '/admin/customization' },
  { icon: Webhook, label: 'Integrações', href: '/admin/integrations' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings' },
];

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Card className="bg-brand-surface/50 border-brand-gold/20 rounded-none border-l-0 border-r-0 border-t-0">
      <div className="flex items-center justify-between p-4 gap-4">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-gradient-card border-brand-gold/20">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
                    <span className="text-brand-bg font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-gold">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground">Painel de Controle</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-brand-gold text-brand-bg'
                            : 'text-muted-foreground hover:text-brand-gold hover:bg-brand-surface/50'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1">
          <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-brand-gold">
            Painel Administrativo
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Gerencie sua plataforma de jogos
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-brand-gold">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-brand-gold/20 hover:bg-brand-gold/10 text-foreground"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}