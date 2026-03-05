import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, Check, Users, Radio, AlertCircle, Image as ImageIcon, X, MessageCircle, Megaphone, Lock, Globe, UserCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from '../components/ui/avatar';

interface CreateRoomSignalScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  themeColor: string;
  themeMode: 'day' | 'night' | 'ghost';
  roomsCreatedToday: number;
  hasSignal: boolean;
  onCreateRoom: (data: RoomData) => void;
  onCreateSignal: (data: SignalData) => void;
}

interface RoomData {
  name: string;
  description: string;
  picture: string | null;
  members: string[];
}

interface SignalData {
  username: string;
  name: string;
  description: string;
  picture: string | null;
  invitedSubscribers: string[];
}

interface Contact {
  id: string;
  name: string;
  isOnline: boolean;
}

// Mock contacts list
const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah Wilson', isOnline: true },
  { id: '2', name: 'Mike Chen', isOnline: true },
  { id: '3', name: 'Emma Davis', isOnline: false },
  { id: '4', name: 'James Rodriguez', isOnline: false },
  { id: '5', name: 'Sophie Turner', isOnline: false },
  { id: '6', name: 'Alex Johnson', isOnline: true },
  { id: '7', name: 'Maria Garcia', isOnline: false },
  { id: '8', name: 'David Lee', isOnline: true },
];

type CreateType = 'room' | 'signal' | null;
type Step = 'select-type' | 'create-form' | 'select-members';

export const CreateRoomSignalScreen: React.FC<CreateRoomSignalScreenProps> = ({
  onBack,
  isDarkMode,
  themeColor,
  themeMode,
  roomsCreatedToday,
  hasSignal,
  onCreateRoom,
  onCreateSignal,
}) => {
  const [step, setStep] = useState<Step>('select-type');
  const [createType, setCreateType] = useState<CreateType>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Validation states
  const [usernameError, setUsernameError] = useState('');
  const [nameError, setNameError] = useState('');

  const themeGradient = themeMode === 'ghost'
    ? 'from-[#9B7BFF] to-[#7C5FD4]'
    : themeMode === 'day'
    ? 'from-[#2563EB] to-[#1E40AF]'
    : 'from-[#3B82F6] to-[#1D4ED8]';

  const canCreateRoom = roomsCreatedToday < 3;

  const handleSelectType = (type: CreateType) => {
    if (type === 'room' && !canCreateRoom) {
      return;
    }
    if (type === 'signal' && hasSignal) {
      return;
    }
    setCreateType(type);
    setStep('create-form');
  };

  const handleBackFromForm = () => {
    if (step === 'select-members') {
      setStep('create-form');
    } else if (step === 'create-form') {
      setStep('select-type');
      setCreateType(null);
      // Reset form
      setUsername('');
      setName('');
      setDescription('');
      setProfilePicture(null);
      setSelectedMembers([]);
      setUsernameError('');
      setNameError('');
    } else {
      onBack();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateName = (value: string) => {
    if (!value) {
      setNameError('Name is required');
      return false;
    }
    if (value.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleContinueToMembers = () => {
    if (createType === 'signal') {
      if (!validateUsername(username)) return;
    }
    if (!validateName(name)) return;

    setStep('select-members');
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreate = () => {
    if (createType === 'room') {
      onCreateRoom({
        name,
        description,
        picture: profilePicture,
        members: selectedMembers,
      });
    } else if (createType === 'signal') {
      onCreateSignal({
        username,
        name,
        description,
        picture: profilePicture,
        invitedSubscribers: selectedMembers,
      });
    }
  };

  const canContinue = createType === 'signal'
    ? username.length >= 3 && name.length >= 2
    : name.length >= 2;

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#FAFAFA]'} transition-colors duration-300`}>
      {/* Header */}
      <motion.div
        className={`px-5 pt-4 pb-3 ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#FAFAFA]'}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Nav row */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <motion.button
            onClick={handleBackFromForm}
            className={`w-10 h-10 -ml-1 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
              isDarkMode ? 'hover:bg-white/[0.06] active:bg-white/[0.1]' : 'hover:bg-black/[0.04] active:bg-black/[0.07]'
            }`}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowLeft size={21} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
          </motion.button>
        </div>

        {/* Title */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className={`text-[32px] font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {step === 'select-type' && (
              <>
                Create
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: isDarkMode
                      ? `linear-gradient(to right, ${themeColor}, ${themeColor}CC, ${themeColor}99)`
                      : `linear-gradient(to right, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
                  }}
                >
                  New
                </span>
              </>
            )}
            {step === 'create-form' && (
              <>
                {createType === 'room' ? 'Create' : 'Create'}
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: isDarkMode
                      ? `linear-gradient(to right, ${themeColor}, ${themeColor}CC, ${themeColor}99)`
                      : `linear-gradient(to right, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
                  }}
                >
                  {createType === 'room' ? 'Room' : 'Signal'}
                </span>
              </>
            )}
            {step === 'select-members' && (
              <>
                {createType === 'room' ? 'Add' : 'Invite'}
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: isDarkMode
                      ? `linear-gradient(to right, ${themeColor}, ${themeColor}CC, ${themeColor}99)`
                      : `linear-gradient(to right, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
                  }}
                >
                  {createType === 'room' ? 'Members' : 'Subscribers'}
                </span>
              </>
            )}
          </h1>
          <motion.p
            className={`text-[15px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-400'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            {step === 'select-type' && 'Choose what you want to create'}
            {step === 'create-form' && `Set up your ${createType} details`}
            {step === 'select-members' && `${selectedMembers.length} selected`}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Type */}
          {step === 'select-type' && (
            <motion.div
              key="select-type"
              className="px-5 pb-6 space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Room Card - Enhanced */}
              <motion.button
                onClick={() => handleSelectType('room')}
                disabled={!canCreateRoom}
                className={`w-full p-6 rounded-[24px] border-2 transition-all duration-200 relative overflow-hidden ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-[#141422] to-[#1A1A2E] border-white/10 hover:border-white/20 active:scale-[0.98]'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60 hover:border-gray-300 active:scale-[0.98]'
                } ${!canCreateRoom && 'opacity-50 cursor-not-allowed'}`}
                style={{
                  boxShadow: canCreateRoom && isDarkMode ? `0 8px 32px ${themeColor}15` : undefined
                }}
                whileTap={canCreateRoom ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Decorative background gradient */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                  style={{ background: themeColor }}
                />
                
                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}CC)`,
                      }}
                    >
                      <Users size={28} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className={`text-[20px] font-bold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Room
                      </h3>
                      <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                        Private group conversations
                      </p>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className={`text-[13px] ${isDarkMode ? 'text-[#A0A0BC]' : 'text-gray-600'}`}>
                        Add multiple members
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className={`text-[13px] ${isDarkMode ? 'text-[#A0A0BC]' : 'text-gray-600'}`}>
                        Group conversations & media
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className={`text-[13px] ${isDarkMode ? 'text-[#A0A0BC]' : 'text-gray-600'}`}>
                        Full two-way communication
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    {canCreateRoom ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ 
                        backgroundColor: `${themeColor}15`,
                      }}>
                        <span className="text-[12px] font-bold" style={{ color: themeColor }}>
                          {3 - roomsCreatedToday} LEFT TODAY
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/10">
                        <AlertCircle size={13} className="text-[#EF4444]" />
                        <span className="text-[12px] font-bold text-[#EF4444]">
                          DAILY LIMIT (3/3)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>

              {/* Signal Card - Enhanced */}
              <motion.button
                onClick={() => handleSelectType('signal')}
                disabled={hasSignal}
                className={`w-full p-6 rounded-[24px] border-2 transition-all duration-200 relative overflow-hidden ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-[#141422] to-[#1A1A2E] border-white/10 hover:border-white/20 active:scale-[0.98]'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60 hover:border-gray-300 active:scale-[0.98]'
                } ${hasSignal && 'opacity-50 cursor-not-allowed'}`}
                style={{
                  boxShadow: !hasSignal && isDarkMode ? `0 8px 32px ${themeColor}15` : undefined
                }}
                whileTap={!hasSignal ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {/* Decorative background gradient */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                  style={{ background: themeColor }}
                />
                
                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}CC)`,
                      }}
                    >
                      <Radio size={28} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className={`text-[20px] font-bold mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Signal
                      </h3>
                      <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                        Your broadcast channel
                      </p>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className={`text-[13px] ${isDarkMode ? 'text-[#A0A0BC]' : 'text-gray-600'}`}>
                        Broadcast to unlimited subscribers
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className={`text-[13px] ${isDarkMode ? 'text-[#A0A0BC]' : 'text-gray-600'}`}>
                        Share updates, media & announcements
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className={`text-[13px] ${isDarkMode ? 'text-[#A0A0BC]' : 'text-gray-600'}`}>
                        One-way communication channel
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  {hasSignal ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/10">
                      <AlertCircle size={13} className="text-[#EF4444]" />
                      <span className="text-[12px] font-bold text-[#EF4444]">
                        ALREADY CREATED
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ 
                      backgroundColor: `${themeColor}15`,
                    }}>
                      <span className="text-[12px] font-bold" style={{ color: themeColor }}>
                        ONE PER ACCOUNT
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Create Form */}
          {step === 'create-form' && (
            <motion.div
              key="create-form"
              className="px-5 pb-24 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Profile Picture Upload */}
              <motion.div
                className="flex flex-col items-center pt-1 pb-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all duration-300 ${
                      isDarkMode
                        ? 'border-white/10 hover:border-white/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ borderColor: profilePicture ? themeColor : undefined }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isDarkMode ? 'bg-[#141422]' : 'bg-gray-100'
                      }`}>
                        <ImageIcon size={28} className={isDarkMode ? 'text-white/30' : 'text-gray-400'} />
                      </div>
                    )}
                  </motion.button>
                  <motion.div
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: themeColor }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera size={16} className="text-white" />
                  </motion.div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className={`text-[13px] mt-2.5 ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                  Upload {createType} picture
                </p>
              </motion.div>

              {/* Username field (Signal only) */}
              {createType === 'signal' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`}>
                    Username <span style={{ color: themeColor }}>*</span>
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold"
                      style={{ color: themeColor }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (e.target.value) validateUsername(e.target.value);
                      }}
                      onBlur={() => validateUsername(username)}
                      placeholder="your_signal_name"
                      className={`w-full pl-9 pr-4 py-3.5 rounded-[14px] border text-[15px] transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-[#141422] border-white/5 text-white placeholder:text-[#5E607E] focus:border-white/20'
                          : 'bg-white border-gray-200/60 text-gray-900 placeholder:text-gray-400 focus:border-gray-300'
                      } ${usernameError && 'border-[#EF4444]'}`}
                    />
                  </div>
                  {usernameError && (
                    <motion.p
                      className="text-[12px] text-[#EF4444] mt-1.5 flex items-center gap-1 font-medium"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={12} />
                      {usernameError}
                    </motion.p>
                  )}
                  <p className={`text-[11px] mt-1.5 font-medium ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
                    Cannot be changed later
                  </p>
                </motion.div>
              )}

              {/* Name field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: createType === 'signal' ? 0.2 : 0.15 }}
              >
                <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`}>
                  {createType === 'room' ? 'Room Name' : 'Display Name'} <span style={{ color: themeColor }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value) validateName(e.target.value);
                  }}
                  onBlur={() => validateName(name)}
                  placeholder={createType === 'room' ? 'e.g., Team Project' : 'e.g., Tech Updates'}
                  className={`w-full px-4 py-3.5 rounded-[14px] border text-[15px] transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-[#141422] border-white/5 text-white placeholder:text-[#5E607E] focus:border-white/20'
                      : 'bg-white border-gray-200/60 text-gray-900 placeholder:text-gray-400 focus:border-gray-300'
                  } ${nameError && 'border-[#EF4444]'}`}
                />
                {nameError && (
                  <motion.p
                    className="text-[12px] text-[#EF4444] mt-1.5 flex items-center gap-1 font-medium"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={12} />
                    {nameError}
                  </motion.p>
                )}
              </motion.div>

              {/* Description field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: createType === 'signal' ? 0.25 : 0.2 }}
              >
                <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={createType === 'room' ? 'What is this room about?' : 'What will you share in this Signal?'}
                  rows={3}
                  className={`w-full px-4 py-3.5 rounded-[14px] border text-[15px] transition-all duration-200 resize-none ${
                    isDarkMode
                      ? 'bg-[#141422] border-white/5 text-white placeholder:text-[#5E607E] focus:border-white/20'
                      : 'bg-white border-gray-200/60 text-gray-900 placeholder:text-gray-400 focus:border-gray-300'
                  }`}
                />
              </motion.div>

              {/* Info Box - Room specific */}
              {createType === 'room' && (
                <motion.div
                  className={`p-3.5 rounded-[16px] border ${
                    isDarkMode
                      ? 'bg-[#141422]/50 border-white/5'
                      : 'bg-gray-50 border-gray-200/40'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={15} style={{ color: themeColor, marginTop: 1, flexShrink: 0 }} />
                    <div className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                      <span className="font-bold" style={{ color: isDarkMode ? '#FFF' : '#000' }}>About Rooms:</span> Create up to 3 rooms per day. Add members for private group conversations.
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Info Box - Signal specific */}
              {createType === 'signal' && (
                <motion.div
                  className={`p-3.5 rounded-[16px] border ${
                    isDarkMode
                      ? 'bg-[#141422]/50 border-white/5'
                      : 'bg-gray-50 border-gray-200/40'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={15} style={{ color: themeColor, marginTop: 1, flexShrink: 0 }} />
                    <div className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                      <span className="font-bold" style={{ color: isDarkMode ? '#FFF' : '#000' }}>About Signals:</span> One permanent Signal per account. Username cannot be changed after creation.
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Select Members */}
          {step === 'select-members' && (
            <motion.div
              key="select-members"
              className="pb-24"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Contacts list */}
              <div className="space-y-0.5">
                {MOCK_CONTACTS.map((contact, index) => {
                  const isSelected = selectedMembers.includes(contact.id);
                  return (
                    <motion.button
                      key={contact.id}
                      onClick={() => toggleMember(contact.id)}
                      className={`w-full px-5 py-3.5 flex items-center gap-3 transition-all duration-200 ${
                        isDarkMode
                          ? 'hover:bg-[#141422] active:bg-[#1A1A2E]'
                          : 'hover:bg-white active:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <Avatar name={contact.name} size="md" />
                        {contact.isOnline && (
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full border-2 ${
                            isDarkMode ? 'border-[#0A0A14]' : 'border-[#FAFAFA]'
                          }`} />
                        )}
                      </div>
                      <span className={`flex-1 text-left text-[15px] font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {contact.name}
                      </span>
                      <motion.div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'border-transparent'
                            : isDarkMode
                            ? 'border-white/20'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: isSelected ? themeColor : 'transparent' }}
                        animate={{ scale: isSelected ? 1 : 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          >
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Button */}
      {step !== 'select-type' && (
        <motion.div
          className={`fixed bottom-0 left-0 right-0 p-5 ${
            isDarkMode ? 'bg-[#0A0A14]/95' : 'bg-[#FAFAFA]/95'
          }`}
          style={{ backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={step === 'create-form' ? handleContinueToMembers : handleCreate}
            disabled={step === 'create-form' && !canContinue}
            className={`w-full py-4 rounded-[14px] font-bold text-white text-[15px] transition-all shadow-lg bg-gradient-to-br ${themeGradient} ${
              !canContinue && 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              boxShadow: canContinue ? `0 8px 24px ${themeColor}40` : 'none'
            }}
            whileHover={canContinue ? { scale: 1.02 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
          >
            {step === 'create-form' ? 'Continue' : `Create ${createType === 'room' ? 'Room' : 'Signal'}`}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
