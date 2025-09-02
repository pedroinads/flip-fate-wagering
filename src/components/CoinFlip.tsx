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
  const [betAmount, setBetAmount] = useState('1');
  const [selectedLevel, setSelectedLevel] = useState(1);
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

  const handleBet = async (choice: 'cara' | 'coroa') => {
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

    setIsFlipping(true);
    setLastWon(null);
    setLastResult(null);
    playSound('coin-flip');
    
    try {
      const result = await onBet(choice, numericAmount, selectedLevel);
      
      // Spin for 4.5 seconds then show result
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
      }, 4500);
      
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
      {/* Coin Flip Animation Overlay */}
      {isFlipping && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-sky-400/80 to-green-400/80 backdrop-blur-sm flex items-center justify-center overflow-hidden">
          {/* Floating sparkles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  filter: 'drop-shadow(0 0 4px rgba(255, 255, 0, 0.8))',
                }}
              />
            ))}
          </div>

          {/* Main coin animation container */}
          <div className="relative flex flex-col items-center justify-center h-full w-full">
            {/* Motion lines */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rotate-45 animate-pulse opacity-60"></div>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent -rotate-45 animate-pulse opacity-60"></div>
            </div>

            {/* Moeda simples sem animação complexa */}
            <div className="relative">
              <div 
                className="coin-3d"
                style={{
                  width: '160px',
                  height: '160px',
                  transformStyle: 'preserve-3d',
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
            </div>

            {/* Status text */}
            <div className="absolute bottom-20 text-center">
              <div className="text-3xl font-bold text-yellow-300 animate-bounce drop-shadow-lg">
                🪙 LANÇANDO MOEDA! 🪙
              </div>
              <div className="text-lg text-white/90 mt-2 animate-pulse">
                Aguarde o resultado...
              </div>
            </div>
          </div>
        </div>
      )}

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
            {/* Moeda 3D Simples como a foto */}
            <div 
              className={`coin-3d ${lastResult === 'coroa' ? 'show-coroa' : 'show-cara'}`}
              style={{
                width: '160px',
                height: '160px',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
              }}
            >
              {/* Lado CARA - simples */}
              <div className="coin-side coin-front">
                <div className="coin-inner">
                  <div className="coin-text">CARA</div>
                </div>
              </div>

              {/* Lado COROA - simples */}
              <div className="coin-side coin-back">
                <div className="coin-inner">
                  <div className="coin-text">COROA</div>
                </div>
              </div>

              {/* Borda da moeda */}
              <div className="coin-edge"></div>
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
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Mín. R$ 1,50"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={disabled || isFlipping}
              className="text-center text-lg font-semibold bg-brand-surface border-brand-gold/20 text-foreground placeholder:text-muted-foreground"
              min="1.5"
              step="0.01"
            />
            <div className="text-center text-sm text-muted-foreground">
              Ganho potencial: <span className="text-brand-gold font-semibold">
                R$ {(numericAmount * currentLevel.multiplier).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Betting Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Button
            size="lg"
            onClick={() => handleBet('cara')}
            disabled={disabled || isFlipping || numericAmount > balance || numericAmount < 1.5}
            className="h-14 sm:h-16 md:h-20 text-lg sm:text-xl font-bold bg-brand-orange text-white hover:bg-brand-orange-muted transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            CARA
          </Button>
          <Button
            size="lg"
            onClick={() => handleBet('coroa')}
            disabled={disabled || isFlipping || numericAmount > balance || numericAmount < 1.5}
            className="h-14 sm:h-16 md:h-20 text-lg sm:text-xl font-bold bg-brand-gold text-brand-bg hover:bg-brand-gold-muted transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            COROA
          </Button>
        </div>

        {/* Game Info */}
        <Card className="p-4 bg-brand-surface border-brand-gold/20">
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Nível {currentLevel.name}: <span className="text-brand-gold font-semibold">{currentLevel.multiplier}x</span></p>
            <p>Saldo atual: <span className="text-brand-gold font-semibold">R$ {balance.toFixed(2)}</span></p>
          </div>
        </Card>
      </div>
    </>
  );
}