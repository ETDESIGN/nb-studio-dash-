import React from 'react';
import clsx from 'clsx';
import { MoreHorizontal } from 'lucide-react';

export interface WidgetFrameProps {
  title?: string;
  subtitle?: string; // Added for the new design
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType; // Optional icon for the header
  hoverColor?: 'emerald' | 'cyan' | 'amber' | 'red';
  headerRight?: React.ReactNode;
}

export const WidgetFrame: React.FC<WidgetFrameProps> = ({ 
  title, 
  subtitle,
  children, 
  className = '',
  icon: Icon,
  hoverColor = 'emerald',
  headerRight
}) => {
  const hoverClasses = {
    emerald: 'hover:border-emerald-500/30',
    cyan: 'hover:border-cyan-500/30',
    amber: 'hover:border-amber-500/30',
    red: 'hover:border-red-500/30',
  };
  
  const iconColors = {
    emerald: 'group-hover:text-emerald-500',
    cyan: 'group-hover:text-cyan-500',
    amber: 'group-hover:text-amber-500',
    red: 'group-hover:text-red-500',
  };

  return (
    <div className={clsx(
      'border border-slate-800 bg-slate-900/50 rounded-lg overflow-hidden flex flex-col',
      'group transition-all duration-300',
      hoverClasses[hoverColor],
      className
    )}>
      {(title || Icon) && (
        <div className="flex justify-between items-start mb-4 px-5 pt-5">
          <div>
            {title && <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{title}</h3>}
            {subtitle && <p className="text-[10px] text-slate-600 font-mono mt-1">{subtitle}</p>}
          </div>
          {Icon && <Icon className={clsx("text-slate-600 w-5 h-5 transition-colors", iconColors[hoverColor])} />}
          {headerRight && <div className="ml-auto pl-2">{headerRight}</div>}
        </div>
      )}
      
      <div className={clsx("flex-1", (title || Icon) ? "px-5 pb-5" : "p-5")}>
        {children}
      </div>
    </div>
  );
};