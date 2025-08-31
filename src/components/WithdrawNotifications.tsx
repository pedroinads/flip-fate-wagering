import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface PlayerWin {
  id: string;
  name: string;
  amount: number;
  multiplier: string;
  level: number;
  side: 'cara' | 'coroa';
  timestamp: number;
}

const names = [
  'Gabriel', 'Lucas', 'Rafael', 'Felipe', 'Bruno', 'Diego', 'Carlos', 'João', 'Pedro', 'André',
  'Ricardo', 'Rodrigo', 'Eduardo', 'Fernando', 'Gustavo', 'Henrique', 'Igor', 'Julio', 'Leandro', 'Marcelo',
  'Marina', 'Carla', 'Ana', 'Julia', 'Bianca', 'Camila', 'Daniela', 'Fernanda', 'Gabriela', 'Helena',
  'Isabela', 'Jessica', 'Larissa', 'Mariana', 'Natalia', 'Paula', 'Renata', 'Sofia', 'Tatiana', 'Vanessa'
];

const sides = ['cara', 'coroa'] as const;
const levels = [
  { level: 1, multiplier: '1.9x', name: 'Fácil' },
  { level: 2, multiplier: '4.9x', name: 'Médio' },
  { level: 3, multiplier: '9.9x', name: 'Difícil' }
];

export function PlayersHistory() {
  const [playerWins, setPlayerWins] = useState<PlayerWin[]>([]);
  const [usedCombinations, setUsedCombinations] = useState<Set<string>>(new Set());

  const generateRandomAmount = (level: number) => {
    const baseMin = level === 1 ? 15 : level === 2 ? 50 : 100;
    const baseMax = level === 1 ? 300 : level === 2 ? 800 : 2500;
    const amount = Math.random() * (baseMax - baseMin) + baseMin;
    return Math.round(amount * 100) / 100;
  };

  const generatePlayerWin = (): PlayerWin | null => {
    const availableNames = names.filter(name => {
      return sides.some(side => 
        levels.some(level => !usedCombinations.has(`${name}-${side}-${level.level}`))
      );
    });

    if (availableNames.length === 0) {
      return null; // All combinations used
    }

    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const availableSides = sides.filter(side => 
      !usedCombinations.has(`${randomName}-${side}-${randomLevel.level}`)
    );
    
    if (availableSides.length === 0) return null;
    
    const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
    const combination = `${randomName}-${randomSide}-${randomLevel.level}`;
    
    return {
      id: Date.now().toString(),
      name: randomName,
      amount: generateRandomAmount(randomLevel.level),
      multiplier: randomLevel.multiplier,
      level: randomLevel.level,
      side: randomSide,
      timestamp: Date.now()
    };
  };

  useEffect(() => {
    const addPlayerWin = () => {
      const newWin = generatePlayerWin();
      if (!newWin) return;

      const combination = `${newWin.name}-${newWin.side}-${newWin.level}`;
      setUsedCombinations(prev => new Set([...prev, combination]));

      setPlayerWins(prev => {
        const updated = [newWin, ...prev.slice(0, 9)]; // Keep only 10 most recent
        return updated;
      });
    };

    // Add initial wins
    setTimeout(() => addPlayerWin(), 1000);
    setTimeout(() => addPlayerWin(), 2000);
    setTimeout(() => addPlayerWin(), 3000);

    // Then add new wins every 12-20 seconds
    const interval = setInterval(() => {
      addPlayerWin();
    }, Math.random() * 8000 + 12000);

    return () => clearInterval(interval);
  }, [usedCombinations]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card border-casino-gold/20">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-5 h-5 text-casino-gold" />
        <h3 className="text-lg font-semibold text-casino-gold">
          Últimas Vitórias
        </h3>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {playerWins.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Carregando histórico...
          </div>
        ) : (
          playerWins.map((win) => (
            <div
              key={win.id}
              className="flex items-center justify-between p-3 bg-casino-surface/50 rounded-lg border border-casino-gold/10 hover:border-casino-gold/20 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-casino-gold text-sm">
                    {win.name}
                  </span>
                  <Badge 
                    className={`text-xs text-white ${getLevelColor(win.level)}`}
                  >
                    Nível {win.level}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {win.side.toUpperCase()} • {win.multiplier}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-casino-gold text-sm">
                  R$ {win.amount.toFixed(2)}
                </div>
                <div className="text-xs text-green-400">
                  +{win.multiplier}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}