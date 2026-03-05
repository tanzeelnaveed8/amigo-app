import React, { useState } from 'react';
import { ArrowLeft, Bell, Lock, Moon, Sun, QrCode, Camera, Edit2, Check, X, Share2, Copy, ChevronRight, Shield, Ghost, Trash2, Download, Ban, BookOpen, Mail, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface SettingsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  themeColor: string;
  themeGradient: string;
  themeMode: 'day' | 'night' | 'ghost';
  onThemeChange: (mode: 'day' | 'night' | 'ghost') => void;
  onDeleteAccount: () => void;
  onBlockedUsers: () => void;
  onSecurityData?: () => void;
  onCommunityGuidelines?: () => void;
}

// Optimized ToggleSwitch component moved outside to prevent re-renders
const ToggleSwitch = React.memo(({ enabled, onChange, isDarkMode, themeColor }: { enabled: boolean; onChange: (val: boolean) => void; isDarkMode: boolean; themeColor?: string }) => (
    <motion.button
      onClick={() => onChange(!enabled)}
      className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-300 ${
        enabled ? '' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'
      }`}
      style={{ backgroundColor: enabled ? themeColor : undefined }}
      whileTap={{ scale: 0.95 }}
      aria-checked={enabled}
      role="switch"
    >
      <motion.div
        className="absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full shadow-sm"
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
));

export const SettingsScreen = ({ onBack, isDarkMode, themeColor, themeGradient, themeMode, onThemeChange, onDeleteAccount, onBlockedUsers, onSecurityData, onCommunityGuidelines }: SettingsScreenProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [accountPrivacy, setAccountPrivacy] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Profile State
  const [name, setName] = useState('Alex');
  const [username, setUsername] = useState('alex_ghost');
  const [bio, setBio] = useState('Living life in ghost mode 👻');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80');

  // Edit States
  const [editingField, setEditingField] = useState<'name' | 'username' | 'bio' | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const startEditing = (field: 'name' | 'username' | 'bio', currentValue: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField === 'name') setName(tempValue);
    if (editingField === 'username') setUsername(tempValue);
    if (editingField === 'bio') {
        // Enforce limit on save as well
        if (tempValue.length <= 80) {
            setBio(tempValue);
        } else {
            setBio(tempValue.slice(0, 80));
        }
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveQR = async () => {
      try {
        const qrElement = document.getElementById('profile-qr-code');
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
  
        // Name
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#111111';
        
        const nameText = name;
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

        // Subtitle: Scan to add me on Amigo
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = themeColor;
        
        const subtitleText = "SCAN TO ADD ME ON AMIGO";
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
                link.download = `amigo_${username}_qr.png`;
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

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]'} transition-colors duration-300 font-sans`}>
      {/* Header - Matches AmigoHomeScreen style */}
      <motion.div 
        className="px-5 pt-4 pb-2 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.button 
          onClick={onBack}
          className={`p-2 -ml-2 rounded-xl transition-all duration-200 ${
            isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} className={isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'} />
        </motion.button>
        <div className="flex gap-2">
             <motion.button
                onClick={() => setShowQR(true)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Show QR Code"
            >
                <QrCode size={24} style={{ color: themeColor }} />
            </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Title */}
        <motion.div 
            className="px-6 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
        >
             <h1 className="text-[32px] font-bold leading-tight">
                <span
                    className="bg-clip-text text-transparent"
                    style={{
                        backgroundImage: isDarkMode
                            ? `linear-gradient(to right, ${themeColor}, ${themeColor}CC, ${themeColor}99)`
                            : `linear-gradient(to right, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
                    }}
                >
                    Settings
                </span>
            </h1>
            <p className={`text-[15px] font-medium mt-1 ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                Manage your account & preferences
            </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div 
            className="px-5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className={`relative overflow-hidden rounded-[24px] p-6 ${
                isDarkMode 
                    ? 'bg-[#141422] border border-white/5' 
                    : 'bg-white border border-gray-100 shadow-sm'
            }`}>
                 {/* Decorative background glow */}
                 <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-20`} style={{ backgroundColor: themeColor }} />

                 {/* Edit Toggle Button */}
                 <button
                    onClick={() => {
                        setIsEditMode(!isEditMode);
                        if (isEditMode) setEditingField(null);
                    }}
                    className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300 ${
                        isEditMode 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                            : isDarkMode 
                                ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800'
                    }`}
                 >
                    {isEditMode ? <Check size={16} /> : <Edit2 size={16} />}
                 </button>

                 <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Avatar */}
                    <div className="relative mb-4 group cursor-pointer">
                        <motion.div
                            whileHover={isEditMode ? { scale: 1.05 } : {}}
                            whileTap={isEditMode ? { scale: 0.95 } : {}}
                            className={`w-24 h-24 rounded-full p-1 border-2 ${
                                themeMode === 'ghost' ? 'border-[#9B7BFF]/30' : 'border-transparent'
                            }`}
                        >
                             <div className="w-full h-full rounded-full overflow-hidden relative">
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
                                    isEditMode ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    <Camera size={20} className="text-white" />
                                </div>
                             </div>
                        </motion.div>
                    </div>

                    {/* Name */}
                    <div className="w-full text-center mb-1">
                        {editingField === 'name' ? (
                            <div className="flex items-center justify-center gap-2">
                                <input
                                    autoFocus
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className={`bg-transparent text-center text-[20px] font-bold outline-none border-b-2 w-[200px] ${
                                        isDarkMode ? 'text-white border-[#3B82F6]' : 'text-gray-900 border-blue-500'
                                    }`}
                                    aria-label="Edit name"
                                />
                                <button onClick={saveEdit} className="p-1 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"><Check size={18} /></button>
                                <button onClick={cancelEdit} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><X size={18} /></button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => startEditing('name', name)}
                                className={`group flex items-center justify-center gap-2 ${isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <h2 className={`text-[20px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {name}
                                </h2>
                                <Edit2 size={14} className={`transition-opacity duration-300 ${
                                    isEditMode ? 'opacity-100 text-[#3B82F6]' : 'opacity-0'
                                }`} />
                            </div>
                        )}
                    </div>

                    {/* Username */}
                    <div className="w-full text-center mb-4">
                        {editingField === 'username' ? (
                             <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-2"
                             >
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`text-[14px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>@</span>
                                    <input
                                        autoFocus
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className={`bg-transparent text-center text-[14px] font-medium outline-none border-b w-[150px] ${
                                            isDarkMode ? 'text-[#8B8CAD] border-[#8B8CAD]' : 'text-gray-500 border-gray-400'
                                        }`}
                                        aria-label="Edit username"
                                    />
                                    <button onClick={saveEdit} className="p-1 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"><Check size={14} /></button>
                                </div>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF453A]/10 border border-[#FF453A]/20"
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Shield size={12} className="text-[#FF453A]" />
                                    </motion.div>
                                    <span className="text-[11px] text-[#FF453A] font-semibold">
                                        You can only change your username 2 times.
                                    </span>
                                </motion.div>
                             </motion.div>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5">
                                <p 
                                    onClick={() => startEditing('username', username)}
                                    className={`text-[14px] font-medium transition-colors ${
                                        isEditMode 
                                            ? 'cursor-pointer text-[#3B82F6]' 
                                            : isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'
                                    }`}
                                >
                                    @{username}
                                </p>
                                {isEditMode && <Edit2 size={12} className="text-[#3B82F6]" />}
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="w-full max-w-[280px]">
                        {editingField === 'bio' ? (
                            <div className="flex flex-col items-center gap-2">
                                <textarea
                                    autoFocus
                                    rows={3}
                                    value={tempValue}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 80) {
                                            setTempValue(e.target.value);
                                        }
                                    }}
                                    className={`w-full bg-transparent text-center text-[14px] outline-none border rounded-xl p-3 resize-none ${
                                        isDarkMode ? 'text-white border-white/10 bg-white/5' : 'text-gray-800 border-gray-200 bg-gray-50'
                                    }`}
                                    aria-label="Edit bio"
                                />
                                <div className="flex items-center justify-between w-full px-1">
                                    <span className={`text-[10px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-400'}`}>
                                        {tempValue.length}/80
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={cancelEdit} className="text-[12px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">Cancel</button>
                                        <button onClick={saveEdit} className="text-[12px] px-3 py-1 rounded-full text-white shadow-md transition-transform active:scale-95" style={{ backgroundColor: themeColor }}>Save</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group">
                                <p 
                                    onClick={() => startEditing('bio', bio)}
                                    className={`text-[14px] text-center leading-relaxed px-4 py-2 rounded-xl transition-all break-words ${
                                        isEditMode 
                                            ? `cursor-pointer border border-dashed ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}` 
                                            : isDarkMode ? 'text-[#E0E0E0]' : 'text-gray-600'
                                    }`}
                                >
                                    {bio}
                                </p>
                                {isEditMode && (
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full shadow-md">
                                        <Edit2 size={10} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="px-5 space-y-6 pb-10">
            
            {/* Appearance */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-3 pl-1 ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
                    Appearance
                </h3>
                <div className={`p-1 rounded-[18px] grid grid-cols-3 gap-1 ${isDarkMode ? 'bg-[#141422]' : 'bg-white border border-gray-100'}`}>
                    {[
                        { id: 'day', icon: Sun, label: 'Day' },
                        { id: 'night', icon: Moon, label: 'Night' },
                        { id: 'ghost', icon: Ghost, label: 'Ghost' }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => onThemeChange(mode.id as any)}
                            className={`relative py-3 rounded-[14px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                                themeMode === mode.id 
                                    ? isDarkMode ? 'bg-[#2A2A3E]' : 'bg-gray-100'
                                    : 'hover:bg-white/5'
                            }`}
                        >
                            <mode.icon 
                                size={20} 
                                className={`transition-colors duration-300 ${
                                    themeMode === mode.id 
                                        ? '' 
                                        : isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                                }`}
                                style={{ color: themeMode === mode.id ? themeColor : undefined }}
                            />
                            <span className={`text-[12px] font-medium ${
                                themeMode === mode.id 
                                    ? isDarkMode ? 'text-white' : 'text-gray-900'
                                    : isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                            }`}>
                                {mode.label}
                            </span>
                            {themeMode === mode.id && (
                                <motion.div 
                                    layoutId="activeTheme"
                                    className={`absolute inset-0 rounded-[14px] border-2`}
                                    style={{ borderColor: themeColor, opacity: 0.2 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Account Settings */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-3 pl-1 ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
                    Account
                </h3>
                <div className={`overflow-hidden rounded-[20px] ${isDarkMode ? 'bg-[#141422]' : 'bg-white border border-gray-100'}`}>
                    {/* Privacy */}
                    <div className={`p-4 flex flex-col ${isDarkMode ? 'border-b border-white/5' : 'border-b border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                                    style={{ backgroundColor: `${themeColor}1A` }}
                                >
                                    <Lock size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                                </div>
                                <div>
                                    <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Private Account
                                    </h4>
                                </div>
                            </div>
                            <ToggleSwitch enabled={accountPrivacy} onChange={setAccountPrivacy} isDarkMode={isDarkMode} themeColor={themeColor} />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={accountPrivacy ? 'private' : 'public'}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`text-[13px] leading-snug pl-[52px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
                            >
                                {accountPrivacy
                                    ? "Only users saved in your contacts can send you direct messages."
                                    : "Anyone on Amigo can send you direct messages."}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Notifications */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                                style={{ backgroundColor: `${themeColor}1A` }}
                            >
                                <Bell size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                            </div>
                            <div>
                                <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Notification & Sounds
                                </h4>
                                <p className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                                    Pause all notifications
                                </p>
                            </div>
                        </div>
                        <ToggleSwitch enabled={notificationsEnabled} onChange={setNotificationsEnabled} isDarkMode={isDarkMode} themeColor={themeColor} />
                    </div>
                </div>
            </motion.div>

            {/* Other Options */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6 }} 
                className="space-y-3"
             >
                  <button 
                     onClick={onSecurityData}
                     className={`w-full p-4 rounded-[20px] flex items-center justify-between group transition-all ${
                         isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                     }`}
                 >
                     <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                            style={{ backgroundColor: `${themeColor}1A` }}
                        >
                            <Shield size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                        </div>
                        <span className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security & Data</span>
                     </div>
                     <ChevronRight size={20} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
                 </button>
                 <button 
                     onClick={onCommunityGuidelines}
                     className={`w-full p-4 rounded-[20px] flex items-center justify-between group transition-all ${
                         isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                     }`}
                 >
                     <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                            style={{ backgroundColor: `${themeColor}1A` }}
                        >
                            <BookOpen size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                        </div>
                        <span className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Community Guidelines</span>
                     </div>
                     <ChevronRight size={20} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
                 </button>
                 <button 
                     onClick={onBlockedUsers}
                     className={`w-full p-4 rounded-[20px] flex items-center justify-between group transition-all ${
                         isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                     }`}
                 >
                     <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                            style={{ backgroundColor: `${themeColor}1A` }}
                        >
                            <Ban size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                        </div>
                        <span className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Blocked Users</span>
                     </div>
                     <ChevronRight size={20} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
                 </button>
                 <button 
                     onClick={onDeleteAccount}
                     className={`w-full p-4 rounded-[20px] flex items-center justify-between group transition-all ${
                         isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                     }`}
                 >
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#FF453A]/10`}>
                            <Trash2 size={20} className="text-[#FF453A]" />
                        </div>
                        <span className="text-[15px] font-medium text-[#FF453A]">Delete Account</span>
                     </div>
                     <ChevronRight size={20} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
                 </button>
            </motion.div>

            {/* Support & Safety */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.7 }} 
            >
                <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-3 pl-1 ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
                    Support & Safety
                </h3>
                <div className="space-y-3">
                    <a 
                        href="mailto:support@cryptogram.tech"
                        className={`w-full p-4 rounded-[20px] flex items-start justify-between group transition-all ${
                            isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0" 
                                style={{ backgroundColor: `${themeColor}1A` }}
                            >
                                <Mail size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                    Contact Us
                                </h4>
                                <p className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'} leading-snug mb-1`}>
                                    Get help or send feedback to our support team
                                </p>
                                <p className={`text-[12px] font-medium ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                                    support@cryptogram.tech
                                </p>
                            </div>
                        </div>
                        <ExternalLink size={16} className={`${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} mt-3 flex-shrink-0`} />
                    </a>
                    <a 
                        href="mailto:support@cryptogram.tech?subject=Safety%20Issue%20Report"
                        className={`w-full p-4 rounded-[20px] flex items-start justify-between group transition-all ${
                            isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FF453A]/10 flex-shrink-0"
                            >
                                <Shield size={20} className="text-[#FF453A]" />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                    Report Safety Issue
                                </h4>
                                <p className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'} leading-snug mb-1`}>
                                    Report abuse, harassment, or safety concerns
                                </p>
                                <p className={`text-[12px] font-medium ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                                    support@cryptogram.tech
                                </p>
                            </div>
                        </div>
                        <ExternalLink size={16} className={`${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} mt-3 flex-shrink-0`} />
                    </a>
                </div>
            </motion.div>

            {/* Legal */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.8 }} 
            >
                <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-3 pl-1 ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
                    Legal
                </h3>
                <div className="space-y-3">
                    <a 
                        href="https://www.cryptogram.tech/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full p-4 rounded-[20px] flex items-center justify-between group transition-all ${
                            isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                                style={{ backgroundColor: `${themeColor}1A` }}
                            >
                                <FileText size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                            </div>
                            <div>
                                <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Privacy Policy
                                </h4>
                                <p className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                                    Learn how we protect your data and privacy
                                </p>
                            </div>
                        </div>
                        <ExternalLink size={16} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
                    </a>
                    <a 
                        href="https://www.cryptogram.tech/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full p-4 rounded-[20px] flex items-center justify-between group transition-all ${
                            isDarkMode ? 'bg-[#141422] hover:bg-[#1A1A2E]' : 'bg-white border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300" 
                                style={{ backgroundColor: `${themeColor}1A` }}
                            >
                                <FileText size={20} style={{ color: themeColor }} className="transition-colors duration-300" />
                            </div>
                            <div>
                                <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Terms of Service (EULA)
                                </h4>
                                <p className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                                    Read our end user license agreement
                                </p>
                            </div>
                        </div>
                        <ExternalLink size={16} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
                    </a>
                </div>
            </motion.div>
            
            <div className="pt-4 text-center">
                <p className={`text-[12px] ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
                    Amigo v1.0.0 (2026)
                </p>
            </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={() => setShowQR(false)}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                >
                    <div 
                        className={`w-full max-w-[340px] rounded-[32px] overflow-hidden pointer-events-auto ${
                            isDarkMode ? 'bg-[#141422]' : 'bg-white'
                        }`}
                        style={{ boxShadow: `0 20px 60px -10px ${themeColor}40` }}
                    >
                        {/* Gradient Header */}
                        <div className={`h-32 relative bg-gradient-to-br ${themeGradient} flex items-center justify-center`}>
                             <button 
                                onClick={() => setShowQR(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors"
                             >
                                 <X size={20} />
                             </button>
                             <div className="translate-y-12">
                                <div className="w-24 h-24 rounded-full p-1 bg-white">
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                </div>
                             </div>
                        </div>

                        {/* Content */}
                        <div className="pt-16 pb-8 px-6 text-center flex flex-col items-center">
                             <h2 className={`text-[22px] font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {name}
                            </h2>
                            <p className={`text-[14px] mb-6 font-medium ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                                @{username}
                            </p>
                            
                            <p className="text-[12px] font-bold tracking-widest mb-4 uppercase" style={{ color: themeColor }}>Scan to add ME ON amigo</p>

                            {/* QR Code Card */}
                            <div className="relative mb-8 mx-auto">
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
                                <div className={`relative rounded-[32px] p-6 border shadow-2xl overflow-hidden ${
                                    isDarkMode 
                                        ? 'bg-gradient-to-br from-[#1A1A2E] to-[#141422] border-white/10' 
                                        : 'bg-white border-gray-100'
                                }`}>
                                    {/* Inner gradient glow */}
                                    <div 
                                        className="absolute inset-0 opacity-10 pointer-events-none" 
                                        style={{ 
                                            background: `linear-gradient(to bottom right, ${themeColor}, transparent)` 
                                        }} 
                                    />
                                    
                                    {/* QR Code wrapper with dark background */}
                                    <div className={`relative rounded-[24px] p-4 overflow-hidden ${
                                        isDarkMode ? 'bg-[#0A0A14]' : 'bg-gray-50'
                                    }`}>
                                        {/* Subtle inner glow */}
                                        <div 
                                            className="absolute inset-0 opacity-5 rounded-[24px]" 
                                            style={{ 
                                                background: `linear-gradient(to bottom right, ${themeColor}, transparent)` 
                                            }} 
                                        />
                                        
                                        <div className="relative flex justify-center items-center">
                                            <QRCodeSVG
                                                id="profile-qr-code"
                                                value={`https://amigo.app/u/${username}`}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                                fgColor={themeColor}
                                                bgColor="transparent"
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            />
                                            
                                            {/* Center Ghost Icon */}
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
                                                        className="absolute inset-0 rounded-full blur-lg"
                                                        style={{ backgroundColor: themeColor }}
                                                    />
                                                    
                                                    {/* Icon container */}
                                                    <div className={`relative rounded-full p-3 border-2 shadow-lg ${
                                                        isDarkMode ? 'bg-[#0A0A14]' : 'bg-white'
                                                    }`} style={{ borderColor: themeColor }}>
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

                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `Join me on Amigo!`,
                                                text: `Add me on Amigo: @${username}`,
                                                url: 'https://amigo.app/u/' + username
                                            }).catch(() => {});
                                        }
                                    }}
                                    className={`flex-1 py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                                    isDarkMode ? 'bg-[#2A2A3E] text-white hover:bg-[#32324A]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}>
                                    <Share2 size={18} />
                                    Share
                                </button>
                                <button 
                                    onClick={handleSaveQR}
                                    className={`flex-1 py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                                    isDarkMode ? 'bg-[#2A2A3E] text-white hover:bg-[#32324A]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}>
                                    <Download size={18} />
                                    Save QR
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
};