import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ChevronLeft, Info, ArrowRight } from 'lucide-react';
import { TopNavBar } from '../components/ui/top-nav-bar';
import { GhostInput } from '../components/ui/ghost-input';
import { GhostButton } from '../components/ui/ghost-button';
import { SegmentedControl } from '../components/ui/segmented-control';
import { useCrowdStore } from '../stores/useCrowdStore';
import { useSessionStore } from '../stores/useSessionStore';
import { addDays, format } from 'date-fns';
import { filterMessage } from '../utils/contentFilter';
import { ContentFilterModal } from '../components/moderation/ContentFilterModal';

const CrowdCreateSchema = z.object({
  crowdName: z.string()
    .min(2, 'Crowd name is too short.')
    .max(40, 'Crowd name is too long.')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Use only letters, numbers, spaces, - or _.')
    .refine(val => {
      // Content filter check
      const filterResult = filterMessage(val);
      return !filterResult.shouldHide;
    }, { message: 'This name contains inappropriate content.' })
    .transform(val => val.trim()),
  durationIndex: z.number().min(0).max(4)
});

type FormData = z.infer<typeof CrowdCreateSchema>;

interface CreateCrowdScreenProps {
  onSuccess: (crowdId: string) => void;
  onBack: () => void;
}

const DURATIONS_DAYS = [1, 3, 7, 15, 31];
const DURATION_LABELS = ['1 day', '3 days', '7 days', '15 days', '31 days'];

export const CreateCrowdScreen = ({ onSuccess, onBack }: CreateCrowdScreenProps) => {
  const createCrowd = useCrowdStore(state => state.createCrowd);
  const { ghostName, ghostSessionId, canCreateCrowd, incrementCrowdCreation, crowdsCreatedToday } = useSessionStore();
  const [creationError, setCreationError] = React.useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'scam' | 'sexual' | 'hate' | 'violence' | 'drugs' | 'personal_info'>('scam');
  const [filterReason, setFilterReason] = useState<string>('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(CrowdCreateSchema),
    defaultValues: {
      crowdName: '',
      durationIndex: 2 // Default to 7 days
    },
    mode: 'onChange'
  });

  const durationIndex = watch('durationIndex');
  const durationDays = DURATIONS_DAYS[durationIndex];
  const expiryDate = addDays(new Date(), durationDays);

  // Show filter modal when there's a filter error
  useEffect(() => {
    if (errors.crowdName?.message === "This name contains inappropriate content.") {
      const value = watch('crowdName');
      if (value) {
        const filterResult = filterMessage(value);
        if (filterResult.shouldHide && filterResult.category) {
          setFilterCategory(filterResult.category);
          setFilterReason(filterResult.flagReason || 'Contains inappropriate content');
          setFilterModalOpen(true);
        }
      }
    }
  }, [errors.crowdName, watch]);

  const onSubmit = (data: FormData) => {
    if (!ghostName || !ghostSessionId) return;
    
    // Check daily crowd creation limit
    if (!canCreateCrowd()) {
      setCreationError('Daily crowd creation limit reached. You can create up to 3 crowds per day.');
      return;
    }
    
    setCreationError(null);
    
    // Simulate API delay
    setTimeout(() => {
      const selectedDuration = DURATIONS_DAYS[data.durationIndex];
      const newCrowdId = createCrowd(data.crowdName, selectedDuration, ghostName, ghostSessionId);
      incrementCrowdCreation();
      onSuccess(newCrowdId);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426]"
      aria-label="Create a new crowd"
    >
      <TopNavBar 
        title="Create Crowd" 
        onBack={onBack}
        className="bg-transparent border-b-0"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col px-6 pt-4">
        {/* Crowd Name Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GhostInput
            {...register('crowdName')}
            label="Crowd Name"
            placeholder="Enter crowd name"
            error={errors.crowdName?.message}
            autoFocus
            maxLength={40}
            data-testid="crowd-name-input"
          />
          <p className="text-[12px] text-[#5E607E] mt-2 ml-1">
            This name will be visible to all crowd members.
          </p>
        </motion.div>

        {/* Duration Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <label className="text-sm font-semibold text-[#8B8CAD] mb-3 block ml-1">
            Duration
          </label>
          <SegmentedControl
            values={DURATION_LABELS}
            selectedIndex={durationIndex}
            onChange={(idx) => setValue('durationIndex', idx)}
            className="mb-3"
          />
          <p className="text-[12px] text-[#5E607E] text-center">
            Crowd will expire on {format(expiryDate, 'MMM d, yyyy')} at {format(expiryDate, 'h:mm a')}
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141422] rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] mb-auto"
        >
          <div className="flex items-center mb-3 text-white">
            <Info size={16} className="text-[#9B7BFF] mr-2" />
            <span className="font-semibold text-sm">About Crowds</span>
          </div>
          <ul className="space-y-2">
            <li className="text-[13px] text-[#C5C6E3] leading-[18px] flex items-start">
              <span className="mr-2">•</span>
              Crowds are temporary and expire after the selected duration
            </li>
            <li className="text-[13px] text-[#C5C6E3] leading-[18px] flex items-start">
              <span className="mr-2"></span>
              Share the QR code to invite members
            </li>
            <li className="text-[13px] text-[#C5C6E3] leading-[18px] flex items-start">
              <span className="mr-2">•</span>
              Only the creator can delete the crowd before expiry
            </li>
             <li className="text-[13px] text-[#C5C6E3] leading-[18px] flex items-start">
              <span className="mr-2">•</span>
              All data is deleted after expiry
            </li>
          </ul>
        </motion.div>

        {/* Footer */}
        <div className="pb-8 pt-4">
          <GhostButton 
            fullWidth 
            size="lg" 
            type="submit"
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            iconRight={<ArrowRight size={20} />}
            data-testid="create-crowd-button"
            aria-label="Create crowd and generate QR code"
          >
            Create & Generate QR
          </GhostButton>
          {creationError && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {creationError}
            </p>
          )}
        </div>
      </form>

      {/* Content Filter Modal */}
      <ContentFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        category={filterCategory}
        flagReason={filterReason}
        context="crowd-name"
      />
    </motion.div>
  );
};