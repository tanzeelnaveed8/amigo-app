import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, Heart, Users, AlertTriangle, Ban, Eye, ExternalLink } from 'lucide-react';
import { TopNavBar } from '../components/ui/top-nav-bar';

interface CommunityGuidelinesScreenProps {
  onBack: () => void;
}

export const CommunityGuidelinesScreen = ({ onBack }: CommunityGuidelinesScreenProps) => {
  const guidelines = [
    {
      icon: Heart,
      title: 'Be Respectful',
      description: 'Treat everyone with kindness and respect. No harassment, bullying, or hate speech of any kind.',
      color: '#4ADE80'
    },
    {
      icon: Shield,
      title: 'Stay Safe',
      description: 'Never share personal information like phone numbers, addresses, or financial details in crowds.',
      color: '#3B82F6'
    },
    {
      icon: Ban,
      title: 'No Spam or Scams',
      description: 'Don\'t send unwanted promotional content, scams, or fraudulent schemes. Respect others\' time.',
      color: '#FF6363'
    },
    {
      icon: Users,
      title: 'Keep it Anonymous',
      description: 'Ghost Mode is designed for anonymity. Don\'t pressure others to reveal their identity.',
      color: '#9B7BFF'
    },
    {
      icon: AlertTriangle,
      title: 'Report Issues',
      description: 'If you see something inappropriate, report it. Help us keep the community safe for everyone.',
      color: '#FBBF24'
    },
    {
      icon: Eye,
      title: 'Child Safety',
      description: 'Ghost Mode is for users 13+. Any content exploiting minors will result in immediate action.',
      color: '#FF6363'
    },
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426]"
    >
      <TopNavBar 
        title="Community Guidelines" 
        onBack={onBack}
        className="bg-transparent border-b-0"
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.5,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#9B7BFF] rounded-full blur-2xl"
              />
              <div className="relative bg-[#141422] p-4 rounded-full border border-[rgba(155,123,255,0.3)] shadow-[0_0_30px_rgba(155,123,255,0.3)]">
                <Shield size={32} className="text-[#9B7BFF] drop-shadow-[0_0_12px_rgba(155,123,255,0.9)]" />
              </div>
            </div>
          </div>
          <h1 className="text-[24px] font-bold text-white mb-3">
            Community Guidelines
          </h1>
          <p className="text-[14px] text-[#C5C6E3] leading-relaxed max-w-md mx-auto">
            Ghost Mode is built on trust and respect. Follow these guidelines to keep our community safe and welcoming.
          </p>
        </motion.div>

        {/* Guidelines */}
        <div className="space-y-4">
          {guidelines.map((guideline, index) => {
            const Icon = guideline.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-[#141422] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:border-[rgba(155,123,255,0.3)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
                    style={{
                      backgroundColor: `${guideline.color}15`,
                      borderColor: `${guideline.color}40`,
                      boxShadow: `0 0 20px ${guideline.color}20`
                    }}
                  >
                    <Icon 
                      size={22} 
                      style={{ color: guideline.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-white mb-2">
                      {guideline.title}
                    </h3>
                    <p className="text-[14px] text-[#C5C6E3] leading-relaxed">
                      {guideline.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enforcement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#FF6363]/10 border border-[rgba(255,99,99,0.3)] rounded-2xl p-5 mt-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#FF6363] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-[15px] font-semibold text-white mb-2">
                Enforcement
              </h3>
              <p className="text-[13px] text-[#C5C6E3] leading-relaxed mb-3">
                Violations may result in:
              </p>
              <ul className="space-y-1.5">
                <li className="text-[13px] text-[#C5C6E3] flex items-start gap-2">
                  <span className="text-[#FF6363] mt-0.5">•</span>
                  <span>Warning from admins</span>
                </li>
                <li className="text-[13px] text-[#C5C6E3] flex items-start gap-2">
                  <span className="text-[#FF6363] mt-0.5">•</span>
                  <span>Temporary mute (1-24 hours)</span>
                </li>
                <li className="text-[13px] text-[#C5C6E3] flex items-start gap-2">
                  <span className="text-[#FF6363] mt-0.5">•</span>
                  <span>Permanent ban from crowd</span>
                </li>
                <li className="text-[13px] text-[#C5C6E3] flex items-start gap-2">
                  <span className="text-[#FF6363] mt-0.5">•</span>
                  <span>Account suspension (for severe violations)</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Full Policy Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4 pb-8"
        >
          <a
            href="https://example.com/community-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#141422] border border-[rgba(155,123,255,0.2)] hover:border-[#9B7BFF] hover:bg-[#1A1A2E] transition-all group"
          >
            <ExternalLink size={18} className="text-[#9B7BFF] group-hover:drop-shadow-[0_0_8px_rgba(155,123,255,0.8)]" />
            <span className="text-[14px] font-medium text-white">
              View Full Community Guidelines
            </span>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};
