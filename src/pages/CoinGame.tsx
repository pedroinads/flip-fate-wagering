import React, { useState } from 'react';
import { Coin3D } from '@/components/Coin3D';
import { Button } from '@/components/ui/button';

export const CoinGame: React.FC = () => {
  const [result, setResult] = useState<'cara' | 'coroa' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipCoin = (choice: 'cara' | 'coroa') => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setResult(null);
    
    // Simular resultado aleatório
    const randomResult = Math.random() < 0.5 ? 'cara' : 'coroa';
    
    // Esperar animação completar
    setTimeout(() => {
      setResult(randomResult);
      setIsFlipping(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="text-center text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Jogo de Cara ou Coroa</h1>
        <p className="text-xl opacity-80">Escolha seu lado e teste sua sorte!</p>
      </div>

      {/* Moeda 3D */}
      <div className="mb-8">
        <Coin3D 
          result={result} 
          isFlipping={isFlipping}
        />
      </div>

      {/* Resultado */}
      {result && !isFlipping && (
        <div className="text-center text-white mb-6">
          <div className="text-2xl font-bold">
            Resultado: <span className="text-yellow-400">{result.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-4">
        <Button
          onClick={() => flipCoin('cara')}
          disabled={isFlipping}
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 text-lg"
        >
          {isFlipping ? 'Girando...' : 'CARA'}
        </Button>
        
        <Button
          onClick={() => flipCoin('coroa')}
          disabled={isFlipping}
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 text-lg"
        >
          {isFlipping ? 'Girando...' : 'COROA'}
        </Button>
      </div>

      {/* Instruções */}
      <div className="text-center text-white/60 mt-8 max-w-md">
        <p className="text-sm">
          Clique em CARA ou COROA para lançar a moeda. 
          A animação 3D mostrará o resultado após 3 segundos.
        </p>
      </div>
    </div>
  );
};