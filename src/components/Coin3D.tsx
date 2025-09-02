import React, { useState } from 'react';
import coinCaraImage from '../assets/coin-cara-cartoon.png';
import coinCoroaImage from '../assets/coin-coroa-cartoon.png';

interface Coin3DProps {
  result?: 'cara' | 'coroa' | null;
  isFlipping?: boolean;
  onFlipComplete?: (result: 'cara' | 'coroa') => void;
}

export const Coin3D: React.FC<Coin3DProps> = ({ 
  result = null, 
  isFlipping = false,
  onFlipComplete 
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  const flipCoin = (targetResult: 'cara' | 'coroa') => {
    setAnimationKey(prev => prev + 1);
    
    // Simular o tempo da animação
    setTimeout(() => {
      onFlipComplete?.(targetResult);
    }, 3000);
  };

  return (
    <div className="coin-container">
      <div 
        className={`coin-3d ${isFlipping ? 'flipping' : ''} ${result === 'coroa' ? 'show-coroa' : 'show-cara'}`}
        key={animationKey}
        style={{
          animation: isFlipping ? 'coinFlip 3s ease-out forwards' : 'none'
        }}
      >
        {/* Lado CARA */}
        <div className="coin-side coin-front">
          <img 
            src={coinCaraImage} 
            alt="Cara da moeda" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Lado COROA */}
        <div className="coin-side coin-back">
          <img 
            src={coinCoroaImage} 
            alt="Coroa da moeda" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Borda da moeda */}
        <div className="coin-edge">
          <div className="edge-line"></div>
          <div className="edge-line"></div>
          <div className="edge-line"></div>
          <div className="edge-line"></div>
          <div className="edge-line"></div>
        </div>
      </div>

      {/* Sombra da moeda */}
      <div className={`coin-shadow ${isFlipping ? 'shadow-animation' : ''}`}></div>
    </div>
  );
};