import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import coinCaraImg from '@/assets/coin-cara-text.jpg';
import coinCoroaImg from '@/assets/coin-coroa-text.jpg';
import coin3dCaraImg from '@/assets/coin-3d-cara.png';
import coin3dCoroaImg from '@/assets/coin-3d-coroa.png';

interface CoinFlipProps {
  onBet: (choice: 'cara' | 'coroa', amount: number, level: number) => Promise<{ won: boolean; result: 'cara' | 'coroa'; payout: number }>;
  balance: number;
  disabled?: boolean;
}

const betLevels = [
  { level: 1, multiplier: 1.9, chance: 50, name: 'Fácil' },
  { level: 2, multiplier: 4.9, chance: 30, name: 'Médio' },
  { level: 3, multiplier: 9.9, chance: 10, name: 'Difícil' }
];

export function CoinFlip({ onBet, balance, disabled }: CoinFlipProps) {
  const [betAmount, setBetAmount] = useState('1.50');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState<'cara' | 'coroa'>('cara');
  const [turboMode, setTurboMode] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<'cara' | 'coroa' | null>(null);
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const { toast } = useToast();

  const playSound = (soundFile: string) => {
    try {
      const audio = new Audio(`/sounds/${soundFile}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently handle audio play failures (user interaction required)
      });
    } catch (error) {
      // Silently handle audio failures
    }
  };

  const currentLevel = betLevels.find(level => level.level === selectedLevel)!;
  const numericAmount = parseFloat(betAmount) || 0;

  const handleSpin = async () => {
    if (numericAmount < 1.5) {
      toast({
        title: "Valor inválido",
        description: "O valor mínimo para aposta é R$ 1,50.",
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para esta aposta.",
        variant: "destructive",
      });
      return;
    }

    if (disabled || isFlipping) return;

    setIsFlipping(true);
    setLastWon(null);
    setLastResult(null);
    playSound('coin-flip');
    
    try {
      const result = await onBet(selectedChoice, numericAmount, selectedLevel);
      
      // Tempo baseado no modo: TURBO (1s) ou NORMAL (2.5s)
      const spinDuration = turboMode ? 1000 : 2500;
      
      setTimeout(() => {
        setLastResult(result.result);
        setLastWon(result.won);
        setIsFlipping(false);
        
        if (result.won) {
          playSound('win');
          toast({
            title: "Parabéns! Você ganhou!",
            description: `Você ganhou R$ ${result.payout.toFixed(2)}`,
            className: "bg-brand-green",
          });
        } else {
          playSound('lose');
          toast({
            title: "Que pena!",
            description: `O resultado foi ${result.result}. Tente novamente!`,
            variant: "destructive",
          });
        }
      }, spinDuration);
      
    } catch (error) {
      setIsFlipping(false);
      toast({
        title: "Erro",
        description: "Erro ao processar aposta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Coin Display */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="flex items-center sm:hidden">
            <div className="text-center text-brand-gold">
              <div className="text-2xl font-bold">{currentLevel.multiplier}x</div>
              <div className="text-xs opacity-80">{currentLevel.name}</div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center">
            <div className="text-right text-brand-gold">
              <div className="text-3xl font-bold">{currentLevel.multiplier}x</div>
              <div className="text-sm opacity-80">{currentLevel.name}</div>
            </div>
          </div>
          
          <div className="relative perspective-1000">
            {/* Moeda sem clique */}
            <div 
              className={`coin-3d ${lastResult === 'coroa' ? 'show-coroa' : 'show-cara'} ${
                isFlipping ? (turboMode ? 'animate-spin' : 'animate-spin') : ''
              } transition-transform duration-300`}
              style={{
                width: '160px',
                height: '160px',
                transformStyle: 'preserve-3d',
                transition: isFlipping ? 'none' : 'transform 0.6s, filter 0.3s',
                filter: isFlipping ? 'drop-shadow(0 0 50px rgba(255, 215, 0, 0.8))' : 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))',
                animationDuration: isFlipping ? (turboMode ? '0.1s' : '0.3s') : '0s',
              }}
            >
              {/* Lado CARA */}
              <div className="coin-side coin-front">
                <div className="coin-inner">
                  <div className="coin-text">CARA</div>
                </div>
              </div>

              {/* Lado COROA */}
              <div className="coin-side coin-back">
                <div className="coin-inner">
                  <div className="coin-text">COROA</div>
                </div>
              </div>

              {/* Borda da moeda */}
              <div className="coin-edge"></div>
            </div>
            
            {/* Status da moeda */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              {isFlipping ? (
                <div className="text-brand-gold text-sm font-semibold animate-pulse">
                  {turboMode ? '⚡ TURBO!' : '🎰 Girando...'}
                </div>
              ) : (
                <div className="text-brand-gold text-sm font-semibold">
                  Sua escolha: {selectedChoice.toUpperCase()}
                </div>
              )}
            </div>
            
            {lastWon !== null && (
              <div 
                className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
                  lastWon ? 'bg-brand-green text-white' : 'bg-destructive text-white'
                }`}
              >
                {lastWon ? 'GANHOU!' : 'PERDEU'}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center">
            <div className="text-left text-brand-gold">
              <div className="text-3xl font-bold">{currentLevel.multiplier}x</div>
              <div className="text-sm opacity-80">{currentLevel.name}</div>
            </div>
          </div>
        </div>

        {/* Seleção de Escolha (CARA ou COROA) */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-brand-gold/20">
          <h3 className="text-lg font-semibold mb-4 text-center text-brand-gold">
            Sua Escolha
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedChoice === 'cara' ? "default" : "outline"}
              onClick={() => setSelectedChoice('cara')}
              disabled={disabled || isFlipping}
              className={`p-4 h-auto text-base font-bold ${
                selectedChoice === 'cara' 
                  ? "bg-brand-gold text-brand-bg hover:bg-brand-gold-muted" 
                  : "border-brand-gold/30 hover:border-brand-gold text-foreground hover:bg-brand-gold/10"
              }`}
            >
              CARA
            </Button>
            <Button
              variant={selectedChoice === 'coroa' ? "default" : "outline"}
              onClick={() => setSelectedChoice('coroa')}
              disabled={disabled || isFlipping}
              className={`p-4 h-auto text-base font-bold ${
                selectedChoice === 'coroa' 
                  ? "bg-brand-gold text-brand-bg hover:bg-brand-gold-muted" 
                  : "border-brand-gold/30 hover:border-brand-gold text-foreground hover:bg-brand-gold/10"
              }`}
            >
              COROA
            </Button>
          </div>
        </Card>

        {/* Bet Level Selection */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-brand-gold/20">
          <h3 className="text-lg font-semibold mb-4 text-center text-brand-gold">
            Nível da Aposta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {betLevels.map((level) => (
              <Button
                key={level.level}
                variant={selectedLevel === level.level ? "default" : "outline"}
                onClick={() => setSelectedLevel(level.level)}
                disabled={disabled || isFlipping}
                className={`p-3 h-auto flex flex-col text-sm sm:text-base ${
                  selectedLevel === level.level 
                    ? "bg-brand-gold text-brand-bg hover:bg-brand-gold-muted" 
                    : "border-brand-gold/30 hover:border-brand-gold text-foreground hover:bg-brand-gold/10"
                }`}
              >
                <div className="font-bold">{level.name}</div>
                <div className="text-xs opacity-80">{level.multiplier}x</div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Bet Amount Input */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-brand-gold/20">
          <h3 className="text-lg font-semibold mb-4 text-center text-brand-gold">
            Valor da Aposta
          </h3>
          <div className="space-y-3">
            {/* Controles de Valor */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => {
                  const newAmount = Math.max(1.50, numericAmount - 0.50);
                  setBetAmount(newAmount.toFixed(2));
                }}
                disabled={disabled || isFlipping || numericAmount <= 1.50}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full border-brand-gold/30 hover:border-brand-gold text-brand-gold hover:bg-brand-gold/10 text-xl font-bold"
              >
                −
              </Button>
              
              <div className="text-center min-w-[120px]">
                <div className="text-2xl font-bold text-brand-gold">
                  R$ {numericAmount.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Mín. R$ 1,50
                </div>
              </div>
              
              <Button
                onClick={() => {
                  const newAmount = Math.min(balance, numericAmount + 0.50);
                  setBetAmount(newAmount.toFixed(2));
                }}
                disabled={disabled || isFlipping || numericAmount >= balance}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full border-brand-gold/30 hover:border-brand-gold text-brand-gold hover:bg-brand-gold/10 text-xl font-bold"
              >
                +
              </Button>
            </div>
            
            {/* Valores rápidos */}
            <div className="grid grid-cols-4 gap-2">
              {[1.50, 5.00, 10.00, 25.00].map((value) => (
                <Button
                  key={value}
                  onClick={() => setBetAmount(value.toFixed(2))}
                  disabled={disabled || isFlipping || value > balance}
                  variant="outline"
                  size="sm"
                  className={`text-xs font-semibold ${
                    numericAmount === value 
                      ? "bg-brand-gold/20 border-brand-gold text-brand-gold" 
                      : "border-brand-gold/30 hover:border-brand-gold text-foreground hover:bg-brand-gold/10"
                  }`}
                >
                  R$ {value.toFixed(2)}
                </Button>
              ))}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Ganho potencial: <span className="text-brand-gold font-semibold">
                R$ {(numericAmount * currentLevel.multiplier).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Botão GIRAR e Modo TURBO */}
        <div className="space-y-4">
          {/* Toggle TURBO/NORMAL */}
          <Card className="p-4 bg-gradient-card border-brand-gold/20">
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-sm font-semibold ${!turboMode ? 'text-brand-gold' : 'text-muted-foreground'}`}>
                NORMAL
              </span>
              <button
                onClick={() => setTurboMode(!turboMode)}
                disabled={disabled || isFlipping}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  turboMode ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    turboMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-semibold ${turboMode ? 'text-orange-500' : 'text-muted-foreground'}`}>
                ⚡ TURBO
              </span>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">
              {turboMode ? 'Giro rápido (1s)' : 'Giro normal (2.5s)'}
            </div>
          </Card>

          {/* Botão GIRAR */}
          <Button
            onClick={handleSpin}
            disabled={disabled || isFlipping || numericAmount > balance || numericAmount < 1.5}
            size="lg"
            className={`w-full h-16 text-2xl font-black transition-all duration-300 ${
              turboMode 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30' 
                : 'bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-yellow-500 hover:to-brand-gold shadow-lg shadow-brand-gold/30'
            } text-black hover:scale-105 active:scale-95 ${
              isFlipping ? 'animate-pulse' : ''
            }`}
          >
            {isFlipping ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin">🎰</span>
                <span>{turboMode ? 'TURBO!' : 'GIRANDO...'}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🎰</span>
                <span>GIRAR</span>
                {turboMode && <span>⚡</span>}
              </span>
            )}
          </Button>
        </div>

        {/* Instruções Atualizadas */}
        <Card className="p-4 bg-brand-surface border-brand-gold/20">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-brand-gold">Como Jogar:</p>
            <p className="text-xs text-muted-foreground">
              1. Escolha <span className="text-brand-gold font-semibold">CARA</span> ou <span className="text-brand-gold font-semibold">COROA</span>
            </p>
            <p className="text-xs text-muted-foreground">
              2. Defina valor e nível da aposta
            </p>
            <p className="text-xs text-muted-foreground">
              3. Ative o <span className="text-orange-500 font-semibold">TURBO</span> para giros rápidos
            </p>
            <p className="text-xs text-muted-foreground">
              4. <span className="text-brand-gold font-semibold">Clique em GIRAR</span> para apostar!
            </p>
            <div className="mt-3 pt-2 border-t border-brand-gold/20">
              <p className="text-xs text-muted-foreground">
                Sua escolha: <span className="text-brand-gold font-semibold">{selectedChoice.toUpperCase()}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Modo: <span className={`font-semibold ${turboMode ? 'text-orange-500' : 'text-brand-gold'}`}>
                  {turboMode ? 'TURBO ⚡' : 'NORMAL'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Nível {currentLevel.name}: <span className="text-brand-gold font-semibold">{currentLevel.multiplier}x</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo atual: <span className="text-brand-gold font-semibold">R$ {balance.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}