import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  AlertTriangle, 
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Server,
  Users,
  DollarSign
} from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  minDepositAmount: number;
  maxWithdrawAmount: number;
  withdrawalFee: number;
  supportEmail: string;
  supportPhone: string;
  termsOfService: string;
  privacyPolicy: string;
}

interface SecuritySettings {
  maxLoginAttempts: number;
  sessionTimeout: number;
  twoFactorRequired: boolean;
  ipWhitelist: string;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  depositNotifications: boolean;
  withdrawalNotifications: boolean;
  newUserNotifications: boolean;
}

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'Casino Platform',
    siteDescription: 'Plataforma de jogos online',
    maintenanceMode: false,
    registrationEnabled: true,
    minDepositAmount: 10,
    maxWithdrawAmount: 5000,
    withdrawalFee: 2.5,
    supportEmail: 'suporte@casino.com',
    supportPhone: '+55 11 99999-9999',
    termsOfService: '',
    privacyPolicy: ''
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    twoFactorRequired: false,
    ipWhitelist: '',
    passwordMinLength: 8,
    passwordRequireSpecial: true
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    depositNotifications: true,
    withdrawalNotifications: true,
    newUserNotifications: true
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    databaseSize: '0 MB',
    uptime: '0 dias'
  });

  useEffect(() => {
    loadSettings();
    loadSystemStats();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value');

      if (settings) {
        settings.forEach(setting => {
          const value = setting.value;
          
          // System settings
          if (setting.key === 'site_name') setSystemSettings(prev => ({ ...prev, siteName: String(value) }));
          if (setting.key === 'site_description') setSystemSettings(prev => ({ ...prev, siteDescription: String(value) }));
          if (setting.key === 'maintenance_mode') setSystemSettings(prev => ({ ...prev, maintenanceMode: Boolean(value) }));
          if (setting.key === 'registration_enabled') setSystemSettings(prev => ({ ...prev, registrationEnabled: Boolean(value) }));
          if (setting.key === 'min_deposit_amount') setSystemSettings(prev => ({ ...prev, minDepositAmount: Number(value) }));
          if (setting.key === 'max_withdraw_amount') setSystemSettings(prev => ({ ...prev, maxWithdrawAmount: Number(value) }));
          if (setting.key === 'withdrawal_fee') setSystemSettings(prev => ({ ...prev, withdrawalFee: Number(value) }));
          if (setting.key === 'support_email') setSystemSettings(prev => ({ ...prev, supportEmail: String(value) }));
          if (setting.key === 'support_phone') setSystemSettings(prev => ({ ...prev, supportPhone: String(value) }));
          
          // Security settings
          if (setting.key === 'max_login_attempts') setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: Number(value) }));
          if (setting.key === 'session_timeout') setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(value) }));
          if (setting.key === 'two_factor_required') setSecuritySettings(prev => ({ ...prev, twoFactorRequired: Boolean(value) }));
          if (setting.key === 'ip_whitelist') setSecuritySettings(prev => ({ ...prev, ipWhitelist: String(value) }));
          if (setting.key === 'password_min_length') setSecuritySettings(prev => ({ ...prev, passwordMinLength: Number(value) }));
          if (setting.key === 'password_require_special') setSecuritySettings(prev => ({ ...prev, passwordRequireSpecial: Boolean(value) }));
          
          // Notification settings
          if (setting.key === 'email_notifications') setNotificationSettings(prev => ({ ...prev, emailNotifications: Boolean(value) }));
          if (setting.key === 'sms_notifications') setNotificationSettings(prev => ({ ...prev, smsNotifications: Boolean(value) }));
          if (setting.key === 'push_notifications') setNotificationSettings(prev => ({ ...prev, pushNotifications: Boolean(value) }));
          if (setting.key === 'deposit_notifications') setNotificationSettings(prev => ({ ...prev, depositNotifications: Boolean(value) }));
          if (setting.key === 'withdrawal_notifications') setNotificationSettings(prev => ({ ...prev, withdrawalNotifications: Boolean(value) }));
          if (setting.key === 'new_user_notifications') setNotificationSettings(prev => ({ ...prev, newUserNotifications: Boolean(value) }));
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: betCount } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: userCount || 0,
        totalBets: betCount || 0,
        databaseSize: '12.5 MB',
        uptime: '15 dias'
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          key, 
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  };

  const saveAllSettings = async () => {
    setSaving(true);
    try {
      // Save system settings
      await Promise.all([
        saveSetting('site_name', systemSettings.siteName),
        saveSetting('site_description', systemSettings.siteDescription),
        saveSetting('maintenance_mode', systemSettings.maintenanceMode),
        saveSetting('registration_enabled', systemSettings.registrationEnabled),
        saveSetting('min_deposit_amount', systemSettings.minDepositAmount),
        saveSetting('max_withdraw_amount', systemSettings.maxWithdrawAmount),
        saveSetting('withdrawal_fee', systemSettings.withdrawalFee),
        saveSetting('support_email', systemSettings.supportEmail),
        saveSetting('support_phone', systemSettings.supportPhone),
        
        // Save security settings
        saveSetting('max_login_attempts', securitySettings.maxLoginAttempts),
        saveSetting('session_timeout', securitySettings.sessionTimeout),
        saveSetting('two_factor_required', securitySettings.twoFactorRequired),
        saveSetting('ip_whitelist', securitySettings.ipWhitelist),
        saveSetting('password_min_length', securitySettings.passwordMinLength),
        saveSetting('password_require_special', securitySettings.passwordRequireSpecial),
        
        // Save notification settings
        saveSetting('email_notifications', notificationSettings.emailNotifications),
        saveSetting('sms_notifications', notificationSettings.smsNotifications),
        saveSetting('push_notifications', notificationSettings.pushNotifications),
        saveSetting('deposit_notifications', notificationSettings.depositNotifications),
        saveSetting('withdrawal_notifications', notificationSettings.withdrawalNotifications),
        saveSetting('new_user_notifications', notificationSettings.newUserNotifications)
      ]);

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Cache limpo com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar cache",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    toast({
      title: "Exportação Iniciada",
      description: "O backup dos dados foi iniciado",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-casino-gold">Carregando configurações...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-casino-gold">Configurações do Sistema</h1>
          <Button onClick={saveAllSettings} disabled={saving} className="gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar Tudo'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Database className="w-4 h-4" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Manutenção
            </TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Site</CardTitle>
                  <CardDescription>Configurações básicas da plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Descrição</Label>
                    <Textarea
                      id="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Email de Suporte</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={systemSettings.supportEmail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportPhone">Telefone de Suporte</Label>
                    <Input
                      id="supportPhone"
                      value={systemSettings.supportPhone}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações Financeiras</CardTitle>
                  <CardDescription>Limites e taxas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="minDeposit">Depósito Mínimo (R$)</Label>
                    <Input
                      id="minDeposit"
                      type="number"
                      min="1"
                      value={systemSettings.minDepositAmount}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, minDepositAmount: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxWithdraw">Saque Máximo (R$)</Label>
                    <Input
                      id="maxWithdraw"
                      type="number"
                      min="1"
                      value={systemSettings.maxWithdrawAmount}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxWithdrawAmount: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdrawalFee">Taxa de Saque (%)</Label>
                    <Input
                      id="withdrawalFee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={systemSettings.withdrawalFee}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, withdrawalFee: Number(e.target.value) }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Acesso</CardTitle>
                <CardDescription>Controles de acesso ao sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">Impede o acesso de usuários ao site</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registro de Novos Usuários</Label>
                    <p className="text-sm text-muted-foreground">Permite que novos usuários se cadastrem</p>
                  </div>
                  <Switch
                    checked={systemSettings.registrationEnabled}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Autenticação</CardTitle>
                  <CardDescription>Configurações de login e senhas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxAttempts">Tentativas Máximas de Login</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="1"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Timeout da Sessão (horas)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordLength">Tamanho Mínimo da Senha</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      min="6"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Caracteres Especiais Obrigatórios</Label>
                      <p className="text-sm text-muted-foreground">Exige símbolos nas senhas</p>
                    </div>
                    <Switch
                      checked={securitySettings.passwordRequireSpecial}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireSpecial: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Controle de Acesso</CardTitle>
                  <CardDescription>Configurações avançadas de segurança</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">Obrigatória para administradores</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ipWhitelist">IPs Autorizados (Admin)</Label>
                    <Textarea
                      id="ipWhitelist"
                      placeholder="192.168.1.1&#10;10.0.0.1"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Um IP por linha. Deixe vazio para permitir todos.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canais de Notificação</CardTitle>
                <CardDescription>Configure os métodos de notificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">Notificações por email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS</Label>
                      <p className="text-sm text-muted-foreground">Notificações por SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push</Label>
                      <p className="text-sm text-muted-foreground">Notificações push</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos de Notificação</CardTitle>
                <CardDescription>Escolha quais eventos geram notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Novos Depósitos</Label>
                      <p className="text-sm text-muted-foreground">Quando usuários fazem depósitos</p>
                    </div>
                    <Switch
                      checked={notificationSettings.depositNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, depositNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Solicitações de Saque</Label>
                      <p className="text-sm text-muted-foreground">Quando usuários solicitam saques</p>
                    </div>
                    <Switch
                      checked={notificationSettings.withdrawalNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, withdrawalNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Novos Usuários</Label>
                      <p className="text-sm text-muted-foreground">Quando usuários se registram</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newUserNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newUserNotifications: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banco de Dados */}
          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas do Sistema</CardTitle>
                  <CardDescription>Informações sobre o banco de dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Usuários:</span>
                    <Badge>{stats.totalUsers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Apostas:</span>
                    <Badge>{stats.totalBets}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanho do Banco:</span>
                    <Badge>{stats.databaseSize}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo Online:</span>
                    <Badge>{stats.uptime}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operações de Backup</CardTitle>
                  <CardDescription>Gerencie backups e exportações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={exportData} className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Dados
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" />
                    Importar Dados
                  </Button>
                  <Button onClick={clearCache} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Limpar Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manutenção */}
          <TabsContent value="maintenance" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                As operações abaixo são irreversíveis e podem afetar o funcionamento do sistema. Use com cautela.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operações de Sistema</CardTitle>
                  <CardDescription>Ferramentas de manutenção do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={clearCache} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reiniciar Sistema
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Server className="w-4 h-4" />
                    Verificar Integridade
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Database className="w-4 h-4" />
                    Otimizar Banco
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-500">Zona de Perigo</CardTitle>
                  <CardDescription>Operações que podem causar perda de dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="w-4 h-4" />
                    Limpar Logs Antigos
                  </Button>
                  <Button variant="destructive" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Reset Senhas Usuários
                  </Button>
                  <Button variant="destructive" className="w-full gap-2">
                    <DollarSign className="w-4 h-4" />
                    Reset Carteiras Demo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}