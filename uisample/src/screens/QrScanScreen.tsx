import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Zap, Info, CameraOff, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ScanFrame } from '../components/ui/scan-frame';
import { GhostButton } from '../components/ui/ghost-button';
import { useCrowdStore } from '../stores/useCrowdStore';
import { useSessionStore } from '../stores/useSessionStore';
import { useChatStore } from '../stores/useChatStore';

interface QrScanScreenProps {
  onBack: () => void;
  onJoinSuccess: (crowdId: string) => void;
}

export const QrScanScreen = ({ onBack, onJoinSuccess }: QrScanScreenProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('Position QR code within frame');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { joinCrowd, crowds } = useCrowdStore();
  const { ghostName, ghostSessionId } = useSessionStore();
  const addSystemMessage = useChatStore(state => state.addSystemMessage);

  useEffect(() => {
    // Simulate camera permission check
    const timer = setTimeout(() => {
      setHasPermission(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulateScan = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanStatus('Verifying code...');

    // Find a valid crowd to join for simulation purposes
    // In a real app, this would come from the scanned QR code payload
    const crowdIds = Object.keys(crowds);
    const validCrowdId = crowdIds.length > 0 ? crowdIds[crowdIds.length - 1] : 'crowd-1';
    
    // Simulate network delay
    setTimeout(() => {
      try {
        // In real app: decode payload, validate secret, etc.
        // const payload = JSON.parse(atob(scannedCode));
        
        if (!ghostName || !ghostSessionId) throw new Error('No active session');

        joinCrowd(validCrowdId, ghostName, ghostSessionId);
        
        // Add system message
        addSystemMessage(validCrowdId, `${ghostName} joined the crowd.`, 'join');
        
        setScanStatus('Joined successfully! ✓');
        
        // Success haptic/sound would go here
        
        setTimeout(() => {
          onJoinSuccess(validCrowdId);
        }, 500);
      } catch (error) {
        setScanStatus('Failed to join crowd');
        setIsProcessing(false);
      }
    }, 1500);
  };

  const handleSelectFromGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you'd use a QR code reader library here
    // For now, simulate the process
    setScanStatus('Processing image...');
    setIsProcessing(true);

    setTimeout(() => {
      // Simulate QR detection
      const hasValidQR = Math.random() > 0.3; // 70% success rate

      if (hasValidQR) {
        // Simulate successful scan
        handleSimulateScan();
      } else {
        setScanStatus('No valid QR code found.');
        setIsProcessing(false);
        setTimeout(() => {
          setScanStatus('Position QR code within frame');
        }, 3000);
      }
    }, 1500);
  };

  if (hasPermission === null) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black">
         <div className="w-8 h-8 border-2 border-[#9B7BFF] border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-[#C5C6E3] font-medium">Initializing camera...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050509] px-6 text-center">
        <CameraOff size={64} className="text-[#5E607E] mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Camera Access Required</h2>
        <p className="text-[#C5C6E3] mb-8">
          Ghost Mode needs camera access to scan QR codes for joining crowds.
        </p>
        <GhostButton 
          variant="primary" 
          fullWidth 
          onClick={() => setHasPermission(true)}
        >
          Grant Permission
        </GhostButton>
        <button 
          onClick={onBack}
          className="mt-4 text-[#8B8CAD] text-sm font-medium hover:text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-black overflow-hidden">
      {/* Camera Preview Simulation */}
      <div className="absolute inset-0 bg-neutral-900">
        {/* Placeholder for camera feed */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-30 blur-sm" />
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 flex-1 flex flex-col pt-12 pb-8 px-6 justify-between">
        
        {/* Top Controls */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-md"
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
          
          <button 
            onClick={() => setIsFlashlightOn(!isFlashlightOn)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-md ${isFlashlightOn ? 'bg-[#9B7BFF]/80 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}
            aria-label="Toggle flashlight"
          >
            <Zap size={20} fill={isFlashlightOn ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Center Frame */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <ScanFrame size={280} />
          
          <motion.p 
            key={scanStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 text-[16px] font-semibold text-center px-4 py-2 rounded-full backdrop-blur-md ${
              scanStatus.includes('success') 
                ? 'text-[#5BE7A9] bg-[#5BE7A9]/10' 
                : 'text-white text-shadow-sm'
            }`}
          >
            {scanStatus}
          </motion.p>
          
          {/* Debug/Simulation Button */}
          <button
            onClick={handleSimulateScan}
            disabled={isProcessing}
            className="mt-8 px-6 py-3 bg-[#9B7BFF]/20 border border-[#9B7BFF]/50 rounded-xl text-[#9B7BFF] font-medium text-sm hover:bg-[#9B7BFF]/30 transition-all active:scale-95 backdrop-blur-sm"
          >
            {isProcessing ? 'Scanning...' : 'Tap to Simulate Scan'}
          </button>

          {/* Select from Gallery Button */}
          <button
            onClick={handleSelectFromGallery}
            className="mt-4 w-full bg-[#141422] border border-[rgba(255,255,255,0.1)] text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 hover:bg-[#1A1A2E] transition-colors"
          >
            <ImageIcon size={20} className="text-[#9B7BFF]" />
            <span className="font-medium">Select from Gallery</span>
          </button>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Bottom Hint */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 border border-white/5">
          <Info size={20} className="text-[#9B7BFF] shrink-0" />
          <p className="text-[13px] text-white/90 leading-tight">
            Scan a Ghost Mode crowd QR code to join.
          </p>
        </div>
      </div>
    </div>
  );
};