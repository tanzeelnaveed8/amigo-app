import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Radio } from 'lucide-react';

interface SignalQrCodeProps {
  value: string;
  size?: number;
  id?: string;
  showTitle?: boolean;
  themeColor: string;
  isDarkMode: boolean;
}

export const SignalQrCode = ({ 
  value, 
  size = 256, 
  id, 
  showTitle = true,
  themeColor,
  isDarkMode
}: SignalQrCodeProps) => {
  return (
    <div className="flex flex-col items-center">
      {showTitle && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: themeColor }}
          className="text-[13px] font-bold mb-6 tracking-widest"
        >
          SCAN TO SUBSCRIBE TO SIGNAL
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
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-[32px] blur-3xl"
          style={{ 
            background: `linear-gradient(135deg, ${themeColor}AA, ${themeColor}66)`,
            transform: 'scale(1.15)' 
          }}
        />

        {/* QR Container Card */}
        <div 
          className={`relative rounded-[32px] p-6 border-2 shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#1A1A2E] to-[#141422]' 
              : 'bg-white'
          }`}
          style={{
            borderColor: `${themeColor}33`,
            boxShadow: isDarkMode 
              ? `0 0 80px ${themeColor}22, 0 20px 60px rgba(0,0,0,0.5)` 
              : `0 0 80px ${themeColor}11, 0 20px 60px rgba(0,0,0,0.1)`
          }}
        >
          {/* Inner gradient glow */}
          <div 
            className="absolute inset-0 opacity-[0.15] pointer-events-none rounded-[32px]"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, transparent)`
            }}
          />
          
          {/* QR Code wrapper with background */}
          <div 
            className={`relative rounded-[24px] p-5 overflow-hidden ${
              isDarkMode ? 'bg-[#0A0A14]' : 'bg-gray-50'
            }`}
          >
            {/* Subtle inner glow */}
            <div 
              className="absolute inset-0 opacity-[0.08] rounded-[24px]"
              style={{
                background: `linear-gradient(135deg, ${themeColor}, transparent)`
              }}
            />
            
            <div className="relative flex justify-center items-center">
              <QRCodeSVG
                id={id || 'signal-qr-code'}
                value={value}
                size={size}
                level="H"
                includeMargin={true}
                fgColor={themeColor}
                bgColor="transparent"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              
              {/* Center Radio/Signal Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Pulsing glow behind icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ backgroundColor: themeColor }}
                  />
                  
                  {/* Icon container */}
                  <div 
                    className={`relative rounded-full p-3.5 border-[3px] shadow-2xl ${
                      isDarkMode ? 'bg-[#0A0A14]' : 'bg-white'
                    }`}
                    style={{ 
                      borderColor: themeColor,
                      boxShadow: `0 0 20px ${themeColor}66`
                    }}
                  >
                    <Radio 
                      size={size * 0.13} 
                      style={{ color: themeColor }}
                      strokeWidth={2.5} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          {[
            'top-3 left-3 border-t-[2.5px] border-l-[2.5px] rounded-tl-3xl',
            'top-3 right-3 border-t-[2.5px] border-r-[2.5px] rounded-tr-3xl',
            'bottom-3 left-3 border-b-[2.5px] border-l-[2.5px] rounded-bl-3xl',
            'bottom-3 right-3 border-b-[2.5px] border-r-[2.5px] rounded-br-3xl'
          ].map((className, i) => (
            <div 
              key={i} 
              className={`absolute w-9 h-9 ${className}`}
              style={{ borderColor: `${themeColor}66` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};