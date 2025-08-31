import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  // Redirect if already admin
  if (user && !adminLoading && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in first
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        toast({
          title: "Erro de acesso",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        return;
      }

      // Check if user is admin after signing in
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.user.id)
          .eq('role', 'admin')
          .single();

        if (!roleData) {
          await supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar o painel administrativo",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Login realizado",
        description: "Bem-vindo ao painel administrativo",
      });

    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-casino flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-casino-gold/20 shadow-casino">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-casino-gold" />
          </div>
          <h1 className="text-2xl font-bold text-casino-gold mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground text-sm">
            Acesso restrito para administradores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-casino-gold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-casino-surface border-casino-gold/20 text-casino-gold"
              placeholder="admin@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-casino-gold">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-casino-surface border-casino-gold/20 text-casino-gold pr-10"
                placeholder="••••••••"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-casino-gold text-casino-bg hover:bg-casino-gold-muted"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Apenas administradores autorizados podem acessar este painel
          </p>
        </div>
      </Card>
    </div>
  );
}