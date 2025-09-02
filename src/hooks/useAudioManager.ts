import { useState, useEffect, useRef } from 'react';

interface AudioManager {
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playCoinSound: () => void;
  playWinSound: () => void;
  playLoseSound: () => void;
}

export const useAudioManager = (): AudioManager => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar áudios
    backgroundMusicRef.current = new Audio('/sounds/casino-background.mp3');
    coinSoundRef.current = new Audio('/sounds/coin-flip.mp3');
    winSoundRef.current = new Audio('/sounds/win.mp3');
    loseSoundRef.current = new Audio('/sounds/lose.mp3');

    // Configurar música de fundo para loop
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.3;
    }

    // Configurar volumes dos efeitos
    if (coinSoundRef.current) coinSoundRef.current.volume = 0.5;
    if (winSoundRef.current) winSoundRef.current.volume = 0.6;
    if (loseSoundRef.current) loseSoundRef.current.volume = 0.6;

    return () => {
      // Cleanup
      backgroundMusicRef.current?.pause();
      coinSoundRef.current?.pause();
      winSoundRef.current?.pause();
      loseSoundRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    // Controlar mute
    const audios = [
      backgroundMusicRef.current,
      coinSoundRef.current,
      winSoundRef.current,
      loseSoundRef.current
    ];

    audios.forEach(audio => {
      if (audio) {
        audio.muted = isMuted;
      }
    });
  }, [isMuted]);

  const playBackgroundMusic = () => {
    if (backgroundMusicRef.current && !isMuted) {
      backgroundMusicRef.current.play().catch(() => {
        // Falha silenciosa se não conseguir tocar
      });
      setIsPlaying(true);
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const playCoinSound = () => {
    if (coinSoundRef.current && !isMuted) {
      coinSoundRef.current.currentTime = 0;
      coinSoundRef.current.play().catch(() => {
        // Falha silenciosa
      });
    }
  };

  const playWinSound = () => {
    if (winSoundRef.current && !isMuted) {
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play().catch(() => {
        // Falha silenciosa
      });
    }
  };

  const playLoseSound = () => {
    if (loseSoundRef.current && !isMuted) {
      loseSoundRef.current.currentTime = 0;
      loseSoundRef.current.play().catch(() => {
        // Falha silenciosa
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Se estava desmutado e vai mutar, parar música
      stopBackgroundMusic();
    }
  };

  return {
    isPlaying,
    isMuted,
    toggleMute,
    playBackgroundMusic,
    stopBackgroundMusic,
    playCoinSound,
    playWinSound,
    playLoseSound
  };
};