import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  children?: React.ReactNode;
}

export const Avatar = ({ name, size = 'md', className, showStatus = false, children }: AvatarProps) => {
  // If no name is provided but children are, act as a container (Shadcn style)
  if (!name && children) {
    return (
      <div className={cn("relative flex shrink-0 overflow-hidden rounded-full", className)}>
        {children}
      </div>
    );
  }

  // Fallback to old behavior if name is provided (or neither, though that shouldn't happen)
  const safeName = name || '?';
  const initials = safeName
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color based on name
  const colors = [
    'bg-purple-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-pink-600',
    'bg-teal-600',
    'bg-cyan-600',
  ];
  const colorIndex = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  const containerSizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const sizeClass = containerSizes[size] || containerSizes.md;

  return (
    <div className={cn("relative inline-flex rounded-full", sizeClass, className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white shadow-inner w-full h-full",
          bgColor,
          textSizes[size] || textSizes.md
        )}
      >
        {initials}
      </div>
      {showStatus && (
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-[#4ADE80] ring-2 ring-[#050509]" />
      )}
    </div>
  );
};

export const AvatarImage = ({ src, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img 
      src={src} 
      className={cn("aspect-square h-full w-full object-cover", className)} 
      {...props} 
    />
  );
};

export const AvatarFallback = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
