import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Download, Share2, Radio, QrCode, MessageSquare, Users, ChevronRight, Info, Shield, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import { SignalQrCode } from '../components/ui/signal-qr-code';
import QRCodeLib from 'qrcode';

interface SignalQrScreenProps {
  signalName: string;
  signalId: string;
  subscriberCount: number;
  onBack: () => void;
  isDarkMode: boolean;
  themeColor: string;
  themeMode: 'day' | 'night' | 'ghost';
}

type ShareMode = 'choice' | 'qr' | 'contacts';

export const SignalQrScreen = ({ 
  signalName, 
  signalId, 
  subscriberCount,
  onBack, 
  isDarkMode, 
  themeColor,
  themeMode 
}: SignalQrScreenProps) => {
  
  const [shareMode, setShareMode] = React.useState<ShareMode>('choice');

  // Mock username from signal name
  const signalUsername = `@${signalName.toLowerCase().replace(/\s+/g, '_')}`;
  const signalJoinCode = `amigo://signal/${signalId}`;

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    card: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200/60',
    cardHover: isDarkMode ? 'hover:bg-[#1A1A2E]' : 'hover:bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
  };

  const handleBack = () => {
    if (shareMode === 'choice') {
      onBack();
    } else {
      setShareMode('choice');
    }
  };

  // Choice Screen
  const renderChoiceScreen = () => (
    <motion.div
      key="choice"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide"
    >
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Signal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={cn(
            "rounded-[24px] p-6 border text-center",
            themeClasses.card
          )}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <Radio size={32} style={{ color: themeColor }} strokeWidth={2.5} />
          </div>
          <h2 className={cn("text-[22px] font-bold mb-2", themeClasses.text)}>
            {signalName}
          </h2>
          <p className={cn("text-[14px] mb-3", themeClasses.subtext)}>
            {subscriberCount.toLocaleString()} Subscribers
          </p>
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            <span>SIGNAL</span>
          </div>
        </motion.div>

        {/* Share Options Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h3 className={cn("text-[18px] font-bold mb-2", themeClasses.text)}>
            How would you like to share?
          </h3>
          <p className={cn("text-[14px]", themeClasses.subtext)}>
            Choose your preferred sharing method
          </p>
        </motion.div>

        {/* Share via QR Code */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          onClick={() => setShareMode('qr')}
          className={cn(
            "w-full rounded-[24px] p-6 border-2 transition-all text-left group",
            themeClasses.card,
            themeClasses.cardHover
          )}
          style={{
            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          }}
          whileHover={{ scale: 1.02, borderColor: themeColor }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <QrCode size={28} style={{ color: themeColor }} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className={cn("text-[17px] font-bold mb-1", themeClasses.text)}>
                Share via QR Code
              </h4>
              <p className={cn("text-[13px] leading-relaxed", themeClasses.subtext)}>
                Generate a scannable QR code to share anywhere
              </p>
            </div>
            <ChevronRight 
              size={24} 
              className={cn("transition-transform group-hover:translate-x-1", themeClasses.subtext)} 
            />
          </div>
        </motion.button>

        {/* Send to Amigo Contacts */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          onClick={() => setShareMode('contacts')}
          className={cn(
            "w-full rounded-[24px] p-6 border-2 transition-all text-left group",
            themeClasses.card,
            themeClasses.cardHover
          )}
          style={{
            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          }}
          whileHover={{ scale: 1.02, borderColor: themeColor }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <MessageSquare size={28} style={{ color: themeColor }} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className={cn("text-[17px] font-bold mb-1", themeClasses.text)}>
                Send to Amigo Contacts
              </h4>
              <p className={cn("text-[13px] leading-relaxed", themeClasses.subtext)}>
                Share directly with your contacts via DM
              </p>
            </div>
            <ChevronRight 
              size={24} 
              className={cn("transition-transform group-hover:translate-x-1", themeClasses.subtext)} 
            />
          </div>
        </motion.button>

      </div>
    </motion.div>
  );

  // QR Code Screen
  const renderQrScreen = () => (
    <motion.div
      key="qr"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide flex items-center justify-center"
    >
      <div className="max-w-md mx-auto w-full space-y-6 py-8">

        {/* QR Code Display - Centered and Focused */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center"
        >
          <SignalQrCode 
            id="signal-qr-code-svg"
            value={signalJoinCode}
            size={240}
            showTitle={true}
            themeColor={themeColor}
            isDarkMode={isDarkMode}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex gap-3 w-full"
        >
          <motion.button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Join ${signalName} on Amigo!`,
                  text: `Subscribe to my signal: ${signalUsername}`,
                  url: signalJoinCode
                }).catch(() => {});
              }
            }}
            className={cn(
              "flex-1 py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all border-2",
              isDarkMode 
                ? 'bg-[#2A2A3E] text-white hover:bg-[#32324A] border-white/10' 
                : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300 shadow-sm'
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Share2 size={19} />
            Share
          </motion.button>

          <motion.button
            onClick={async () => {
              try {
                const qrElement = document.getElementById('signal-qr-code-svg');
                if (!qrElement) return;

                // Radio icon SVG
                const radioIconSize = 32;
                const radioSvg = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="${radioIconSize}" height="${radioIconSize}" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="2"/>
                    <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
                    <path d="M19.07 19.07a10 10 0 0 0 0-14.14"/>
                    <path d="M7.76 16.24a6 6 0 0 1 0-8.49"/>
                    <path d="M16.24 16.24a6 6 0 0 0 0-8.49"/>
                  </svg>
                `;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const padding = 50;
                const qrSize = 320;
                const titleHeight = 160;
                const bottomPadding = 50;
                const canvasWidth = qrSize + (padding * 2) + 80;
                const canvasHeight = qrSize + titleHeight + padding + bottomPadding + 80;

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // Background with gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
                if (isDarkMode) {
                  gradient.addColorStop(0, '#0A0A14');
                  gradient.addColorStop(1, '#1A1A2E');
                } else {
                  gradient.addColorStop(0, '#F5F5F7');
                  gradient.addColorStop(1, '#FFFFFF');
                }
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                // Card Background
                const cardPadding = 24;
                const outerCardX = cardPadding;
                const outerCardY = cardPadding;
                const outerCardWidth = canvasWidth - (cardPadding * 2);
                const outerCardHeight = canvasHeight - (cardPadding * 2);
                const outerCardRadius = 32;

                ctx.shadowColor = `${themeColor}4D`; // 30% opacity
                ctx.shadowBlur = 40;
                
                const outerCardGradient = ctx.createLinearGradient(outerCardX, outerCardY, outerCardX + outerCardWidth, outerCardY + outerCardHeight);
                if (isDarkMode) {
                  outerCardGradient.addColorStop(0, '#1A1A2E');
                  outerCardGradient.addColorStop(1, '#141422');
                } else {
                  outerCardGradient.addColorStop(0, '#FFFFFF');
                  outerCardGradient.addColorStop(1, '#F8F9FA');
                }
                
                ctx.fillStyle = outerCardGradient;
                ctx.beginPath();
                ctx.roundRect(outerCardX, outerCardY, outerCardWidth, outerCardHeight, outerCardRadius);
                ctx.fill();
                
                ctx.strokeStyle = `${themeColor}4D`;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.shadowBlur = 0;

                // "AMIGO" Text
                ctx.font = 'bold 24px sans-serif';
                ctx.fillStyle = themeColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.shadowColor = `${themeColor}99`;
                ctx.shadowBlur = 10;
                ctx.fillText('AMIGO', canvasWidth / 2, outerCardY + 40);
                
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';

                // Signal Name with letter spacing
                ctx.font = 'bold 26px sans-serif';
                ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#111111';
                
                const nameText = signalName;
                const nameSpacing = 3;
                
                let nameWidth = 0;
                for (let i = 0; i < nameText.length; i++) {
                  nameWidth += ctx.measureText(nameText[i]).width;
                }
                nameWidth += nameSpacing * (nameText.length - 1);
                
                let nameX = (canvasWidth / 2) - (nameWidth / 2);
                const nameY = outerCardY + 85;
                
                ctx.textAlign = 'left';
                for (let i = 0; i < nameText.length; i++) {
                  const letter = nameText[i];
                  const letterWidth = ctx.measureText(letter).width;
                  ctx.fillText(letter, nameX, nameY);
                  nameX += letterWidth + nameSpacing;
                }

                // Subtitle: "SCAN TO SUBSCRIBE TO SIGNAL"
                ctx.font = 'bold 12px sans-serif';
                ctx.fillStyle = themeColor;
                
                const subtitleText = "SCAN TO SUBSCRIBE TO SIGNAL";
                const subtitleSpacing = 1.5;
                
                let subtitleWidth = 0;
                for (let i = 0; i < subtitleText.length; i++) {
                  subtitleWidth += ctx.measureText(subtitleText[i]).width;
                }
                subtitleWidth += subtitleSpacing * (subtitleText.length - 1);

                let subtitleX = (canvasWidth / 2) - (subtitleWidth / 2);
                const subtitleY = outerCardY + 120;

                for (let i = 0; i < subtitleText.length; i++) {
                  const letter = subtitleText[i];
                  const letterWidth = ctx.measureText(letter).width;
                  ctx.fillText(letter, subtitleX, subtitleY);
                  subtitleX += letterWidth + subtitleSpacing;
                }
                
                ctx.textAlign = 'center';

                // QR Code Image
                const svgData = new XMLSerializer().serializeToString(qrElement);
                const qrImg = new Image();
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const qrUrl = URL.createObjectURL(svgBlob);

                qrImg.onload = () => {
                  const qrContainerPadding = 32;
                  const qrContainerX = (canvasWidth - qrSize - qrContainerPadding * 2) / 2;
                  const qrContainerY = padding + titleHeight - qrContainerPadding;
                  const qrContainerSize = qrSize + qrContainerPadding * 2;
                  const qrContainerRadius = 24;
                  
                  ctx.fillStyle = isDarkMode ? '#0A0A14' : '#FFFFFF';
                  ctx.beginPath();
                  ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, qrContainerRadius);
                  ctx.fill();
                  
                  const qrContainerGradient = ctx.createLinearGradient(qrContainerX, qrContainerY, qrContainerX + qrContainerSize, qrContainerY + qrContainerSize);
                  qrContainerGradient.addColorStop(0, `${themeColor}0D`); // 5% opacity
                  qrContainerGradient.addColorStop(1, `${themeColor}00`);
                  ctx.fillStyle = qrContainerGradient;
                  ctx.beginPath();
                  ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, qrContainerRadius);
                  ctx.fill();
                  
                  const qrX = (canvasWidth - qrSize) / 2;
                  const qrY = padding + titleHeight;
                  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
                  
                  // Corner Decorations (L-shaped corners)
                  const cornerSize = 32;
                  const cornerOffset = 24;
                  const cornerBorderRadius = 48;
                  
                  ctx.strokeStyle = `${themeColor}66`; // 40% opacity
                  ctx.lineWidth = 4;
                  
                  // Top-left
                  ctx.beginPath();
                  ctx.moveTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset + cornerSize);
                  ctx.lineTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset + cornerBorderRadius);
                  ctx.arcTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset, qrContainerX + cornerOffset + cornerBorderRadius, qrContainerY + cornerOffset, cornerBorderRadius);
                  ctx.lineTo(qrContainerX + cornerOffset + cornerSize, qrContainerY + cornerOffset);
                  ctx.stroke();
                  
                  // Top-right
                  ctx.beginPath();
                  ctx.moveTo(qrContainerX + qrContainerSize - cornerOffset - cornerSize, qrContainerY + cornerOffset);
                  ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset - cornerBorderRadius, qrContainerY + cornerOffset);
                  ctx.arcTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset, qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset + cornerBorderRadius, cornerBorderRadius);
                  ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset + cornerSize);
                  ctx.stroke();
                  
                  // Bottom-left
                  ctx.beginPath();
                  ctx.moveTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerSize);
                  ctx.lineTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerBorderRadius);
                  ctx.arcTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset, qrContainerX + cornerOffset + cornerBorderRadius, qrContainerY + qrContainerSize - cornerOffset, cornerBorderRadius);
                  ctx.lineTo(qrContainerX + cornerOffset + cornerSize, qrContainerY + qrContainerSize - cornerOffset);
                  ctx.stroke();
                  
                  // Bottom-right
                  ctx.beginPath();
                  ctx.moveTo(qrContainerX + qrContainerSize - cornerOffset - cornerSize, qrContainerY + qrContainerSize - cornerOffset);
                  ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset - cornerBorderRadius, qrContainerY + qrContainerSize - cornerOffset);
                  ctx.arcTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset, qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerBorderRadius, cornerBorderRadius);
                  ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerSize);
                  ctx.stroke();

                  // Radio Icon Center
                  const centerX = canvasWidth / 2;
                  const centerY = qrY + qrSize / 2;
                  const iconContainerSize = radioIconSize + 12 + 4;

                  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, iconContainerSize * 1.5);
                  glowGradient.addColorStop(0, `${themeColor}80`);
                  glowGradient.addColorStop(1, `${themeColor}00`);
                  ctx.fillStyle = glowGradient;
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, iconContainerSize * 1.5, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.fillStyle = isDarkMode ? '#0A0A14' : '#FFFFFF';
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, iconContainerSize / 2, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.strokeStyle = themeColor;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, iconContainerSize / 2, 0, Math.PI * 2);
                  ctx.stroke();

                  const radioImg = new Image();
                  const radioBlob = new Blob([radioSvg], { type: 'image/svg+xml;charset=utf-8' });
                  const radioUrl = URL.createObjectURL(radioBlob);

                  radioImg.onload = () => {
                    ctx.drawImage(
                      radioImg,
                      centerX - radioIconSize / 2,
                      centerY - radioIconSize / 2,
                      radioIconSize,
                      radioIconSize
                    );

                    canvas.toBlob((blob) => {
                      if (blob) {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `amigo_signal_${signalName.replace(/\s+/g, '_')}_qr.png`;
                        link.click();
                        URL.revokeObjectURL(link.href);
                      }
                    });

                    URL.revokeObjectURL(radioUrl);
                  };

                  radioImg.src = radioUrl;
                  URL.revokeObjectURL(qrUrl);
                };

                qrImg.src = qrUrl;
              } catch (error) {
                console.error('Error saving QR code:', error);
              }
            }}
            className="flex-1 py-4 rounded-2xl font-semibold text-[15px] text-white flex items-center justify-center gap-2.5 transition-all"
            style={{ backgroundColor: themeColor }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={19} />
            Save
          </motion.button>
        </motion.div>

        {/* Info Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "rounded-[20px] p-5 border text-center",
            themeClasses.card
          )}
        >
          <p className={cn("text-[14px] leading-relaxed", themeClasses.subtext)}>
            Anyone can scan this code to instantly subscribe to <span className="font-bold" style={{ color: themeColor }}>{signalName}</span>
          </p>
        </motion.div>

      </div>
    </motion.div>
  );

  // Contacts Screen
  const renderContactsScreen = () => (
    <motion.div
      key="contacts"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide"
    >
      <div className="max-w-md mx-auto space-y-4">

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "rounded-[20px] p-4 border flex items-center gap-3",
            themeClasses.card
          )}
        >
          <Users size={20} className={themeClasses.subtext} />
          <input
            type="text"
            placeholder="Search contacts..."
            className={cn(
              "flex-1 bg-transparent outline-none text-[15px]",
              themeClasses.text,
              "placeholder:" + themeClasses.subtext
            )}
          />
        </motion.div>

        {/* Info Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-[20px] p-4 border",
            themeClasses.card
          )}
        >
          <p className={cn("text-[13px] text-center leading-relaxed", themeClasses.subtext)}>
            Select contacts to send <span className="font-bold" style={{ color: themeColor }}>{signalUsername}</span> directly via DM
          </p>
        </motion.div>

        {/* Mock Contact List */}
        {['Alex Morgan', 'Jamie Chen', 'Sam Taylor', 'Casey Jordan', 'Riley Parker'].map((name, index) => (
          <motion.button
            key={name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.05), type: "spring", stiffness: 200 }}
            className={cn(
              "w-full rounded-[20px] p-4 border transition-all text-left flex items-center gap-3 group",
              themeClasses.card,
              themeClasses.cardHover
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-[16px]"
              style={{ backgroundColor: themeColor }}
            >
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h4 className={cn("text-[16px] font-semibold", themeClasses.text)}>
                {name}
              </h4>
              <p className={cn("text-[13px]", themeClasses.subtext)}>
                @{name.toLowerCase().replace(' ', '_')}
              </p>
            </div>
            <ChevronRight size={20} className={cn("transition-transform group-hover:translate-x-1", themeClasses.subtext)} />
          </motion.button>
        ))}

      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col h-screen w-full overflow-hidden relative transition-colors duration-300",
        themeClasses.bg
      )}
    >
      {/* Header */}
      <motion.div 
        className="flex-none px-5 pt-4 pb-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.button 
            onClick={handleBack}
            className={cn(
              "p-2.5 -ml-2 rounded-xl transition-all duration-200",
              isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
            )}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} className={themeClasses.subtext} />
          </motion.button>
        </div>

        {/* Dynamic Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className={cn("text-[32px] font-bold leading-tight mb-1", themeClasses.text)}>
            {shareMode === 'choice' && 'Send Signal'}
            {shareMode === 'qr' && 'QR Code'}
            {shareMode === 'contacts' && 'Share to Contacts'}
          </h1>
          <p className={cn("text-[15px]", themeClasses.subtext)}>
            {shareMode === 'choice' && 'Choose how to share your signal'}
            {shareMode === 'qr' && 'Share your signal via QR code'}
            {shareMode === 'contacts' && 'Send signal invite via DM'}
          </p>
        </motion.div>
      </motion.div>

      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        {shareMode === 'choice' && renderChoiceScreen()}
        {shareMode === 'qr' && renderQrScreen()}
        {shareMode === 'contacts' && renderContactsScreen()}
      </AnimatePresence>
    </motion.div>
  );
};