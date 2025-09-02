import React, { useState } from 'react';

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
          <div className="coin-inner">
            <div className="coin-text">CARA</div>
            <div className="coin-decoration">
              <div className="coin-ring"></div>
              <div className="coin-dots">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado COROA */}
        <div className="coin-side coin-back">
          <div className="coin-inner">
            <div className="coin-text">COROA</div>
            <div className="coin-decoration">
              <div className="coin-ring"></div>
              <div className="coin-crown">♔</div>
            </div>
          </div>
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