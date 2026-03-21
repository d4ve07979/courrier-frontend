import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500);
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-green-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo container */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {/* Animated letters */}
            {'INSEED'.split('').map((letter, index) => (
              <span
                key={index}
                className={`text-6xl md:text-8xl font-bold text-green-600 transition-all duration-700 transform ${
                  animationPhase >= 1
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-8 opacity-0 scale-75'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  textShadow: '0 4px 8px rgba(34, 197, 94, 0.3)'
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div className={`transition-all duration-1000 transform ${
          animationPhase >= 2
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0'
        }`}>
          <p className="text-xl md:text-2xl text-gray-600 font-medium mb-8">
            Système de Gestion de Courrier
          </p>
        </div>

        {/* Loading animation */}
        <div className={`transition-all duration-1000 transform ${
          animationPhase >= 3
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Chargement en cours...</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className={`w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ${
          animationPhase >= 2 ? 'scale-x-100' : 'scale-x-0'
        }`}></div>
      </div>
    </div>
  );
};