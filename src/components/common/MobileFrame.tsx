import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  roleBadge?: {
    text: string;
    color: string;
  };
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  roleBadge,
}) => {
  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[820px] max-h-[92vh] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-stone-800 flex flex-col overflow-hidden select-none">
      {/* Dynamic Island Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-900 rounded-full z-50 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-stone-800 mr-2"></div>
        <div className="w-8 h-1 bg-stone-800 rounded-full"></div>
      </div>

      {/* iOS Status Bar */}
      <div className="h-10 pt-2 px-6 flex justify-between items-center text-xs font-semibold text-stone-800 z-40 bg-white border-b border-stone-100 shrink-0">
        <span className="font-bold text-[11px]">9:41</span>
        {roleBadge && (
          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${roleBadge.color}`}>
            {roleBadge.text}
          </span>
        )}
        <div className="flex items-center gap-1.5 opacity-80 text-stone-700">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Content Body with exact soft off-white background from wireframe */}
      <div className="flex-1 overflow-y-auto relative flex flex-col bg-[#F8FAF9] text-stone-900">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="h-4 bg-white flex justify-center items-center shrink-0 border-t border-stone-100">
        <div className="w-28 h-1 bg-stone-300 rounded-full"></div>
      </div>
    </div>
  );
};

