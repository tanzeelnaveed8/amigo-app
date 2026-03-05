import React from 'react';
import { motion } from 'motion/react';
import { GhostQrCode } from '../components/ui/ghost-qr-code';
import { TopNavBar } from '../components/ui/top-nav-bar';
import { GhostButton } from '../components/ui/ghost-button';
import { useCrowdStore } from '../stores/useCrowdStore';
import { Download, Share2, Info, Clock, Shield } from 'lucide-react';
import { CountdownBadge } from '../components/ui/countdown-badge';
import { formatDistanceToNow } from 'date-fns';

interface ViewQrScreenProps {
  crowdId: string;
  onBack: () => void;
  isAdmin?: boolean;
}

export const ViewQrScreen = ({ crowdId, onBack, isAdmin = false }: ViewQrScreenProps) => {
  const crowd = useCrowdStore(state => state.crowds[crowdId]);

  if (!crowd) return null;

  const handleSaveQr = () => {
    try {
      // Get the QR code SVG element
      const qrElement = document.getElementById('qr-code-svg');
      if (!qrElement) return;

      // Create a Ghost icon SVG to use in the center
      const ghostIconSize = 32;
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
      const qrSize = 320;
      const titleHeight = 160;
      const bottomPadding = 50;
      const canvasWidth = qrSize + (padding * 2) + 80;
      const canvasHeight = qrSize + titleHeight + padding + bottomPadding + 80;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Background gradient (Ghost Mode dark theme)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#0A0A14');
      gradient.addColorStop(1, '#1A1A2E');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate outer card dimensions first
      const cardPadding = 24;
      const outerCardX = cardPadding;
      const outerCardY = cardPadding;
      const outerCardWidth = canvasWidth - (cardPadding * 2);
      const outerCardHeight = canvasHeight - (cardPadding * 2);
      const outerCardRadius = 32;

      // Add purple glow effect
      ctx.shadowColor = 'rgba(155, 123, 255, 0.3)';
      ctx.shadowBlur = 40;
      
      // Draw outer card with gradient background
      const outerCardGradient = ctx.createLinearGradient(outerCardX, outerCardY, outerCardX + outerCardWidth, outerCardY + outerCardHeight);
      outerCardGradient.addColorStop(0, '#1A1A2E');
      outerCardGradient.addColorStop(1, '#141422');
      
      ctx.fillStyle = outerCardGradient;
      ctx.beginPath();
      ctx.roundRect(outerCardX, outerCardY, outerCardWidth, outerCardHeight, outerCardRadius);
      ctx.fill();
      
      // Draw outer card border
      ctx.strokeStyle = 'rgba(155, 123, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      // Draw inner gradient glow overlay
      const innerGlowGradient = ctx.createLinearGradient(outerCardX, outerCardY, outerCardX + outerCardWidth, outerCardY + outerCardHeight);
      innerGlowGradient.addColorStop(0, 'rgba(155, 123, 255, 0.1)');
      innerGlowGradient.addColorStop(1, 'rgba(155, 123, 255, 0)');
      ctx.fillStyle = innerGlowGradient;
      ctx.beginPath();
      ctx.roundRect(outerCardX, outerCardY, outerCardWidth, outerCardHeight, outerCardRadius);
      ctx.fill();

      // Draw "AMIGO" watermark at top
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#9B7BFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add subtle glow effect for AMIGO text
      ctx.shadowColor = 'rgba(155, 123, 255, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
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
        // Draw black inner container for QR code
        const qrContainerPadding = 32;
        const qrContainerX = (canvasWidth - qrSize - qrContainerPadding * 2) / 2;
        const qrContainerY = padding + titleHeight - qrContainerPadding;
        const qrContainerSize = qrSize + qrContainerPadding * 2;
        const qrContainerRadius = 24;
        
        ctx.fillStyle = '#0A0A14';
        ctx.beginPath();
        ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, qrContainerRadius);
        ctx.fill();
        
        // Draw inner container gradient overlay
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
        
        // Draw 4 corner decorations around the QR black container
        const cornerSize = 32;
        const cornerOffset = 24;
        const cornerBorderRadius = 48;
        
        ctx.strokeStyle = 'rgba(155, 123, 255, 0.4)';
        ctx.lineWidth = 4;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset + cornerSize);
        ctx.lineTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset + cornerBorderRadius);
        ctx.arcTo(qrContainerX + cornerOffset, qrContainerY + cornerOffset, qrContainerX + cornerOffset + cornerBorderRadius, qrContainerY + cornerOffset, cornerBorderRadius);
        ctx.lineTo(qrContainerX + cornerOffset + cornerSize, qrContainerY + cornerOffset);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(qrContainerX + qrContainerSize - cornerOffset - cornerSize, qrContainerY + cornerOffset);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset - cornerBorderRadius, qrContainerY + cornerOffset);
        ctx.arcTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset, qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset + cornerBorderRadius, cornerBorderRadius);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + cornerOffset + cornerSize);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerSize);
        ctx.lineTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerBorderRadius);
        ctx.arcTo(qrContainerX + cornerOffset, qrContainerY + qrContainerSize - cornerOffset, qrContainerX + cornerOffset + cornerBorderRadius, qrContainerY + qrContainerSize - cornerOffset, cornerBorderRadius);
        ctx.lineTo(qrContainerX + cornerOffset + cornerSize, qrContainerY + qrContainerSize - cornerOffset);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(qrContainerX + qrContainerSize - cornerOffset - cornerSize, qrContainerY + qrContainerSize - cornerOffset);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset - cornerBorderRadius, qrContainerY + qrContainerSize - cornerOffset);
        ctx.arcTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset, qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerBorderRadius, cornerBorderRadius);
        ctx.lineTo(qrContainerX + qrContainerSize - cornerOffset, qrContainerY + qrContainerSize - cornerOffset - cornerSize);
        ctx.stroke();

        // Now draw the ghost icon in center
        const centerX = canvasWidth / 2;
        const centerY = qrY + qrSize / 2;
        
        const iconContainerSize = ghostIconSize + 12 + 4;

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
    }
  };

  const handleShareQr = async () => {
    const shareData = {
      title: `Join "${crowd.name}" on Ghost Mode`,
      text: `Scan this QR code to join the crowd "${crowd.name}". Expires ${formatDistanceToNow(crowd.expiresAt, { addSuffix: true })}.`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      // Fallback: copy QR data to clipboard
      navigator.clipboard.writeText(crowd.qrJoinCode);
      alert('QR code data copied to clipboard!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426]"
      aria-label="View and share crowd QR code"
    >
      <TopNavBar 
        title="QR Code" 
        onBack={onBack}
        className="bg-transparent border-b-0"
      />

      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 justify-between">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-white mb-2">
            {crowd.name}
          </h1>
          <div className="flex items-center justify-center gap-3 text-[#8B8CAD] text-sm">
            {isAdmin && (
              <div className="flex items-center gap-1 bg-[#9B7BFF]/20 text-[#B88DFF] px-3 py-1 rounded-full text-xs font-medium">
                <Shield size={12} />
                <span>ADMIN</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Expires {formatDistanceToNow(crowd.expiresAt, { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex items-center justify-center"
        >
          <GhostQrCode
            id="qr-code-svg"
            value={crowd.qrJoinCode}
            size={256}
            showTitle={true}
          />
        </motion.div>

        {/* Countdown */}
        <div className="flex justify-center mb-6">
          <CountdownBadge expiresAt={crowd.expiresAt} />
        </div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141422] rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] mb-6"
        >
          <div className="flex items-center mb-2 text-[#9B7BFF]">
            <Info size={14} className="mr-2" />
            <span className="font-semibold text-xs">Scan to Join</span>
          </div>
          <p className="text-[12px] text-[#C5C6E3] leading-[18px]">
            Anyone with this QR code can join your crowd. The code expires when the crowd ends.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <GhostButton 
            fullWidth 
            variant="primary"
            size="lg"
            iconLeft={<Share2 size={20} />}
            onClick={handleShareQr}
            aria-label="Share QR code"
          >
            Share QR Code
          </GhostButton>
          
          <GhostButton 
            fullWidth 
            variant="secondary"
            size="lg"
            iconLeft={<Download size={20} />}
            onClick={handleSaveQr}
            aria-label="Save QR code as image"
          >
            Save QR Image
          </GhostButton>
        </div>
      </div>
    </motion.div>
  );
};