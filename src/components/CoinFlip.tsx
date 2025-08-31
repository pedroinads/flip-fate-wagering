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
    if (numericAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor de aposta válido.",
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
            className: "bg-casino-win",
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
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4">
      {/* Coin Display */}
      <div className="flex justify-center items-center space-x-4">
        <div className="hidden sm:flex items-center">
          <div className="text-right text-casino-gold">
            <div className="text-3xl font-bold">{currentLevel.multiplier}x</div>
          </div>
        </div>
        
        <div className="relative">
          <img
            src={isFlipping ? coinCaraImg : (lastResult === 'cara' ? coinCaraImg : coinCoroaImg)}
            alt={isFlipping ? "Girando..." : (lastResult || "Moeda")}
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-casino-gold shadow-casino transition-all duration-500 ${
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
                lastWon ? 'bg-casino-win' : 'bg-casino-lose'
              }`}
            >
              {lastWon ? 'GANHOU!' : 'PERDEU'}
            </Badge>
          )}
        </div>

        <div className="hidden sm:flex items-center">
          <div className="text-left text-casino-gold">
            <div className="text-3xl font-bold">{currentLevel.multiplier}x</div>
          </div>
        </div>
      </div>

      {/* Mobile Multiplier Display */}
      <div className="sm:hidden text-center">
        <div className="text-2xl font-bold text-casino-gold">{currentLevel.multiplier}x</div>
      </div>

      {/* Bet Level Selection */}
      <Card className="p-4 sm:p-6 bg-gradient-card border-casino-gold/20">
        <h3 className="text-lg font-semibold mb-4 text-center text-casino-gold">
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
                selectedLevel === level.level ? "bg-casino-gold text-casino-bg hover:bg-casino-gold-muted" : ""
              }`}
            >
              <div className="font-bold">{level.name}</div>
              <div className="text-xs opacity-80">{level.multiplier}x</div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Bet Amount Input */}
      <Card className="p-4 sm:p-6 bg-gradient-card border-casino-gold/20">
        <h3 className="text-lg font-semibold mb-4 text-center text-casino-gold">
          Valor da Aposta
        </h3>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Digite o valor (R$)"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={disabled || isFlipping}
            className="text-center text-lg font-semibold bg-casino-surface border-casino-gold/20 text-casino-gold"
            min="0.01"
            step="0.01"
          />
          <div className="text-center text-sm text-muted-foreground">
            Ganho potencial: <span className="text-casino-gold font-semibold">
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
          disabled={disabled || isFlipping || numericAmount > balance || numericAmount <= 0}
          className="h-16 sm:h-20 text-lg sm:text-xl font-bold bg-casino-gold text-casino-bg hover:bg-casino-gold-muted transition-all duration-300 hover:shadow-casino-gold/30 hover:shadow-lg active:scale-95"
        >
          CARA
        </Button>
        <Button
          size="lg"
          onClick={() => handleBet('coroa')}
          disabled={disabled || isFlipping || numericAmount > balance || numericAmount <= 0}
          className="h-16 sm:h-20 text-lg sm:text-xl font-bold bg-casino-gold text-casino-bg hover:bg-casino-gold-muted transition-all duration-300 hover:shadow-casino-gold/30 hover:shadow-lg active:scale-95"
        >
          COROA
        </Button>
      </div>

      {/* Game Info */}
      <Card className="p-4 bg-casino-surface border-casino-gold/20">
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Nível {currentLevel.name}: <span className="text-casino-gold font-semibold">{currentLevel.multiplier}x</span></p>
          <p>Saldo atual: <span className="text-casino-gold font-semibold">R$ {balance.toFixed(2)}</span></p>
        </div>
      </Card>
    </div>
  );
}