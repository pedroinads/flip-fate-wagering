import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Palette, Upload, Save, RotateCcw } from 'lucide-react';

interface SystemColors {
  primary: string;
  secondary: string;
  accent: string;
}

export default function Customization() {
  const [colors, setColors] = useState<SystemColors>({
    primary: '#D4AF37',
    secondary: '#1a1a2e',
    accent: '#16213e',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      // Load colors
      const { data: colorsData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'site_colors')
        .single();

      if (colorsData?.value) {
        setColors(colorsData.value as any);
      }

      // Load logo
      const { data: logoData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'site_logo')
        .single();

      if (logoData?.value && logoData.value !== '""') {
        setLogoPreview(logoData.value as string);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleColorChange = (colorKey: keyof SystemColors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColors = () => {
    // Apply colors to CSS variables in real-time
    const root = document.documentElement;
    
    // Convert hex to HSL
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--casino-gold', hexToHsl(colors.primary));
    root.style.setProperty('--casino-bg', hexToHsl(colors.secondary));
    root.style.setProperty('--casino-surface', hexToHsl(colors.accent));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save colors
      await supabase
        .from('system_settings')
        .upsert({
          key: 'site_colors',
          value: colors as any,
          updated_at: new Date().toISOString()
        });

      // Save logo if uploaded
      if (logoFile) {
        // In a real app, you would upload to storage
        // For now, we'll save the base64 data
        await supabase
          .from('system_settings')
          .upsert({
            key: 'site_logo',
            value: logoPreview as any,
            updated_at: new Date().toISOString()
          });
      }

      // Apply colors to the current page
      applyColors();

      toast({
        title: "Personalização salva",
        description: "As configurações de personalização foram aplicadas com sucesso",
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a personalização",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setColors({
      primary: '#D4AF37',
      secondary: '#1a1a2e',
      accent: '#16213e',
    });
    setLogoPreview('');
    setLogoFile(null);
  };

  const previewColors = () => {
    applyColors();
    toast({
      title: "Preview aplicado",
      description: "As cores foram aplicadas temporariamente. Salve para tornar permanente.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-casino-gold" />
            <h1 className="text-2xl font-bold text-casino-gold">Personalização do Sistema</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={previewColors}
              variant="outline"
              className="border-casino-gold/20"
            >
              Preview
            </Button>
            <Button
              onClick={resetToDefault}
              variant="outline"
              className="border-casino-gold/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="bg-casino-gold text-casino-bg hover:bg-casino-gold-muted"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Customization */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h2 className="text-lg font-semibold text-casino-gold mb-6">Cores do Sistema</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-casino-gold mb-3 block">Cor Primária (Dourado)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="color"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-16 h-12 border-casino-gold/20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="bg-casino-surface border-casino-gold/20 font-mono"
                    placeholder="#D4AF37"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usada para elementos principais, botões e destaques
                </p>
              </div>

              <div>
                <Label className="text-casino-gold mb-3 block">Cor Secundária (Fundo)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-16 h-12 border-casino-gold/20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="bg-casino-surface border-casino-gold/20 font-mono"
                    placeholder="#1a1a2e"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cor de fundo principal da aplicação
                </p>
              </div>

              <div>
                <Label className="text-casino-gold mb-3 block">Cor de Destaque</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="color"
                    value={colors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-16 h-12 border-casino-gold/20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="bg-casino-surface border-casino-gold/20 font-mono"
                    placeholder="#16213e"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usada para cards, superfícies e elementos secundários
                </p>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 rounded-lg border border-casino-gold/20" style={{
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`
            }}>
              <div className="text-center">
                <div 
                  className="inline-block px-4 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: colors.primary, color: colors.secondary }}
                >
                  Preview das Cores
                </div>
                <p className="text-sm mt-2" style={{ color: colors.primary }}>
                  Exemplo de texto com cor primária
                </p>
              </div>
            </div>
          </Card>

          {/* Logo Customization */}
          <Card className="p-6 bg-gradient-card border-casino-gold/20">
            <h2 className="text-lg font-semibold text-casino-gold mb-6">Logo do Sistema</h2>
            
            <div className="space-y-6">
              {/* Current Logo Preview */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-casino-gold/30 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhum logo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Logo */}
              <div>
                <Label className="text-casino-gold mb-3 block">Fazer Upload do Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="bg-casino-surface border-casino-gold/20"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos aceitos: PNG, JPG, SVG. Tamanho recomendado: 200x200px
                </p>
              </div>

              {/* Logo Guidelines */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Diretrizes do Logo</h4>
                <ul className="text-xs text-blue-300 space-y-1">
                  <li>• Use fundo transparente para melhor resultado</li>
                  <li>• Mantenha proporção quadrada ou retangular</li>
                  <li>• Evite textos muito pequenos</li>
                  <li>• Teste a legibilidade em diferentes tamanhos</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Customization Options */}
        <Card className="p-6 bg-gradient-card border-casino-gold/20">
          <h2 className="text-lg font-semibold text-casino-gold mb-6">Configurações Avançadas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-casino-gold mb-2 block">Nome do Site</Label>
              <Input
                type="text"
                defaultValue="Cara ou Coroa"
                className="bg-casino-surface border-casino-gold/20"
                placeholder="Nome da sua plataforma"
              />
            </div>
            
            <div>
              <Label className="text-casino-gold mb-2 block">Slogan</Label>
              <Input
                type="text"
                defaultValue="A melhor plataforma de jogos"
                className="bg-casino-surface border-casino-gold/20"
                placeholder="Seu slogan"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-500">
              ⚠️ <strong>Atenção:</strong> Mudanças na personalização afetam toda a experiência do usuário. 
              Teste sempre antes de aplicar em produção.
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}