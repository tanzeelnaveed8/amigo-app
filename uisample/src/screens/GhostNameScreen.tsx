import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Dice5 } from 'lucide-react';
import { GhostButton } from '../components/ui/ghost-button';
import { GhostInput } from '../components/ui/ghost-input';
import { Avatar } from '../components/ui/avatar';
import { useSessionStore } from '../stores/useSessionStore';
import { filterUsername } from '../utils/contentFilter';
import { ContentFilterModal } from '../components/moderation/ContentFilterModal';

const GhostNameSchema = z.object({
  ghostName: z.string()
    .min(2, "Ghost name is too short.")
    .max(20, "Ghost name is too long.")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Use only letters, numbers, spaces, - or _.")
    .refine(val => !val.includes('@'), { message: "Ghost names cannot look like email addresses." })
    .refine(val => !/\d{10,}/.test(val), { message: "Ghost names cannot look like phone numbers." })
    .refine(val => {
      // Content filter check
      const filterResult = filterUsername(val);
      return filterResult.isValid;
    }, { message: "This name contains inappropriate content." })
    .transform(val => val.trim())
});

type FormData = z.infer<typeof GhostNameSchema>;

interface GhostNameScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const ADJECTIVES = ['Silent', 'Hidden', 'Misty', 'Neon', 'Cosmic', 'Shadow', 'Rapid', 'Bright', 'Digital', 'Solar'];
const NOUNS = ['Walker', 'Signal', 'Echo', 'Viper', 'Orbit', 'Drifter', 'Phantom', 'Spark', 'Nomad', 'Surfer'];

// Expanded ghost name variety
const MYSTERIOUS_NAMES = ['SilentEcho', 'VoidWalker', 'NightPulse', 'DarkMyst', 'PhantomShade', 'MysticDrift', 'ShadowWhisper'];
const FUN_NAMES = ['NovaShade', 'BluePhantom', 'FrostGhost', 'NeonGlitch', 'CosmicVibe', 'StarGhost', 'LunarEcho'];
const MINIMAL_NAMES = ['Ghost', 'Echo', 'Shade', 'Mist', 'Void', 'Pulse', 'Drift'];

const generateRandomGhostName = (): string => {
  const type = Math.floor(Math.random() * 4);
  const number = Math.floor(Math.random() * 999);
  
  switch (type) {
    case 0: // Mysterious
      return MYSTERIOUS_NAMES[Math.floor(Math.random() * MYSTERIOUS_NAMES.length)];
    case 1: // Fun
      return FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
    case 2: // Minimal with number
      return `${MINIMAL_NAMES[Math.floor(Math.random() * MINIMAL_NAMES.length)]}_${number}`;
    default: // Traditional compound
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      return `${adj}${noun}`;
  }
};

export const GhostNameScreen = ({ onContinue, onBack }: GhostNameScreenProps) => {
  const enterGhostMode = useSessionStore(state => state.enterGhostMode);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'scam' | 'sexual' | 'hate' | 'violence' | 'drugs' | 'personal_info'>('scam');
  const [filterReason, setFilterReason] = useState<string>('');
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(GhostNameSchema),
    mode: 'onChange'
  });

  const ghostNameValue = watch('ghostName');

  const onSubmit = (data: FormData) => {
    enterGhostMode(data.ghostName);
    onContinue();
  };

  const generateRandomName = () => {
    const newName = generateRandomGhostName();
    setValue('ghostName', newName, { shouldValidate: true });
  };

  // Show filter modal when there's a filter error
  useEffect(() => {
    if (errors.ghostName?.message === "This name contains inappropriate content.") {
      const value = watch('ghostName');
      if (value) {
        const filterResult = filterUsername(value);
        if (!filterResult.isValid && filterResult.reason) {
          // Try to get the full filter result to show category
          const fullFilter = require('../utils/contentFilter').filterMessage(value);
          if (fullFilter.category) {
            setFilterCategory(fullFilter.category);
            setFilterReason(fullFilter.flagReason || filterResult.reason);
            setFilterModalOpen(true);
          }
        }
      }
    }
  }, [errors.ghostName, watch]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] px-6 pt-12 pb-8 justify-between"
      aria-label="Choose your ghost name"
    >
      {/* Top Bar */}
      <div className="w-full pt-2">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-[#C5C6E3] hover:text-white transition-colors"
          aria-label="Go back to ghost intro"
        >
          <ChevronLeft size={28} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold text-white mb-2">
            Choose Your Ghost Name
          </h1>
          <p className="text-[14px] text-[#C5C6E3]">
            This is how others will see you in crowds. You can change it anytime.
          </p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={ghostNameValue || 'placeholder'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar 
                name={ghostNameValue || 'Ghost'} 
                size="xl" 
                showStatus={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="space-y-4">
            <GhostInput
              {...register('ghostName')}
              placeholder="Enter ghost name"
              error={errors.ghostName?.message}
              autoFocus
              className="text-center text-[22px]"
              maxLength={20}
              data-testid="ghost-name-input"
              aria-label="Ghost name input field"
            />
            
            <button
              type="button"
              onClick={generateRandomName}
              className="flex items-center justify-center w-full text-[#9B7BFF] text-sm font-medium hover:text-[#B88DFF] transition-colors py-2"
              data-testid="random-name-button"
              aria-label="Generate a random ghost name"
            >
              <Dice5 size={16} className="mr-2" />
              Random Name
            </button>
          </div>

          <div className="pt-4">
            <p className="text-[12px] text-[#8B8CAD] text-center mb-6 leading-[16px]">
              Ghost names can be 2-20 characters. Use letters, numbers, spaces, - or _.
            </p>
          </div>
        </form>
      </div>

      <div className="w-full max-w-md mx-auto">
        <GhostButton 
          fullWidth 
          onClick={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          data-testid="ghost-name-continue-button"
          aria-label="Continue with chosen ghost name"
        >
          Continue
        </GhostButton>
      </div>

      {/* Content Filter Modal */}
      <ContentFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        category={filterCategory}
        flagReason={filterReason}
        context="username"
      />
    </motion.div>
  );
};