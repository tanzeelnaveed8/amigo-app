import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Ban, VolumeX, Flag, Eye, EyeOff, Clock, User, X } from 'lucide-react';
import { useModerationStore } from '../../stores/useModerationStore';
import { useCrowdStore } from '../../stores/useCrowdStore';
import { useChatStore } from '../../stores/useChatStore';
import { GhostButton } from '../ui/ghost-button';
import { formatDistanceToNow } from 'date-fns';

interface SafetyPanelProps {
  crowdId: string;
  onClose: () => void;
}

export const SafetyPanel = ({ crowdId, onClose }: SafetyPanelProps) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'flagged' | 'bans' | 'mutes'>('reports');
  
  const reports = useModerationStore(state => state.getReportsForCrowd(crowdId));
  const flaggedMessages = useModerationStore(state => state.getFlaggedMessagesForCrowd(crowdId));
  const bannedUsers = useModerationStore(state => state.getBannedUsersForCrowd(crowdId));
  const mutedUsers = useModerationStore(state => state.getMutedUsersForCrowd(crowdId));
  const ignoreReport = useModerationStore(state => state.ignoreReport);
  const unbanUser = useModerationStore(state => state.unbanUser);
  const unmuteUser = useModerationStore(state => state.unmuteUser);
  
  const messages = useChatStore(state => state.messagesByCrowdId[crowdId] || []);

  const tabs = [
    { id: 'reports', label: 'Reports', count: reports.messages.length + reports.crowds.length, icon: Flag },
    { id: 'flagged', label: 'Flagged', count: flaggedMessages.length, icon: AlertTriangle },
    { id: 'bans', label: 'Bans', count: bannedUsers.length, icon: Ban },
    { id: 'mutes', label: 'Mutes', count: mutedUsers.length, icon: VolumeX },
  ];

  const getMessageText = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    return msg?.text || '[Message not found]';
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-gradient-to-b from-[#050509] to-[#141426] z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#0A0A14]/80 backdrop-blur-xl border-b border-[rgba(155,123,255,0.2)] sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9B7BFF]/10 border border-[rgba(155,123,255,0.3)] flex items-center justify-center">
              <Shield size={20} className="text-[#9B7BFF]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white">
                Safety & Moderation
              </h2>
              <p className="text-[12px] text-[#8B8CAD]">
                Admin controls for this crowd
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pb-3 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#9B7BFF]/20 border border-[#9B7BFF]/50 text-white shadow-[0_0_16px_rgba(155,123,255,0.2)]'
                    : 'bg-[#141422] border border-[rgba(255,255,255,0.05)] text-[#8B8CAD] hover:text-white hover:border-[rgba(155,123,255,0.3)]'
                }`}
              >
                <Icon size={16} />
                <span className="text-[14px] font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    activeTab === tab.id
                      ? 'bg-[#9B7BFF] text-white'
                      : 'bg-[#5E607E] text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-140px)] px-6 py-6">
        <AnimatePresence mode="wait">
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {reports.messages.length === 0 && reports.crowds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#141422] border border-[rgba(155,123,255,0.2)] flex items-center justify-center mx-auto mb-4">
                    <Flag size={24} className="text-[#8B8CAD]" />
                  </div>
                  <p className="text-[#8B8CAD] text-[14px]">No pending reports</p>
                </div>
              ) : (
                <>
                  {/* Message Reports */}
                  {reports.messages.map(report => (
                    <div
                      key={report.id}
                      className="bg-[#141422] border border-[rgba(255,99,99,0.3)] rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Flag size={14} className="text-[#FF6363]" />
                            <span className="text-[12px] font-semibold text-[#FF6363] uppercase">
                              {report.reason.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="bg-[#0A0A14] border border-[rgba(255,255,255,0.05)] rounded-lg p-3 mb-2">
                            <p className="text-[13px] text-[#C5C6E3] italic line-clamp-3">
                              "{getMessageText(report.messageId)}"
                            </p>
                          </div>
                          {report.details && (
                            <p className="text-[12px] text-[#8B8CAD] mb-2">
                              Details: {report.details}
                            </p>
                          )}
                          <p className="text-[11px] text-[#5E607E]">
                            Reported by {report.reportedByName} · {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => ignoreReport(report.id, 'message')}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#1A1A2E] border border-[rgba(255,255,255,0.05)] text-[#8B8CAD] hover:text-white text-[13px] font-medium transition-colors"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Crowd Reports */}
                  {reports.crowds.map(report => (
                    <div
                      key={report.id}
                      className="bg-[#141422] border border-[rgba(255,99,99,0.3)] rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Flag size={14} className="text-[#FF6363]" />
                            <span className="text-[12px] font-semibold text-[#FF6363] uppercase">
                              Crowd Report - {report.reason.replace('_', ' ')}
                            </span>
                          </div>
                          {report.details && (
                            <p className="text-[13px] text-[#C5C6E3] mb-2">
                              {report.details}
                            </p>
                          )}
                          <p className="text-[11px] text-[#5E607E]">
                            Reported by {report.reportedByName} · {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => ignoreReport(report.id, 'crowd')}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#1A1A2E] border border-[rgba(255,255,255,0.05)] text-[#8B8CAD] hover:text-white text-[13px] font-medium transition-colors"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* Flagged Messages Tab */}
          {activeTab === 'flagged' && (
            <motion.div
              key="flagged"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {flaggedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#141422] border border-[rgba(155,123,255,0.2)] flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} className="text-[#8B8CAD]" />
                  </div>
                  <p className="text-[#8B8CAD] text-[14px]">No flagged messages</p>
                </div>
              ) : (
                flaggedMessages.map(flag => (
                  <div
                    key={flag.messageId}
                    className="bg-[#141422] border border-[rgba(251,191,36,0.3)] rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-[#FBBF24]" />
                      <span className="text-[12px] font-semibold text-[#FBBF24]">
                        AUTO-FLAGGED
                      </span>
                    </div>
                    <div className="bg-[#0A0A14] border border-[rgba(255,255,255,0.05)] rounded-lg p-3">
                      <p className="text-[13px] text-[#C5C6E3] line-clamp-3">
                        {getMessageText(flag.messageId)}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#5E607E]">
                      Keywords: {flag.keywords.join(', ')} · {formatDistanceToNow(flag.flaggedAt, { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Banned Users Tab */}
          {activeTab === 'bans' && (
            <motion.div
              key="bans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {bannedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#141422] border border-[rgba(155,123,255,0.2)] flex items-center justify-center mx-auto mb-4">
                    <Ban size={24} className="text-[#8B8CAD]" />
                  </div>
                  <p className="text-[#8B8CAD] text-[14px]">No banned users</p>
                </div>
              ) : (
                bannedUsers.map(ban => (
                  <div
                    key={ban.ghostSessionId}
                    className="bg-[#141422] border border-[rgba(255,99,99,0.2)] rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-white mb-1">
                        {ban.ghostName}
                      </p>
                      <p className="text-[11px] text-[#5E607E]">
                        Banned {formatDistanceToNow(ban.bannedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={() => unbanUser(crowdId, ban.ghostSessionId)}
                      className="px-4 py-2 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] hover:bg-[#4ADE80]/20 text-[13px] font-medium transition-colors"
                    >
                      Unban
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Muted Users Tab */}
          {activeTab === 'mutes' && (
            <motion.div
              key="mutes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {mutedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#141422] border border-[rgba(155,123,255,0.2)] flex items-center justify-center mx-auto mb-4">
                    <VolumeX size={24} className="text-[#8B8CAD]" />
                  </div>
                  <p className="text-[#8B8CAD] text-[14px]">No muted users</p>
                </div>
              ) : (
                mutedUsers.map(mute => (
                  <div
                    key={mute.ghostSessionId}
                    className="bg-[#141422] border border-[rgba(251,191,36,0.2)] rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-white mb-1">
                        {mute.ghostName}
                      </p>
                      <p className="text-[11px] text-[#5E607E]">
                        {mute.mutedUntil 
                          ? `Until ${formatDistanceToNow(mute.mutedUntil, { addSuffix: true })}`
                          : 'Muted permanently'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => unmuteUser(crowdId, mute.ghostSessionId)}
                      className="px-4 py-2 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] hover:bg-[#4ADE80]/20 text-[13px] font-medium transition-colors"
                    >
                      Unmute
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
