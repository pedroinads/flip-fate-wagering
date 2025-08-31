import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save } from 'lucide-react';

interface GameSettings {
  level1_multiplier: number;
  level2_multiplier: number;
  level3_multiplier: number;
  level1_chance: number;
  level2_chance: number;
  level3_chance: number;
}

export default function GameControl() {
  const [settings, setSettings] = useState<GameSettings>({
    level1_multiplier: 1.9,
    level2_multiplier: 4.9,
    level3_multiplier: 9.9,
    level1_chance: 50,
    level2_chance: 30,
    level3_chance: 10,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'game_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data?.value) {
        setSettings(data.value as any);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'game_settings',
          value: settings as any,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações do jogo foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof GameSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-casino-gold" />
            <h1 className="text-2xl font-bold text-casino-gold">Controle de Ganhos</h1>
          </div>
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="bg-casino-gold text-casino-bg hover:bg-casino-gold-muted"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Multiplicadores */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h2 className="text-lg font-semibold text-casino-gold mb-6">Multiplicadores</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-casino-gold mb-2 block">Nível 1 (Fácil)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={settings.level1_multiplier}
                    onChange={(e) => updateSetting('level1_multiplier', Number(e.target.value))}
                    className="w-24 bg-casino-surface border-casino-gold/20"
                  />
                  <span className="text-casino-gold">x</span>
                </div>
              </div>

              <div>
                <Label className="text-casino-gold mb-2 block">Nível 2 (Médio)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={settings.level2_multiplier}
                    onChange={(e) => updateSetting('level2_multiplier', Number(e.target.value))}
                    className="w-24 bg-casino-surface border-casino-gold/20"
                  />
                  <span className="text-casino-gold">x</span>
                </div>
              </div>

              <div>
                <Label className="text-casino-gold mb-2 block">Nível 3 (Difícil)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={settings.level3_multiplier}
                    onChange={(e) => updateSetting('level3_multiplier', Number(e.target.value))}
                    className="w-24 bg-casino-surface border-casino-gold/20"
                  />
                  <span className="text-casino-gold">x</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Chances de Vitória */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h2 className="text-lg font-semibold text-casino-gold mb-6">Chances de Vitória (%)</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-casino-gold mb-2 block">
                  Nível 1: {settings.level1_chance}%
                </Label>
                <Slider
                  value={[settings.level1_chance]}
                  onValueChange={([value]) => updateSetting('level1_chance', value)}
                  min={10}
                  max={90}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-casino-gold mb-2 block">
                  Nível 2: {settings.level2_chance}%
                </Label>
                <Slider
                  value={[settings.level2_chance]}
                  onValueChange={([value]) => updateSetting('level2_chance', value)}
                  min={5}
                  max={70}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-casino-gold mb-2 block">
                  Nível 3: {settings.level3_chance}%
                </Label>
                <Slider
                  value={[settings.level3_chance]}
                  onValueChange={([value]) => updateSetting('level3_chance', value)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Resumo das Configurações */}
        <Card className="p-6 bg-gradient-card border-casino-gold/20">
          <h2 className="text-lg font-semibold text-casino-gold mb-4">Resumo das Configurações</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-casino-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{settings.level1_multiplier}x</div>
              <div className="text-sm text-muted-foreground">Nível 1</div>
              <div className="text-xs text-casino-gold">{settings.level1_chance}% chance</div>
            </div>
            
            <div className="text-center p-4 bg-casino-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{settings.level2_multiplier}x</div>
              <div className="text-sm text-muted-foreground">Nível 2</div>
              <div className="text-xs text-casino-gold">{settings.level2_chance}% chance</div>
            </div>
            
            <div className="text-center p-4 bg-casino-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{settings.level3_multiplier}x</div>
              <div className="text-sm text-muted-foreground">Nível 3</div>
              <div className="text-xs text-casino-gold">{settings.level3_chance}% chance</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-500">
              ⚠️ <strong>Atenção:</strong> Essas configurações afetam diretamente as chances de vitória dos jogadores. 
              Alterações muito drásticas podem impactar a experiência do usuário e a rentabilidade da plataforma.
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}