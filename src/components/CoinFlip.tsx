import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import coinCaraImg from '@/assets/coin-cara-text.jpg';
import coinCoroaImg from '@/assets/coin-coroa-text.jpg';

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
    playSound('coin-flip');
    
    try {
      const result = await onBet(choice, numericAmount, selectedLevel);
      
      // Animate coin flip
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
      }, 2000);
      
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
      {/* Full Screen Coin Animation Overlay */}
      {isFlipping && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          {/* Background floating coins */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <img
                key={i}
                src={i % 2 === 0 ? coinCaraImg : coinCoroaImg}
                alt="Background coin"
                className="absolute w-16 h-16 rounded-full opacity-20 animate-[coin-flip_3s_ease-in-out_infinite]"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${10 + (i * 8)}%`,
                  animationDelay: `${i * 0.3}s`,
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </div>
          
          {/* Main large coin */}
          <div className="relative z-10">
            <img
              src={coinCaraImg}
              alt="Girando moeda..."
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 border-brand-gold shadow-2xl animate-[coin-flip_2s_ease-out_infinite]"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.8))',
                animation: 'coin-flip 2s ease-out infinite, pulse-gold 1.5s ease-in-out infinite alternate'
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-gold/20 to-transparent animate-pulse"></div>
          </div>
          
          {/* Status text */}
          <div className="absolute bottom-20 text-center text-brand-gold">
            <div className="text-2xl font-bold animate-pulse">GIRANDO A MOEDA...</div>
            <div className="text-lg opacity-80 mt-2">Aguarde o resultado</div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4">
        {/* Coin Display */}
        <div className="flex justify-center items-center space-x-4">
        <div className="hidden sm:flex items-center">
          <div className="text-right text-brand-gold">
            <div className="text-3xl font-bold">{currentLevel.multiplier}x</div>
          </div>
        </div>
        
        <div className="relative">
          <img
            src={isFlipping ? coinCaraImg : (lastResult === 'cara' ? coinCaraImg : coinCoroaImg)}
            alt={isFlipping ? "Girando..." : (lastResult || "Moeda")}
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-brand-gold shadow-brand transition-all duration-500 ${
              isFlipping ? 'animate-coin-flip transform-gpu will-change-transform' : 'hover:scale-105'
            }`}
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
              transform: isFlipping ? 'rotateY(1080deg) rotateX(720deg)' : 'rotateY(0deg) rotateX(0deg)',
              transition: isFlipping ? 'transform 2s ease-out' : 'transform 0.3s ease-out'
            }}
          />
          {lastWon !== null && (
            <Badge 
              className={`absolute -top-2 -right-2 ${
                lastWon ? 'bg-brand-green' : 'bg-destructive'
              }`}
            >
              {lastWon ? 'GANHOU!' : 'PERDEU'}
            </Badge>
          )}
        </div>

        <div className="hidden sm:flex items-center">
          <div className="text-left text-brand-gold">
            <div className="text-3xl font-bold">{currentLevel.multiplier}x</div>
          </div>
        </div>
      </div>

      {/* Mobile Multiplier Display */}
      <div className="sm:hidden text-center">
        <div className="text-2xl font-bold text-brand-gold">{currentLevel.multiplier}x</div>
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
              className={`p-4 h-auto flex flex-col text-sm sm:text-base ${
                selectedLevel === level.level ? "bg-brand-gold text-brand-bg hover:bg-brand-gold-muted" : ""
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
            className="text-center text-lg font-semibold bg-brand-surface border-brand-gold/20 text-brand-gold"
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
          className="h-16 sm:h-20 text-lg sm:text-xl font-bold bg-brand-orange text-white hover:bg-brand-orange-muted transition-all duration-300 hover:shadow-orange/30 hover:shadow-lg active:scale-95"
        >
          CARA
        </Button>
        <Button
          size="lg"
          onClick={() => handleBet('coroa')}
          disabled={disabled || isFlipping || numericAmount > balance || numericAmount < 1.5}
          className="h-16 sm:h-20 text-lg sm:text-xl font-bold bg-brand-gold text-brand-bg hover:bg-brand-gold-muted transition-all duration-300 hover:shadow-gold/30 hover:shadow-lg active:scale-95"
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