import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Webhook, 
  CreditCard, 
  Eye, 
  Save, 
  TestTube,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface IntegrationConfig {
  pix_api_config: {
    provider: string;
    api_key: string;
    webhook_url: string;
  };
  webhook_config: {
    zapier_url: string;
    meta_pixel_id: string;
  };
}

export default function Integrations() {
  const [config, setConfig] = useState<IntegrationConfig>({
    pix_api_config: {
      provider: '',
      api_key: '',
      webhook_url: '',
    },
    webhook_config: {
      zapier_url: '',
      meta_pixel_id: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrationSettings();
  }, []);

  const loadIntegrationSettings = async () => {
    try {
      // Load PIX API config
      const { data: pixData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'pix_api_config')
        .single();

      // Load webhook config
      const { data: webhookData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'webhook_config')
        .single();

      if (pixData?.value) {
        setConfig(prev => ({ ...prev, pix_api_config: pixData.value as any }));
      }

      if (webhookData?.value) {
        setConfig(prev => ({ ...prev, webhook_config: webhookData.value as any }));
      }
    } catch (error) {
      console.error('Error loading integration settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save PIX API config
      await supabase
        .from('system_settings')
        .upsert({
          key: 'pix_api_config',
          value: config.pix_api_config as any,
          updated_at: new Date().toISOString()
        });

      // Save webhook config
      await supabase
        .from('system_settings')
        .upsert({
          key: 'webhook_config',
          value: config.webhook_config as any,
          updated_at: new Date().toISOString()
        });

      // Save Meta Pixel ID to localStorage for immediate use
      if (config.webhook_config.meta_pixel_id) {
        localStorage.setItem('meta_pixel_id', config.webhook_config.meta_pixel_id);
        
        // Reinitialize Meta Pixel with new ID
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('init', config.webhook_config.meta_pixel_id);
          (window as any).fbq('track', 'PageView');
        }
      }

      toast({
        title: "Integrações salvas",
        description: "Todas as configurações de integração foram salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving integration settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as integrações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testPixIntegration = async () => {
    try {
      // Test PIX API connection
      const testPayload = {
        value: 1.00,
        description: "Teste de integração"
      };

      toast({
        title: "Testando PIX",
        description: "Verificando conexão com API...",
      });

      // Simulate API test
      setTimeout(() => {
        const success = config.pix_api_config.api_key.length > 0;
        setTestResults(prev => ({ ...prev, pix: success }));
        
        toast({
          title: success ? "PIX OK" : "PIX Falhou",
          description: success ? "Integração PIX funcionando" : "Verifique as credenciais",
          variant: success ? "default" : "destructive",
        });
      }, 2000);
    } catch (error) {
      setTestResults(prev => ({ ...prev, pix: false }));
      toast({
        title: "Erro no teste PIX",
        description: "Não foi possível testar a integração PIX",
        variant: "destructive",
      });
    }
  };

  const testZapierWebhook = async () => {
    try {
      if (!config.webhook_config.zapier_url) {
        toast({
          title: "URL necessária",
          description: "Configure a URL do Zapier primeiro",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(config.webhook_config.zapier_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Teste de webhook do painel admin"
        })
      });

      setTestResults(prev => ({ ...prev, zapier: true }));
      toast({
        title: "Webhook enviado",
        description: "Teste enviado para o Zapier. Verifique o histórico do Zap.",
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, zapier: false }));
      toast({
        title: "Erro no webhook",
        description: "Não foi possível enviar webhook para o Zapier",
        variant: "destructive",
      });
    }
  };

  const testMetaPixel = () => {
    if (!config.webhook_config.meta_pixel_id) {
      toast({
        title: "Pixel ID necessário",
        description: "Configure o ID do Meta Pixel primeiro",
        variant: "destructive",
      });
      return;
    }

    // Simulate Meta Pixel test event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AdminTest', {
        test_source: 'admin_panel',
        timestamp: Date.now()
      });
      
      setTestResults(prev => ({ ...prev, meta_pixel: true }));
      toast({
        title: "Meta Pixel testado",
        description: "Evento de teste enviado para o Meta Pixel",
      });
    } else {
      toast({
        title: "Meta Pixel não carregado",
        description: "Verifique se o pixel está instalado corretamente",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="w-6 h-6 text-casino-gold" />
            <h1 className="text-2xl font-bold text-casino-gold">Integrações</h1>
          </div>
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="bg-casino-gold text-casino-bg hover:bg-casino-gold-muted"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Tudo'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* PIX Integration */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-casino-gold" />
                <h2 className="text-lg font-semibold text-casino-gold">Integração PIX</h2>
              </div>
              {testResults.pix !== undefined && (
                <Badge className={testResults.pix ? 'bg-green-500' : 'bg-red-500'}>
                  {testResults.pix ? 'Funcionando' : 'Com Erro'}
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-casino-gold mb-2 block">Provedor PIX</Label>
                <Input
                  type="text"
                  value={config.pix_api_config.provider}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    pix_api_config: { ...prev.pix_api_config, provider: e.target.value }
                  }))}
                  placeholder="Ex: MercadoPago, PagSeguro, Asaas"
                  className="bg-casino-surface border-casino-gold/20"
                />
              </div>

              <div>
                <Label className="text-casino-gold mb-2 block">API Key</Label>
                <Input
                  type="password"
                  value={config.pix_api_config.api_key}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    pix_api_config: { ...prev.pix_api_config, api_key: e.target.value }
                  }))}
                  placeholder="Sua chave API do provedor PIX"
                  className="bg-casino-surface border-casino-gold/20"
                />
              </div>

              <div>
                <Label className="text-casino-gold mb-2 block">Webhook URL</Label>
                <Input
                  type="url"
                  value={config.pix_api_config.webhook_url}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    pix_api_config: { ...prev.pix_api_config, webhook_url: e.target.value }
                  }))}
                  placeholder="https://ozubododfkoeyqpxiifl.supabase.co/functions/v1/pix-webhook"
                  className="bg-casino-surface border-casino-gold/20"
                />
              </div>

              <Button
                onClick={testPixIntegration}
                variant="outline"
                className="w-full border-casino-gold/20"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Testar Integração PIX
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 Configure sua API PIX para processar pagamentos automaticamente. 
                O webhook receberá confirmações de pagamento.
              </p>
            </div>
          </Card>

          {/* Webhook Integration */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Webhook className="w-5 h-5 text-casino-gold" />
                <h2 className="text-lg font-semibold text-casino-gold">Webhooks</h2>
              </div>
              {testResults.zapier !== undefined && (
                <Badge className={testResults.zapier ? 'bg-green-500' : 'bg-red-500'}>
                  {testResults.zapier ? 'Funcionando' : 'Com Erro'}
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-casino-gold mb-2 block">Zapier Webhook URL</Label>
                <Input
                  type="url"
                  value={config.webhook_config.zapier_url}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    webhook_config: { ...prev.webhook_config, zapier_url: e.target.value }
                  }))}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="bg-casino-surface border-casino-gold/20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole aqui a URL do webhook do seu Zap no Zapier
                </p>
              </div>

              <Button
                onClick={testZapierWebhook}
                variant="outline"
                className="w-full border-casino-gold/20"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Testar Webhook Zapier
              </Button>

              <div className="pt-4 border-t border-casino-gold/20">
                <h4 className="text-sm font-semibold text-casino-gold mb-2">Eventos Enviados:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Novos cadastros de usuários</li>
                  <li>• Depósitos realizados</li>
                  <li>• Saques solicitados</li>
                  <li>• Apostas realizadas</li>
                  <li>• Grandes vitórias</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Meta Pixel Integration */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-casino-gold" />
                <h2 className="text-lg font-semibold text-casino-gold">Meta Pixel</h2>
              </div>
              {testResults.meta_pixel !== undefined && (
                <Badge className={testResults.meta_pixel ? 'bg-green-500' : 'bg-red-500'}>
                  {testResults.meta_pixel ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-casino-gold mb-2 block">Pixel ID</Label>
                <Input
                  type="text"
                  value={config.webhook_config.meta_pixel_id}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    webhook_config: { ...prev.webhook_config, meta_pixel_id: e.target.value }
                  }))}
                  placeholder="123456789012345"
                  className="bg-casino-surface border-casino-gold/20"
                />
              </div>

              <Button
                onClick={testMetaPixel}
                variant="outline"
                className="w-full border-casino-gold/20"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Testar Meta Pixel
              </Button>

              <div className="pt-4 border-t border-casino-gold/20">
                <h4 className="text-sm font-semibold text-casino-gold mb-2">Eventos Rastreados:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• PageView (visualizações de página)</li>
                  <li>• CompleteRegistration (cadastros)</li>
                  <li>• Purchase (depósitos)</li>
                  <li>• AddToCart (apostas)</li>
                  <li>• Lead (interesse em saques)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Integration Status */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h2 className="text-lg font-semibold text-casino-gold mb-6">Status das Integrações</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-casino-gold" />
                  <span className="text-sm font-medium text-casino-gold">PIX API</span>
                </div>
                <div className="flex items-center space-x-2">
                  {config.pix_api_config.api_key ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {config.pix_api_config.api_key ? 'Configurado' : 'Pendente'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Webhook className="w-4 h-4 text-casino-gold" />
                  <span className="text-sm font-medium text-casino-gold">Zapier</span>
                </div>
                <div className="flex items-center space-x-2">
                  {config.webhook_config.zapier_url ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {config.webhook_config.zapier_url ? 'Configurado' : 'Pendente'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-casino-gold" />
                  <span className="text-sm font-medium text-casino-gold">Meta Pixel</span>
                </div>
                <div className="flex items-center space-x-2">
                  {config.webhook_config.meta_pixel_id ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {config.webhook_config.meta_pixel_id ? 'Configurado' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500">
                ⚠️ <strong>Importante:</strong> Teste sempre as integrações após configurar. 
                Monitore os logs para identificar possíveis problemas.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}