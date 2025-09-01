import logoImg from '/lovable-uploads/1ed01d0e-1e14-464a-9350-e15ffbfde223.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-16 sm:h-16'
  };

  return (
    <img 
      src={logoImg} 
      alt="Cara ou Coroa" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}