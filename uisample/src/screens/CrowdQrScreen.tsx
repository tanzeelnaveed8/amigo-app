import React, { useState } from 'react';
import { useCrowdStore } from '../stores/useCrowdStore';
import { GhostButton } from '../components/ui/ghost-button';
import { CountdownBadge } from '../components/ui/countdown-badge';
import { GhostQrCode } from '../components/ui/ghost-qr-code';
import { motion } from 'motion/react';
import { Share2, MessageCircle, X, CheckCircle, Ghost, Download } from 'lucide-react';

interface CrowdQrScreenProps {
  crowdId: string;
  onEnterChat: () => void;
  onBack: () => void;
}

export const CrowdQrScreen = ({ crowdId, onEnterChat, onBack }: CrowdQrScreenProps) => {
  const crowd = useCrowdStore(state => state.getCrowd(crowdId));
  const [shareText, setShareText] = useState('Save QR Image');

  if (!crowd) return null;

  const handleSaveQR = async () => {
    try {
      // Get the QR code SVG element
      const qrElement = document.getElementById('crowd-qr-code');
      if (!qrElement) return;

      // Create a Ghost icon SVG to use in the center
      const ghostIconSize = 32; // Increased size for better branding visibility
      const ghostSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${ghostIconSize}" height="${ghostIconSize}" viewBox="0 0 24 24" fill="#9B7BFF" stroke="#9B7BFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 10h.01"/>
          <path d="M15 10h.01"/>
          <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 18l2.5 3.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
        </svg>
      `;

      // Create canvas with Ghost Mode styling
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Canvas dimensions with padding for text and design
      const padding = 50;
      const qrSize = 320; // Reduced from 400 for better centering
      const titleHeight = 160; // Increased from 140 to push QR down for better spacing
      const bottomPadding = 50; // Extra padding at bottom
      const canvasWidth = qrSize + (padding * 2) + 80; // Added extra width for breathing room
      const canvasHeight = qrSize + titleHeight + padding + bottomPadding + 80; // Adjusted height

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Background gradient (Ghost Mode dark theme)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#0A0A14');
      gradient.addColorStop(1, '#1A1A2E');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate outer card dimensions first (we'll use these for positioning)
      const cardPadding = 24; // Reduced from 20 for better spacing
      const outerCardX = cardPadding;
      const outerCardY = cardPadding;
      const outerCardWidth = canvasWidth - (cardPadding * 2);
      const outerCardHeight = canvasHeight - (cardPadding * 2);
      const outerCardRadius = 32; // rounded-[32px]

      // Add purple glow effect
      ctx.shadowColor = 'rgba(155, 123, 255, 0.3)';
      ctx.shadowBlur = 40;
      
      // Draw outer card with gradient background (matching GhostQrCode component)
      // Create gradient for outer card (from-[#1A1A2E] to-[#141422])
      const outerCardGradient = ctx.createLinearGradient(outerCardX, outerCardY, outerCardX + outerCardWidth, outerCardY + outerCardHeight);
      outerCardGradient.addColorStop(0, '#1A1A2E');
      outerCardGradient.addColorStop(1, '#141422');
      
      ctx.fillStyle = outerCardGradient;
      ctx.beginPath();
      ctx.roundRect(outerCardX, outerCardY, outerCardWidth, outerCardHeight, outerCardRadius);
      ctx.fill();
      
      // Draw outer card border (border-[rgba(155,123,255,0.3)])
      ctx.strokeStyle = 'rgba(155, 123, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      // Draw inner gradient glow overlay (from-[#9B7BFF]/10 to-transparent)
      const innerGlowGradient = ctx.createLinearGradient(outerCardX, outerCardY, outerCardX + outerCardWidth, outerCardY + outerCardHeight);
      innerGlowGradient.addColorStop(0, 'rgba(155, 123, 255, 0.1)');
      innerGlowGradient.addColorStop(1, 'rgba(155, 123, 255, 0)');
      ctx.fillStyle = innerGlowGradient;
      ctx.beginPath();
      ctx.roundRect(outerCardX, outerCardY, outerCardWidth, outerCardHeight, outerCardRadius);
      ctx.fill();

      // NOW draw text on top of the card so it's visible
      // Draw "AMIGO" watermark at top (bigger size by +2 more = 24px total)
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#9B7BFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add subtle glow effect for AMIGO text
      ctx.shadowColor = 'rgba(155, 123, 255, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw AMIGO text (standard rendering, no custom spacing)
      ctx.fillText('AMIGO', canvasWidth / 2, outerCardY + 40);
      
      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Draw crowd name with custom letter spacing
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      
      const crowdNameText = crowd.name;
      const crowdNameSpacing = 3;
      
      // Calculate total width for crowd name
      let crowdNameWidth = 0;
      for (let i = 0; i < crowdNameText.length; i++) {
        crowdNameWidth += ctx.measureText(crowdNameText[i]).width;
      }
      crowdNameWidth += crowdNameSpacing * (crowdNameText.length - 1);
      
      // Draw crowd name with spacing (centered)
      let crowdNameX = (canvasWidth / 2) - (crowdNameWidth / 2);
      const crowdNameY = outerCardY + 85;
      
      ctx.textAlign = 'left';
      for (let i = 0; i < crowdNameText.length; i++) {
        const letter = crowdNameText[i];
        const letterWidth = ctx.measureText(letter).width;
        ctx.fillText(letter, crowdNameX, crowdNameY);
        crowdNameX += letterWidth + crowdNameSpacing;
      }

      // Draw subtitle with custom letter spacing (centered)
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#C5C6E3';
      
      const subtitleText = 'SCAN TO JOIN THE CROWD';
      const subtitleSpacing = 2.5;
      
      // Calculate total width for subtitle
      let subtitleWidth = 0;
      for (let i = 0; i < subtitleText.length; i++) {
        subtitleWidth += ctx.measureText(subtitleText[i]).width;
      }
      subtitleWidth += subtitleSpacing * (subtitleText.length - 1);
      
      // Draw subtitle with spacing (centered)
      let subtitleX = (canvasWidth / 2) - (subtitleWidth / 2);
      const subtitleY = outerCardY + 120;
      
      for (let i = 0; i < subtitleText.length; i++) {
        const letter = subtitleText[i];
        const letterWidth = ctx.measureText(letter).width;
        ctx.fillText(letter, subtitleX, subtitleY);
        subtitleX += letterWidth + subtitleSpacing;
      }
      
      // Reset text align
      ctx.textAlign = 'center';

      // Convert QR SVG to image and draw it
      const svgData = new XMLSerializer().serializeToString(qrElement);
      const qrImg = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const qrUrl = URL.createObjectURL(svgBlob);

      qrImg.onload = () => {
        // Draw black inner container for QR code (bg-[#0A0A14] with rounded-[24px])
        const qrContainerPadding = 32; // p-4 scaled 2x
        const qrContainerX = (canvasWidth - qrSize - qrContainerPadding * 2) / 2;
        const qrContainerY = padding + titleHeight - qrContainerPadding;
        const qrContainerSize = qrSize + qrContainerPadding * 2;
        const qrContainerRadius = 24; // rounded-[24px]
        
        ctx.fillStyle = '#0A0A14';
        ctx.beginPath();
        ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, qrContainerRadius);
        ctx.fill();
        
        // Draw inner container gradient overlay (from-[#9B7BFF]/5 to-transparent)
        const qrContainerGradient = ctx.createLinearGradient(qrContainerX, qrContainerY, qrContainerX + qrContainerSize, qrContainerY + qrContainerSize);
        qrContainerGradient.addColorStop(0, 'rgba(155, 123, 255, 0.05)');
        qrContainerGradient.addColorStop(1, 'rgba(155, 123, 255, 0)');
        ctx.fillStyle = qrContainerGradient;
        ctx.beginPath();
        ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, qrContainerRadius);
        ctx.fill();
        
        // Draw QR code centered on the black container
        const qrX = (canvasWidth - qrSize) / 2;
        const qrY = padding + titleHeight;
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        
        // Draw 4 corner decorations around the QR black container (not the whole card)
        const cornerSize = 32; // w-8 h-8 scaled 2x (from 16px base)
        const cornerOffset = 24; // top-3, left-3, etc. scaled 2x (from 12px base)
        const cornerBorderRadius = 48; // rounded-*-3xl scaled 2x (from 24px base)
        
        ctx.strokeStyle = 'rgba(155, 123, 255, 0.4)';
        ctx.lineWidth = 4; // border-2 scaled 2x
        
        // Top-left corner (border-t-2 border-l-2 rounded-tl-3xl)
        ctx.beginPath();
        ctx.moveTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset + cornerSize);
        ctx.lineTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset + cornerBorderRadius);
        ctx.arcTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset, qrContainerX + cornerOffset + cornerBorderRadius, qrContainerY + cornerOffset, cornerBorderRadius);
        ctx.lineTo(qrContainerX + cornerOffset + cornerSize, qrContainerY + cornerOffset);
        ctx.stroke();
        
        // Top-right corner (border-t-2 border-r-2 rounded-tr-3xl)
        ctx.beginPath();
        ctx.moveTo(qrContainerX + qrContainerSize - cornerOffset - cornerSize, qrContainerY + cornerOffset);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset - cornerBorderRadius, qrContainerY + cornerOffset);
        ctx.arcTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset, qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset + cornerBorderRadius, cornerBorderRadius);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset + cornerSize);
        ctx.stroke();
        
        // Bottom-left corner (border-b-2 border-l-2 rounded-bl-3xl)
        ctx.beginPath();
        ctx.moveTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerSize);
        ctx.lineTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerBorderRadius);
        ctx.arcTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset, qrContainerX + cornerOffset + cornerBorderRadius, qrContainerY + qrContainerSize - cornerOffset, cornerBorderRadius);
        ctx.lineTo(qrContainerX + cornerOffset + cornerSize, qrContainerY + qrContainerSize - cornerOffset);
        ctx.stroke();
        
        // Bottom-right corner (border-b-2 border-r-2 rounded-br-3xl)
        ctx.beginPath();
        ctx.moveTo(qrContainerX + qrContainerSize - cornerOffset - cornerSize, qrContainerY + qrContainerSize - cornerOffset);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset - cornerBorderRadius, qrContainerY + qrContainerSize - cornerOffset);
        ctx.arcTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset, qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerBorderRadius, cornerBorderRadius);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerSize);
        ctx.stroke();

        // Now draw the ghost icon in center
        const centerX = canvasWidth / 2;
        const centerY = qrY + qrSize / 2;
        
        // Calculate icon container size (matches the component: p-3 with border-2)
        const iconContainerSize = ghostIconSize + 12 + 4; // icon + padding + border

        // Draw pulsing glow behind icon
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, iconContainerSize * 1.5);
        glowGradient.addColorStop(0, 'rgba(155, 123, 255, 0.5)');
        glowGradient.addColorStop(1, 'rgba(155, 123, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconContainerSize * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw background circle for ghost icon
        ctx.fillStyle = '#0A0A14';
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconContainerSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#9B7BFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconContainerSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Convert ghost icon SVG to image and draw it
        const ghostImg = new Image();
        const ghostBlob = new Blob([ghostSvg], { type: 'image/svg+xml;charset=utf-8' });
        const ghostUrl = URL.createObjectURL(ghostBlob);

        ghostImg.onload = () => {
          // Draw ghost icon centered
          ctx.drawImage(
            ghostImg,
            centerX - ghostIconSize / 2,
            centerY - ghostIconSize / 2,
            ghostIconSize,
            ghostIconSize
          );

          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${crowd.name.replace(/\s+/g, '_')}_QR.png`;
              link.click();
              URL.revokeObjectURL(link.href);
              
              setShareText('Saved!');
              setTimeout(() => setShareText('Save QR Image'), 2000);
            }
          });

          URL.revokeObjectURL(ghostUrl);
          URL.revokeObjectURL(qrUrl);
        };

        ghostImg.src = ghostUrl;
      };

      qrImg.src = qrUrl;
    } catch (error) {
      console.error('Error saving QR code:', error);
      setShareText('Save QR Image');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] px-6 pt-12 pb-8"
      aria-label="Crowd created successfully"
    >
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full bg-black/20 hover:bg-black/40 text-[#C5C6E3] transition-colors"
          aria-label="Close and return to ghost home"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        
        {/* Success Animation */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-12 h-12 rounded-full bg-[#9B7BFF]/20 flex items-center justify-center mb-4"
        >
          <CheckCircle size={28} className="text-[#9B7BFF]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-[28px] font-bold text-white mb-1">Crowd Created!</h1>
          <p className="text-[18px] text-[#C5C6E3] font-medium">{crowd.name}</p>
        </motion.div>

        {/* QR Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          data-testid="crowd-qr-card"
        >
          <GhostQrCode 
            value={crowd.qrJoinCode} 
            size={200}
            showTitle={true}
            className="bg-white p-6 rounded-2xl shadow-[0_8px_32px_rgba(155,123,255,0.4)]"
          />
        </motion.div>

        {/* Countdown */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <CountdownBadge expiresAt={crowd.expiresAt} />
        </motion.div>
      </div>

      {/* Footer Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm mx-auto space-y-3 mt-4"
      >
        <GhostButton 
          fullWidth 
          variant="primary"
          size="lg"
          iconRight={<MessageCircle size={20} />}
          onClick={onEnterChat}
          data-testid="open-chat-button"
          aria-label="Open crowd chat"
        >
          Open Crowd Chat
        </GhostButton>
        
        <GhostButton 
          fullWidth 
          variant="secondary" 
          size="lg"
          iconLeft={<Download size={20} />}
          onClick={handleSaveQR}
          data-testid="share-qr-button"
          aria-label="Save QR code"
        >
          {shareText}
        </GhostButton>
      </motion.div>
    </motion.div>
  );
};