import { CoinProcessor } from "@/components/CoinProcessor";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Processador de Moedas</h1>
        <p className="text-xl text-muted-foreground mb-8">Clique no botão para remover o fundo das moedas</p>
        <CoinProcessor />
      </div>
    </div>
  );
};

export default Index;
