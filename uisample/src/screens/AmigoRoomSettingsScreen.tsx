import React, { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Save, X, QrCode, Share2, Download, CheckCircle, ChevronRight, Ghost, Users, Info, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import { useSessionStore } from '../stores/useSessionStore';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface AmigoRoomSettingsScreenProps {
  onBack: () => void;
  chatId?: string;
  name?: string;
  description?: string;
}

export const AmigoRoomSettingsScreen = ({ 
  onBack, 
  chatId = 'room-1',
  name = 'Team Awesome',
  description = 'Official chat room for the awesome team. Share updates, memes, and good vibes only! 👻'
}: AmigoRoomSettingsScreenProps) => {
  const { amigoThemeMode: themeMode } = useSessionStore();
  
  // Room Info States
  const [roomName, setRoomName] = useState(name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [roomBio, setRoomBio] = useState(description);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80');

  // Feature States
  const [showQrModal, setShowQrModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const isDarkMode = themeMode !== 'day';
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';
  
  // Mock member count
  const memberCount = 4;
  const maxMembers = 200;

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    headerBg: isDarkMode ? 'bg-[#0A0A14]/90' : 'bg-[#F5F5F7]/90',
    card: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200',
    divider: isDarkMode ? 'border-white/5' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-[#141422] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900',
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
  };

  const handleShareQr = async () => {
    const shareData = {
        title: `Join "${roomName}" on Amigo`,
        text: `Scan this QR code to join the room "${roomName}".`,
        url: `amigo://room/${chatId}` 
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share cancelled or failed', err);
        }
    } else {
        // Fallback
        navigator.clipboard.writeText(`amigo://room/${chatId}`);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleSaveQr = async () => {
    try {
        const qrElement = document.getElementById('room-qr-code');
        if (!qrElement) return;

        const ghostIconSize = 32;
        const ghostSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${ghostIconSize}" height="${ghostIconSize}" viewBox="0 0 24 24" fill="${themeColor}" stroke="${themeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 10h.01"/>
            <path d="M15 10h.01"/>
            <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 18l2.5 3.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
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

        // Background
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

        // Text
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = themeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = `${themeColor}99`;
        ctx.shadowBlur = 10;
        ctx.fillText('AMIGO', canvasWidth / 2, outerCardY + 40);
        
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Room Name
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#111111';
        
        const nameText = roomName || 'Room';
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

        // Subtitle: Scan to join room
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = themeColor;
        
        const subtitleText = "SCAN TO JOIN ROOM";
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
          
          // Corner Decorations
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

          // Ghost Icon Center
          const centerX = canvasWidth / 2;
          const centerY = qrY + qrSize / 2;
          const iconContainerSize = ghostIconSize + 12 + 4;

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

          const ghostImg = new Image();
          const ghostBlob = new Blob([ghostSvg], { type: 'image/svg+xml;charset=utf-8' });
          const ghostUrl = URL.createObjectURL(ghostBlob);

          ghostImg.onload = () => {
            ctx.drawImage(
              ghostImg,
              centerX - ghostIconSize / 2,
              centerY - ghostIconSize / 2,
              ghostIconSize,
              ghostIconSize
            );

            canvas.toBlob((blob) => {
              if (blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `amigo_room_${roomName.replace(/\s+/g, '_')}_qr.png`;
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

  const handleDeleteRoom = () => {
    // Here you would implement actual deletion logic
    setDeleteDialogOpen(false);
    onBack(); 
  };

  return (
    <div className={cn("flex flex-col h-screen w-full overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      {/* Header */}
      <div className={cn("flex-none px-5 pt-4 pb-2 z-10 sticky top-0 backdrop-blur-md border-b", isDarkMode ? "border-white/5" : "border-gray-200/50", themeClasses.headerBg)}>
        <div className="flex items-center justify-between mb-4">
          <motion.button 
            onClick={onBack}
            className={cn(
              "p-2.5 -ml-2 rounded-xl transition-all duration-200",
              isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
            )}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} className={themeClasses.subtext} />
          </motion.button>
          <span className={cn("font-bold text-lg", themeClasses.text)}>Room Settings</span>
          <div className="w-10" />
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto custom-scrollbar px-5 py-6 space-y-8", themeClasses.bg)}>
        
        {/* Profile Picture Section */}
        <section className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
                <div className={cn(
                    "w-28 h-28 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300",
                    isDarkMode ? "border-white/10" : "border-white"
                )}>
                    <img src={avatar} alt="Room Avatar" className="w-full h-full object-cover" />
                </div>
                
                <label 
                    htmlFor="avatar-upload"
                    className={cn(
                        "absolute bottom-0 right-0 p-2.5 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95",
                        isDarkMode ? "bg-[#252538] text-white border-2 border-[#0A0A14]" : "bg-white text-gray-700 border-2 border-white"
                    )}
                >
                    <Camera size={18} />
                    <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                    />
                </label>
            </div>
            <p className={cn("mt-3 text-xs font-medium opacity-60", themeClasses.subtext)}>Tap to change room icon</p>
        </section>

        {/* Room Info Section */}
        <section>
            <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3 opacity-60 ml-1", themeClasses.subtext)}>General</h3>
            <div className={cn("p-4 rounded-2xl border mb-4 space-y-4", themeClasses.card)}>
                
                {/* Name */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className={cn("text-sm font-medium opacity-70", themeClasses.text)}>Room Name</span>
                        {!isEditingName ? (
                            <button 
                                onClick={() => setIsEditingName(true)}
                                className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/5 text-blue-400" : "hover:bg-gray-100 text-blue-600")}
                            >
                                <Edit2 size={14} />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsEditingName(false)}
                                    className={cn("p-1.5 rounded-lg transition-colors text-red-500", isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100")}
                                >
                                    <X size={14} />
                                </button>
                                <button 
                                    onClick={() => setIsEditingName(false)}
                                    className={cn("p-1.5 rounded-lg transition-colors text-green-500", isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100")}
                                >
                                    <Save size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    {isEditingName ? (
                        <input 
                            type="text" 
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            autoFocus
                            className={cn("w-full px-3 py-2 rounded-xl border text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all", themeClasses.inputBg)}
                        />
                    ) : (
                        <h2 className={cn("text-xl font-bold", themeClasses.text)}>{roomName}</h2>
                    )}
                </div>

                <div className={cn("h-[1px] w-full", themeClasses.divider)} />

                {/* Bio / Description */}
                <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className={cn("text-sm font-medium opacity-70", themeClasses.text)}>Description</span>
                        {!isEditingBio ? (
                            <button 
                                onClick={() => setIsEditingBio(true)}
                                className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/5 text-blue-400" : "hover:bg-gray-100 text-blue-600")}
                            >
                                <Edit2 size={14} />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsEditingBio(false)}
                                    className={cn("p-1.5 rounded-lg transition-colors text-red-500", isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100")}
                                >
                                    <X size={14} />
                                </button>
                                <button 
                                    onClick={() => setIsEditingBio(false)}
                                    className={cn("p-1.5 rounded-lg transition-colors text-green-500", isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100")}
                                >
                                    <Save size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    {isEditingBio ? (
                        <textarea 
                            value={roomBio}
                            onChange={(e) => setRoomBio(e.target.value)}
                            rows={3}
                            autoFocus
                            className={cn("w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none", themeClasses.inputBg)}
                        />
                    ) : (
                        <p className={cn("text-sm font-medium leading-relaxed", themeClasses.subtext)}>{roomBio}</p>
                    )}
                </div>

            </div>

            {/* Room QR Code Button */}
            <motion.button 
                onClick={() => setShowQrModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm",
                    themeClasses.card
                )}
            >
                <div className="flex items-center gap-3">
                    <div 
                        className="p-2.5 rounded-xl transition-colors duration-300"
                        style={{ 
                            backgroundColor: isDarkMode ? `${themeColor}1A` : '#DBEAFE',
                            color: themeColor 
                        }}
                    >
                        <QrCode size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className={cn("text-sm font-semibold", themeClasses.text)}>Room QR Code</span>
                        <span className={cn("text-xs opacity-60", themeClasses.subtext)}>Scan to join room</span>
                    </div>
                </div>
                <div className={cn("p-1.5 rounded-full", isDarkMode ? "bg-white/5" : "bg-gray-100")}>
                    <QrCode size={16} className={themeClasses.subtext} />
                </div>
            </motion.button>
        </section>

        {/* Room Capacity Info - Replaces Options */}
        <section>
            <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3 opacity-60 ml-1", themeClasses.subtext)}>Room Capacity</h3>
            <div className={cn("p-5 rounded-2xl border", themeClasses.card)}>
                <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-sm font-medium", themeClasses.text)}>Active Members</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", isDarkMode ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900")}>
                        {memberCount} / {maxMembers}
                    </span>
                </div>
                
                {/* Progress Bar */}
                <div className={cn("h-2 w-full rounded-full mb-4 overflow-hidden", isDarkMode ? "bg-white/5" : "bg-gray-100")}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(memberCount / maxMembers) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: themeColor }}
                    />
                </div>

                <div className="flex items-start gap-3">
                    <Users size={18} className={cn("mt-0.5 flex-shrink-0", themeClasses.subtext)} />
                    <p className={cn("text-xs leading-relaxed", themeClasses.subtext)}>Amigo rooms are exclusive spaces designed for close-knit communities. To maintain a high-quality experience, membership is capped at <strong className={themeClasses.text}>{maxMembers} active members</strong>.</p>
                </div>
            </div>
        </section>

        {/* Danger Zone */}
        <section>
            <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3 opacity-60 ml-1 text-red-500")}>Danger Zone</h3>
             <div className={cn("rounded-2xl border border-red-500/20 overflow-hidden", isDarkMode ? "bg-red-500/5" : "bg-red-50")}>
                 <button 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-500/10 transition-colors text-left"
                >
                    <Trash2 size={20} />
                    <span className="font-medium">Delete Room</span>
                </button>
             </div>
             <p className={cn("text-xs mt-2 ml-1 opacity-50", themeClasses.subtext)}>
                 Deleting a room is permanent and cannot be undone. All messages and media will be lost.
             </p>
        </section>

        {/* QR Code Modal */}
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
            <DialogContent className={cn("sm:max-w-sm border-0 p-0 overflow-hidden bg-transparent shadow-none")}>
                <DialogHeader className="sr-only">
                    <DialogTitle>Scan to Join Room</DialogTitle>
                    <DialogDescription>
                        Scan this QR code to join {roomName}
                    </DialogDescription>
                </DialogHeader>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className={cn(
                        "relative flex flex-col items-center p-8 rounded-3xl",
                        isDarkMode ? "bg-[#1A1A2E] border border-white/10" : "bg-white"
                    )}
                >
                    <div className="absolute top-4 right-4 z-50">
                        <button 
                            onClick={() => setShowQrModal(false)}
                            className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-white/10 text-white/50" : "hover:bg-gray-100 text-gray-400")}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className={cn("text-xl font-bold mb-1", themeClasses.text)}>Scan to Join</h3>
                    <p className={cn("text-sm mb-6", themeClasses.subtext)}>{roomName}</p>

                    {/* QR Code Card */}
                    <div className="relative mb-6 mx-auto">
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
                            className="absolute inset-0 rounded-[32px] blur-2xl opacity-50"
                            style={{ 
                                background: `linear-gradient(to bottom right, ${themeColor}, ${themeColor}80)`
                            }}
                        />

                        {/* QR Container Card */}
                        <div className={cn(
                            "relative rounded-[32px] p-6 border shadow-2xl overflow-hidden",
                            isDarkMode 
                                ? "bg-gradient-to-br from-[#1A1A2E] to-[#141422] border-white/10" 
                                : "bg-white border-gray-100"
                        )}>
                            {/* Inner gradient glow */}
                            <div 
                                className="absolute inset-0 opacity-10 pointer-events-none" 
                                style={{ 
                                    background: `linear-gradient(to bottom right, ${themeColor}, transparent)` 
                                }} 
                            />
                            
                            {/* QR Code wrapper */}
                            <div className={cn(
                                "relative rounded-[24px] p-4 overflow-hidden",
                                isDarkMode ? "bg-[#0A0A14]" : "bg-gray-50"
                            )}>
                                {/* Subtle inner glow */}
                                <div 
                                    className="absolute inset-0 opacity-5 rounded-[24px]" 
                                    style={{ 
                                        background: `linear-gradient(to bottom right, ${themeColor}, transparent)` 
                                    }} 
                                />
                                
                                <div className="relative flex justify-center items-center">
                                    <QRCodeSVG
                                        id="room-qr-code"
                                        value={`amigo://room/${chatId}`} 
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                        fgColor={themeColor}
                                        bgColor="transparent"
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />
                                    
                                    {/* Center Ghost Icon */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
                                                className="absolute inset-0 rounded-full blur-lg"
                                                style={{ backgroundColor: themeColor }}
                                            />
                                            
                                            {/* Icon container */}
                                            <div className={cn(
                                                "relative rounded-full p-3 border-2 shadow-lg",
                                                isDarkMode ? "bg-[#0A0A14]" : "bg-white"
                                            )} style={{ borderColor: themeColor }}>
                                                <Ghost size={24} style={{ color: themeColor }} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Corner decorations */}
                            {[
                                'top-3 left-3 border-t-2 border-l-2 rounded-tl-3xl',
                                'top-3 right-3 border-t-2 border-r-2 rounded-tr-3xl',
                                'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-3xl',
                                'bottom-3 right-3 border-b-2 border-r-2 rounded-br-3xl'
                            ].map((className, i) => (
                                <div 
                                    key={i} 
                                    className={`absolute w-8 h-8 opacity-40 ${className}`}
                                    style={{ borderColor: themeColor }}
                                />
                            ))}
                        </div>
                    </div>

                    <p className={cn("text-xs text-center opacity-60 max-w-[200px] mb-6", themeClasses.subtext)}>
                        Share this QR code with others so they can join this room instantly.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleShareQr}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                                isDarkMode 
                                    ? "bg-white/10 text-white hover:bg-white/20" 
                                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            )}
                        >
                            {copyFeedback ? (
                                <>
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Share2 size={18} />
                                    <span>Share</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleSaveQr}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-transform active:scale-95",
                            )}
                            style={{ 
                                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}DD)`,
                                boxShadow: `0 4px 12px ${themeColor}40`
                            }}
                        >
                            <Download size={18} />
                            <span>Save Image</span>
                        </button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>

        {/* Delete Room Dialog - Crowd Chat Animation Style */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className={isDarkMode ? "bg-[#0A0A14] border-white/10 text-white max-w-md" : "bg-white text-gray-900 max-w-md"}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    {/* Animated Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="mb-4 relative"
                    >
                        {/* Pulsing background */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.1, 0.3]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 2,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-[#FF6363] rounded-full blur-xl"
                        />
                        {/* Icon container */}
                        <div className="relative bg-[#FF6363]/20 p-4 rounded-full border-2 border-[#FF6363]/30">
                            <Trash2 size={32} className="text-[#FF6363]" strokeWidth={2} />
                        </div>
                    </motion.div>

                    <AlertDialogHeader className="text-center space-y-3">
                        <AlertDialogTitle className="text-xl">Delete Room?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                            Are you sure you want to delete <span className={cn("font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>{roomName}</span>? This action cannot be undone and all data will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteRoom} 
                            className="bg-[#FF6363] hover:bg-[#FF4545] text-white border-0"
                        >
                            Delete Room
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};
