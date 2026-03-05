import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Ghost } from 'lucide-react@0.487.0';

interface GhostQrCodeProps {
  value: string;
  size?: number;
  id?: string;
  showTitle?: boolean;
}

export const GhostQrCode = ({ value, size = 256, id, showTitle = true }: GhostQrCodeProps) => {
  return (
    <div className="flex flex-col items-center">
      {showTitle && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#9B7BFF] text-sm font-semibold mb-4 tracking-wide"
        >
          SCAN TO JOIN THE CROWD
        </motion.p>
      )}
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative"
      >
        {/* Outer glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-br from-[#9B7BFF] to-[#7B5CFF] rounded-[32px] blur-2xl"
          style={{ transform: 'scale(1.1)' }}
        />

        {/* QR Container Card */}
        <div className="relative bg-gradient-to-br from-[#1A1A2E] to-[#141422] rounded-[32px] p-6 border border-[rgba(155,123,255,0.3)] shadow-[0_0_60px_rgba(155,123,255,0.2)]">
          {/* Inner gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9B7BFF]/10 to-transparent rounded-[32px] pointer-events-none" />
          
          {/* QR Code wrapper with dark background */}
          <div className="relative bg-[#0A0A14] rounded-[24px] p-4 overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#9B7BFF]/5 to-transparent rounded-[24px]" />
            
            <div className="relative">
              <QRCodeSVG
                id={id || 'crowd-qr-code'}
                value={value}
                size={size}
                level="L"
                includeMargin={true}
                fgColor="#9B7BFF" // Purple foreground
                bgColor="transparent" // Transparent background (inherits dark bg)
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              
              {/* Center Ghost Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                {/* Ghost icon background */}
                <div className="relative">
                  {/* Pulsing glow behind icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-[#9B7BFF] rounded-full blur-lg"
                  />
                  
                  {/* Icon container */}
                  <div className="relative bg-[#0A0A14] rounded-full p-3 border-2 border-[#9B7BFF] shadow-lg">
                    <Ghost size={size * 0.12} className="text-[#9B7BFF]" strokeWidth={2.5} fill="#9B7BFF" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Corner decorations - top left */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#9B7BFF]/40 rounded-tl-3xl" />
          {/* Corner decorations - top right */}
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#9B7BFF]/40 rounded-tr-3xl" />
          {/* Corner decorations - bottom left */}
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#9B7BFF]/40 rounded-bl-3xl" />
          {/* Corner decorations - bottom right */}
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#9B7BFF]/40 rounded-br-3xl" />
        </div>
      </motion.div>
    </div>
  );
};