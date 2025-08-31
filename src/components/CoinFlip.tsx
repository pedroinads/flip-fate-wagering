import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import coinCaraImg from '@/assets/coin-cara-3d.jpg';
import coinCoroaImg from '@/assets/coin-coroa-3d.jpg';

interface CoinFlipProps {
  onBet: (choice: 'cara' | 'coroa', amount: number) => Promise<{ won: boolean; result: 'cara' | 'coroa'; payout: number }>;
  balance: number;
  disabled?: boolean;
}

const betAmounts = [1, 2, 5, 10];

export function CoinFlip({ onBet, balance, disabled }: CoinFlipProps) {
  const [selectedAmount, setSelectedAmount] = useState(1);
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

  const handleBet = async (choice: 'cara' | 'coroa') => {
    if (selectedAmount > balance) {
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
      const result = await onBet(choice, selectedAmount);
      
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
      <div className="flex justify-center">
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
      </div>

      {/* Bet Amount Selection */}
      <Card className="p-4 sm:p-6 bg-gradient-card border-casino-gold/20">
        <h3 className="text-lg font-semibold mb-4 text-center text-casino-gold">
          Valor da Aposta
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {betAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              onClick={() => setSelectedAmount(amount)}
              disabled={disabled || isFlipping || amount > balance}
              className={`text-sm sm:text-base ${selectedAmount === amount ? "bg-casino-gold text-casino-bg hover:bg-casino-gold-muted" : ""}`}
            >
              R$ {amount}
            </Button>
          ))}
        </div>
      </Card>

      {/* Betting Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Button
          size="lg"
          onClick={() => handleBet('cara')}
          disabled={disabled || isFlipping || selectedAmount > balance}
          className="h-16 sm:h-20 text-lg sm:text-xl font-bold bg-casino-gold text-casino-bg hover:bg-casino-gold-muted transition-all duration-300 hover:shadow-casino-gold/30 hover:shadow-lg active:scale-95"
        >
          CARA
        </Button>
        <Button
          size="lg"
          onClick={() => handleBet('coroa')}
          disabled={disabled || isFlipping || selectedAmount > balance}
          className="h-16 sm:h-20 text-lg sm:text-xl font-bold bg-casino-gold text-casino-bg hover:bg-casino-gold-muted transition-all duration-300 hover:shadow-casino-gold/30 hover:shadow-lg active:scale-95"
        >
          COROA
        </Button>
      </div>

      {/* Game Info */}
      <Card className="p-4 bg-casino-surface border-casino-gold/20">
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Vitória paga <span className="text-casino-gold font-semibold">1.9x</span> o valor apostado</p>
          <p>Saldo atual: <span className="text-casino-gold font-semibold">R$ {balance.toFixed(2)}</span></p>
        </div>
      </Card>
    </div>
  );
}