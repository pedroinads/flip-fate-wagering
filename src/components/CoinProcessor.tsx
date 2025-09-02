import React, { useState } from 'react';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';
import { Button } from '@/components/ui/button';

export const CoinProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCoinImages = async () => {
    setIsProcessing(true);
    try {
      console.log('Iniciando processamento das moedas...');
      
      // Processar moeda CARA
      const caraResponse = await fetch('/src/assets/coin-3d-cara.png');
      const caraBlob = await caraResponse.blob();
      const caraImageElement = await loadImage(caraBlob);
      const processedCaraBlob = await removeBackground(caraImageElement);
      
      // Baixar moeda CARA processada
      const caraUrl = URL.createObjectURL(processedCaraBlob);
      const caraLink = document.createElement('a');
      caraLink.href = caraUrl;
      caraLink.download = 'coin-cara-no-bg.png';
      document.body.appendChild(caraLink);
      caraLink.click();
      document.body.removeChild(caraLink);
      URL.revokeObjectURL(caraUrl);
      
      // Processar moeda COROA
      const coroaResponse = await fetch('/src/assets/coin-3d-coroa.png');
      const coroaBlob = await coroaResponse.blob();
      const coroaImageElement = await loadImage(coroaBlob);
      const processedCoroaBlob = await removeBackground(coroaImageElement);
      
      // Baixar moeda COROA processada
      const coroaUrl = URL.createObjectURL(processedCoroaBlob);
      const coroaLink = document.createElement('a');
      coroaLink.href = coroaUrl;
      coroaLink.download = 'coin-coroa-no-bg.png';
      document.body.appendChild(coroaLink);
      coroaLink.click();
      document.body.removeChild(coroaLink);
      URL.revokeObjectURL(coroaUrl);
      
      console.log('Fundo removido com sucesso das duas moedas!');
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 text-center">
      <Button 
        onClick={processCoinImages}
        disabled={isProcessing}
        className="mb-4"
      >
        {isProcessing ? 'Processando...' : 'Remover Fundo das Moedas'}
      </Button>
      {isProcessing && (
        <div className="text-center">
          <p>Removendo fundo das moedas...</p>
        </div>
      )}
    </div>
  );
};