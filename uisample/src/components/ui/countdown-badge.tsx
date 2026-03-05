import React, { useState, useEffect } from 'react';
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CountdownBadgeProps {
  expiresAt: Date;
  size?: 'default' | 'compact';
  className?: string;
}

export const CountdownBadge = ({ expiresAt, size = 'default', className }: CountdownBadgeProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState<'normal' | 'warning' | 'error' | 'expired'>('normal');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = differenceInSeconds(expiresAt, now);

      if (diff <= 0) {
        setTimeLeft('Expired');
        setStatus('expired');
        return;
      }

      if (diff < 300) { // < 5 mins
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeLeft(`Expires in ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setStatus('error');
      } else if (diff < 3600) { // < 1 hour
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeLeft(`Expires in ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setStatus('warning');
      } else if (diff < 86400) { // < 1 day
        const hours = differenceInHours(expiresAt, now);
        const mins = differenceInMinutes(expiresAt, now) % 60;
        setTimeLeft(`Expires in ${hours}h ${mins}m`);
        setStatus('normal');
      } else {
        const days = differenceInDays(expiresAt, now);
        setTimeLeft(`Expires in ${days} day${days !== 1 ? 's' : ''}`);
        setStatus('normal');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const colors = {
    normal: 'text-[#C5C6E3] bg-[#272740]',
    warning: 'text-[#FBBF24] bg-[#FBBF24]/10',
    error: 'text-[#FF6363] bg-[#FF6363]/10',
    expired: 'text-[#8B8CAD] bg-[#272740]',
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full font-medium transition-colors",
      colors[status],
      size === 'compact' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      className
    )}>
      <Clock size={size === 'compact' ? 10 : 12} className="mr-1.5 opacity-80" />
      {timeLeft}
    </div>
  );
};
