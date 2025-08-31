import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface WithdrawNotification {
  id: string;
  name: string;
  amount: string;
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

export function WithdrawNotifications() {
  const [notifications, setNotifications] = useState<WithdrawNotification[]>([]);
  const [usedCombinations, setUsedCombinations] = useState<Set<string>>(new Set());

  const generateRandomAmount = () => {
    const min = 15;
    const max = 2500;
    const amount = Math.random() * (max - min) + min;
    return amount.toFixed(2);
  };

  const generateNotification = (): WithdrawNotification | null => {
    const availableNames = names.filter(name => {
      return sides.some(side => !usedCombinations.has(`${name}-${side}`));
    });

    if (availableNames.length === 0) {
      return null; // All combinations used
    }

    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    const availableSides = sides.filter(side => !usedCombinations.has(`${randomName}-${side}`));
    const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
    
    const combination = `${randomName}-${randomSide}`;
    
    return {
      id: Date.now().toString(),
      name: randomName,
      amount: generateRandomAmount(),
      side: randomSide,
      timestamp: Date.now()
    };
  };

  useEffect(() => {
    const showNotification = () => {
      const newNotification = generateNotification();
      if (!newNotification) return;

      const combination = `${newNotification.name}-${newNotification.side}`;
      setUsedCombinations(prev => new Set([...prev, combination]));

      setNotifications(prev => {
        const updated = [newNotification, ...prev.slice(0, 4)];
        return updated;
      });

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 3000);

    // Then show notifications every 8-15 seconds
    const interval = setInterval(() => {
      showNotification();
    }, Math.random() * 7000 + 8000); // Random between 8-15 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [usedCombinations]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 space-y-2 max-w-xs">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="p-3 bg-gradient-to-r from-green-500 to-green-600 border-green-400 shadow-lg animate-slide-in-left"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-xs truncate">
                {notification.name}
              </div>
              <div className="text-green-100 text-xs">
                Sacou R$ {notification.amount}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-white/20 text-white border-white/30 px-1 py-0"
                >
                  {notification.side.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}