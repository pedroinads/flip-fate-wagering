import { NavLink } from 'react-router-dom';
import { Card } from '@/components/ui/card';
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

export function AdminSidebar() {
  return (
    <Card className="w-64 lg:w-64 min-h-screen bg-gradient-card border-brand-gold/20 rounded-none hidden lg:block">
      <div className="p-4 sm:p-6">
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
    </Card>
  );
}