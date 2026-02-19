
import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  LayoutDashboard, 
  Bot, 
  Database, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ListTodo,
  Wifi,
  WifiOff,
  TrendingUp,
  PanelRightClose,
  PanelRightOpen,
  Sidebar
} from 'lucide-react';
import clsx from 'clsx';
import { ViewType } from '../../types';

interface ShellProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  uplinkTime?: string; // ISO String
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
}

const NavIcon = ({ 
  icon: Icon, 
  active, 
  title, 
  onClick 
}: { 
  icon: any, 
  active?: boolean, 
  title: string,
  onClick: () => void
}) => (
  <button 
    onClick={onClick}
    title={title}
    className={clsx(
      "p-3 rounded-xl transition-all duration-300 group relative",
      active 
        ? "text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
        : "text-slate-500 hover:text-slate-200 hover:bg-slate-900"
    )}
  >
    <Icon className="w-6 h-6 relative z-10" strokeWidth={1.5} />
    {active && (
      <div className="absolute inset-0 rounded-xl bg-emerald-500/5 animate-pulse"></div>
    )}
    {/* Tooltip on hover */}
    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-700 z-50">
      {title}
    </span>
  </button>
);

export const Shell: React.FC<ShellProps> = ({ 
  children, 
  rightSidebar, 
  currentView, 
  onNavigate, 
  uplinkTime,
  isRightSidebarOpen,
  onToggleRightSidebar
}) => {
  const [time, setTime] = useState<string>('');
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().split('T')[1].split('.')[0]);
      
      // Check for stale data (> 10 mins old)
      if (uplinkTime) {
        const lastUpdate = new Date(uplinkTime);
        const diffMs = now.getTime() - lastUpdate.getTime();
        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        setIsStale(diffMins > 10);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [uplinkTime]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-500">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-20 flex-shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col items-center py-8 gap-8 z-50 relative">
        {/* Glow effect behind sidebar */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent opacity-50"></div>

        <div className="mb-2 relative group cursor-pointer">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity"></div>
          <Rocket className="text-emerald-500 w-8 h-8 relative z-10" strokeWidth={1.5} />
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 w-full px-4 items-center">
          <NavIcon 
            icon={LayoutDashboard} 
            title="Command Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          <NavIcon 
            icon={ListTodo} 
            title="Mission Protocols" 
            active={currentView === 'tasks'} 
            onClick={() => onNavigate('tasks')} 
          />
          <NavIcon 
            icon={Bot} 
            title="Neural Grid" 
            active={currentView === 'agents'} 
            onClick={() => onNavigate('agents')} 
          />
          <NavIcon 
            icon={TrendingUp} 
            title="Growth Portal" 
            active={currentView === 'growth'} 
            onClick={() => onNavigate('growth')} 
          />
          <NavIcon 
            icon={Database} 
            title="Data Vault" 
            active={currentView === 'vault'} 
            onClick={() => onNavigate('vault')} 
          />
          <NavIcon 
            icon={MessageSquare} 
            title="Secure Comms" 
            active={currentView === 'comms'} 
            onClick={() => onNavigate('comms')} 
          />
          
          <div className="my-2 w-8 h-px bg-slate-800/50"></div>

          <NavIcon 
            icon={Settings} 
            title="System Config" 
            active={currentView === 'settings'} 
            onClick={() => onNavigate('settings')} 
          />
        </nav>

        <div className="mt-auto flex flex-col gap-6 items-center w-full px-4">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 ring-2 ring-transparent hover:ring-emerald-500/30 transition-all cursor-pointer">
            <span className="bg-gradient-to-br from-emerald-400 to-cyan-400 bg-clip-text text-transparent">NS</span>
          </div>
          <button className="p-2 text-slate-600 hover:text-red-400 transition-colors" title="Logout">
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* --- CENTER MAIN --- */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col min-w-0">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none h-full fixed"></div>
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md px-8 py-4 flex justify-between items-center shrink-0 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
             <div className={clsx("h-4 w-1 rounded-full transition-colors duration-500", isStale ? "bg-red-500" : "bg-emerald-500")}></div>
             <div>
                <h1 className="text-sm font-bold tracking-widest font-mono uppercase text-slate-200">
                  NB Studio <span className="text-slate-600 font-normal mx-2">//</span> Mission Control
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{currentView.replace('-', ' ')} VIEW</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={clsx(
              "hidden md:flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300",
              isStale 
                ? "bg-red-950/30 border-red-500/50 text-red-400" 
                : "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
            )}>
              <span className="flex h-1.5 w-1.5 relative">
                <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isStale ? "bg-red-400" : "bg-emerald-400")}></span>
                <span className={clsx("relative inline-flex rounded-full h-1.5 w-1.5", isStale ? "bg-red-500" : "bg-emerald-500")}></span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-2">
                {isStale ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                {isStale ? "CONNECTION LOST" : "UPLINK ACTIVE"}
              </span>
            </div>
            
            <div className="hidden lg:block font-mono text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-center min-w-[80px]">
              {time} <span className="text-slate-600 text-[8px]">UTC</span>
            </div>

            <div className="h-6 w-px bg-slate-800 mx-2"></div>

            <button 
              onClick={onToggleRightSidebar}
              className={clsx(
                "p-2 rounded-lg transition-colors border",
                isRightSidebarOpen 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              )}
              title="Toggle Sidebar"
            >
              {isRightSidebarOpen ? <PanelRightOpen className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-6 max-w-[1920px] mx-auto w-full h-full flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* --- RIGHT SIDEBAR --- */}
      <aside 
        className={clsx(
          "flex-shrink-0 bg-slate-950 flex flex-col border-l border-slate-800 z-50 transition-all duration-300 ease-in-out overflow-hidden",
          isRightSidebarOpen ? "w-[340px] opacity-100" : "w-0 opacity-0"
        )}
      >
        <div className="w-[340px] h-full overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
           {rightSidebar}
        </div>
      </aside>

    </div>
  );
};

// Quick Action Button Component for reuse in Right Sidebar
export const QuickActionButton = ({ 
  icon: Icon, 
  label, 
  color = 'emerald',
  onClick
}: { 
  icon: any, 
  label: string, 
  color?: 'emerald' | 'cyan' | 'amber' | 'red',
  onClick?: () => void
}) => {
  const colors = {
    emerald: 'hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5',
    cyan: 'hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5',
    amber: 'hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5',
    red: 'hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5',
  };

  return (
    <button 
      onClick={onClick}
      className={clsx(
      "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-slate-800 bg-slate-900/30 transition-all text-slate-400 group h-24 w-full",
      colors[color]
    )}>
      <Icon className="w-6 h-6 mb-1 opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
      <span className="text-[9px] font-mono uppercase font-bold tracking-wider">{label}</span>
    </button>
  );
};
