import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Image as ImageIcon, Camera, FileText, X, Check, ArrowLeft } from 'lucide-react@0.487.0';

interface MediaShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (mediaType: 'image' | 'video' | 'file', mediaUrl: string, mediaName: string, caption?: string) => void;
  isAdmin: boolean;
}

// Mock image gallery
const MOCK_GALLERY_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&h=400&fit=crop', name: 'landscape.jpg' },
  { id: '2', url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=400&fit=crop', name: 'cityscape.jpg' },
  { id: '3', url: 'https://images.unsplash.com/photo-1682695796497-31a44224d6d6?w=400&h=400&fit=crop', name: 'sunset.jpg' },
  { id: '4', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop', name: 'abstract.jpg' },
  { id: '5', url: 'https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&h=400&fit=crop', name: 'nature.jpg' },
  { id: '6', url: 'https://images.unsplash.com/photo-1682687982029-b7ea8a5e5e1a?w=400&h=400&fit=crop', name: 'architecture.jpg' },
];

const MOCK_FILES = [
  { id: '1', name: 'Project_Proposal.pdf', size: '2.4 MB', type: 'file' as const },
  { id: '2', name: 'Budget_2024.xlsx', size: '1.2 MB', type: 'file' as const },
  { id: '3', name: 'Meeting_Notes.docx', size: '850 KB', type: 'file' as const },
];

export const MediaShareSheet = ({ open, onOpenChange, onSend, isAdmin }: MediaShareSheetProps) => {
  const [flow, setFlow] = useState<'options' | 'gallery' | 'camera' | 'files' | 'preview'>('options');
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video' | 'file'; url: string; name: string} | null>(null);
  const [caption, setCaption] = useState('');

  const handleClose = () => {
    setFlow('options');
    setSelectedMedia(null);
    setCaption('');
    onOpenChange(false);
  };

  const handleBack = () => {
    if (flow === 'preview') {
      // Go back to the previous selection screen
      if (selectedMedia?.type === 'image') {
        setFlow('gallery');
      } else if (selectedMedia?.type === 'file') {
        setFlow('files');
      } else {
        setFlow('camera');
      }
      setSelectedMedia(null);
      setCaption('');
    } else {
      setFlow('options');
    }
  };

  const handleSelectImage = (url: string, name: string) => {
    setSelectedMedia({ type: 'image', url, name });
    setFlow('preview');
  };

  const handleSelectFile = (name: string) => {
    // Mock file URL
    setSelectedMedia({ type: 'file', url: '#', name });
    setFlow('preview');
  };

  const handleCameraCapture = () => {
    // Mock camera capture
    setSelectedMedia({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&h=600&fit=crop',
      name: 'camera_capture.jpg'
    });
    setFlow('preview');
  };

  const handleSend = () => {
    if (selectedMedia) {
      onSend(selectedMedia.type, selectedMedia.url, selectedMedia.name, caption);
      handleClose();
    }
  };

  if (!isAdmin) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[80vh] bg-[#0A0A14] border-t border-[rgba(255,255,255,0.1)] text-white rounded-t-3xl"
      >
        <SheetHeader className="relative">
          {flow !== 'options' && (
            <button
              onClick={handleBack}
              className="absolute left-0 top-0 p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <SheetTitle className="text-white text-xl text-center">
            {flow === 'options' && 'Share Media'}
            {flow === 'gallery' && 'Select Photo'}
            {flow === 'camera' && 'Take Photo'}
            {flow === 'files' && 'Select File'}
            {flow === 'preview' && 'Preview & Send'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {flow === 'options' && 'Choose a media type to share in the chat'}
            {flow === 'gallery' && 'Select a photo from your gallery to share'}
            {flow === 'camera' && 'Take a photo to share in the chat'}
            {flow === 'files' && 'Select a file to share in the chat'}
            {flow === 'preview' && 'Preview and send your selected media'}
          </SheetDescription>
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </SheetHeader>

        <div className="mt-6 h-[calc(100%-80px)] overflow-y-auto">
          {/* Media Options */}
          {flow === 'options' && (
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setFlow('gallery')}
                className="w-full flex items-center gap-4 p-4 bg-[#141422] rounded-xl hover:bg-[#1A1A2E] transition-colors"
              >
                <div className="w-12 h-12 bg-[#9B7BFF]/20 rounded-full flex items-center justify-center">
                  <ImageIcon className="text-[#9B7BFF]" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">Gallery / Photos</p>
                  <p className="text-sm text-[#8B8CAD]">Choose from your photos</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setFlow('camera')}
                className="w-full flex items-center gap-4 p-4 bg-[#141422] rounded-xl hover:bg-[#1A1A2E] transition-colors"
              >
                <div className="w-12 h-12 bg-[#9B7BFF]/20 rounded-full flex items-center justify-center">
                  <Camera className="text-[#9B7BFF]" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">Camera</p>
                  <p className="text-sm text-[#8B8CAD]">Take a new photo</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setFlow('files')}
                className="w-full flex items-center gap-4 p-4 bg-[#141422] rounded-xl hover:bg-[#1A1A2E] transition-colors"
              >
                <div className="w-12 h-12 bg-[#9B7BFF]/20 rounded-full flex items-center justify-center">
                  <FileText className="text-[#9B7BFF]" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">Files / Documents</p>
                  <p className="text-sm text-[#8B8CAD]">Share documents and files</p>
                </div>
              </motion.button>
            </div>
          )}

          {/* Gallery Grid */}
          {flow === 'gallery' && (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {MOCK_GALLERY_IMAGES.map((img) => (
                  <motion.button
                    key={img.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectImage(img.url, img.name)}
                    className="aspect-square rounded-lg overflow-hidden bg-[#141422] hover:ring-2 hover:ring-[#9B7BFF] transition-all"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Camera */}
          {flow === 'camera' && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-full max-w-md aspect-[4/3] bg-[#141422] rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9B7BFF]/20 to-[#7B5CFF]/20 flex items-center justify-center">
                  <Camera size={64} className="text-[#9B7BFF] opacity-50" />
                </div>
                <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-[#8B8CAD]">
                  Camera preview (prototype)
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCameraCapture}
                className="w-20 h-20 bg-[#9B7BFF] rounded-full flex items-center justify-center border-4 border-white/20"
              >
                <div className="w-16 h-16 bg-white rounded-full" />
              </motion.button>
            </div>
          )}

          {/* Files List */}
          {flow === 'files' && (
            <div className="space-y-2">
              {MOCK_FILES.map((file) => (
                <motion.button
                  key={file.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectFile(file.name)}
                  className="w-full flex items-center gap-4 p-4 bg-[#141422] rounded-xl hover:bg-[#1A1A2E] transition-colors"
                >
                  <div className="w-12 h-12 bg-[#9B7BFF]/20 rounded-lg flex items-center justify-center">
                    <FileText className="text-[#9B7BFF]" size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-[#8B8CAD]">{file.size}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Preview & Send */}
          {flow === 'preview' && selectedMedia && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex-1 bg-[#141422] rounded-xl overflow-hidden flex items-center justify-center">
                {selectedMedia.type === 'image' && (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                {selectedMedia.type === 'file' && (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <div className="w-24 h-24 bg-[#9B7BFF]/20 rounded-2xl flex items-center justify-center">
                      <FileText className="text-[#9B7BFF]" size={48} />
                    </div>
                    <p className="font-medium text-center">{selectedMedia.name}</p>
                  </div>
                )}
              </div>

              {/* Caption Input */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption (optional)..."
                  className="w-full bg-[#141422] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-[#9B7BFF] placeholder:text-[#5E607E]"
                />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="flex-1 bg-[#141422] text-white py-4 rounded-full hover:bg-[#1A1A2E] transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    <span>Cancel</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="flex-1 bg-[#9B7BFF] text-white py-4 rounded-full hover:bg-[#8B6BEF] transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    <span>Send</span>
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};