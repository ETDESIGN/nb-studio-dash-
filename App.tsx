
import React, { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Terminal, Play, Activity, RefreshCw, TriangleAlert, Mic, Sliders,
  ShieldCheck, MicOff, Volume2, PhoneOff, User, Bot, FileSpreadsheet,
  Paperclip, Send, Cpu, Power, Trash2, FileText,
  Layers, Folder, FileJson, File, ChevronDown,
  DollarSign, Hash, Check, X, Search,
  Zap, Network, Settings, ChevronLeft, AlertCircle, Eye,
  ListTodo, CheckCircle2, Filter, Calendar, Plus, 
  Flag, Command, Bell, Monitor, Lock, Shield, Rocket, Infinity as InfinityIcon, TrendingUp,
  MessageSquare, Edit3, GripVertical, ArrowUp, ArrowDown, Share2, Box, BrainCircuit, Hammer,
  Clock, StickyNote, Layout
} from 'lucide-react';
import clsx from 'clsx';

import { Shell, QuickActionButton } from './components/layout/Shell';
import { WidgetFrame } from './components/ui/WidgetFrame';
import { DashboardData, Agent, SocialPost, ViewType, WidgetId, ViewLayoutConfig, WidgetDefinition } from './types';
import { INITIAL_DATA, fetchMockData, generateChartData } from './mockData';

// ==========================================
// WIDGET REGISTRY & COMPONENTS
// ==========================================

const SystemLogWidget = () => (
    <div className="h-full overflow-y-auto pr-2 font-mono text-[10px] space-y-4 custom-scrollbar relative min-h-[150px]">
        <div className="absolute left-[5px] top-2 bottom-2 w-px border-l border-dashed border-slate-800/50 pointer-events-none"></div>
        <div className="relative pl-4 space-y-3">
            <div className="text-slate-500"><span className="text-slate-600 mr-2">[14:32:01]</span> <span className="text-cyan-500">SYS_INIT:</span> Bootstrapping cluster</div>
            <div className="text-slate-500"><span className="text-slate-600 mr-2">[14:32:05]</span> <span className="text-emerald-500">AUTH:</span> Handshake verified</div>
            <div className="text-slate-500"><span className="text-slate-600 mr-2">[14:32:44]</span> <span className="text-amber-500">WARN:</span> High latency on pod-4</div>
            <div className="text-slate-500"><span className="text-slate-600 mr-2">[14:33:12]</span> <span className="text-slate-500">LOG:</span> Snapshot saved</div>
        </div>
    </div>
);

const VoiceWidgetSide = () => (
    <div className="flex items-center gap-4 h-full min-h-[40px]">
        <div className="flex-1 flex items-end justify-center gap-1 h-8">
            <div className="w-1 bg-emerald-500/50 animate-[pulse_0.8s_ease-in-out_infinite]" style={{height: '40%'}}></div>
            <div className="w-1 bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" style={{height: '100%'}}></div>
            <div className="w-1 bg-emerald-500/50 animate-[pulse_1.2s_ease-in-out_infinite]" style={{height: '30%'}}></div>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Listening...</div>
    </div>
);

const QuickActionsWidget = ({ notify }: { notify: (t: any, title: string, msg: string) => void }) => (
    <div className="grid grid-cols-2 gap-3">
        <QuickActionButton icon={Rocket} label="DEPLOY" color="emerald" onClick={() => notify('success', 'DEPLOYMENT_INITIATED', 'All swarm agents have been tasked.')} />
        <QuickActionButton icon={Trash2} label="PURGE" color="red" onClick={() => notify('info', 'CACHE_CLEARED', 'Local telemetry cache flushed.')} />
        <QuickActionButton icon={RefreshCw} label="REBOOT" color="amber" onClick={() => notify('warning', 'RESTARTING', 'System reboot sequence initiated.')} />
        <QuickActionButton icon={Shield} label="LOCK" color="cyan" onClick={() => notify('error', 'ACCESS_DENIED', 'Security protocol requires authorization.')} />
    </div>
);

const StickyNoteWidget = () => {
    const [note, setNote] = useState("Meeting w/ Sato @ 14:00\n- Review API Specs\n- Discuss Q3 Budget");
    return (
        <textarea 
            className="w-full h-32 bg-yellow-100/10 text-yellow-100/80 border-none resize-none text-xs font-mono p-2 rounded focus:ring-1 focus:ring-yellow-500/50 placeholder:text-slate-600"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add quick notes..."
        />
    )
}

const ClockWidget = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded border border-slate-800">
            <div className="text-3xl font-bold font-mono text-emerald-400 tracking-wider">
                {time.toLocaleTimeString([], { hour12: false })}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mt-1">
                {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
        </div>
    )
}

const MiniCalendarWidget = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentDay = new Date().getDate();
    return (
        <div className="p-2">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {days.map(d => <div key={d} className="text-[9px] text-slate-500 font-bold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                    <div key={d} className={clsx(
                        "text-[10px] p-1 rounded hover:bg-slate-800 cursor-pointer",
                        d === currentDay ? "bg-emerald-500 text-slate-900 font-bold" : "text-slate-400"
                    )}>
                        {d}
                    </div>
                ))}
            </div>
        </div>
    )
}

const WIDGET_REGISTRY: Record<WidgetId, WidgetDefinition> = {
    'quick-actions': { id: 'quick-actions', title: 'QUICK ACTIONS', icon: Zap, component: QuickActionsWidget, description: "Essential system controls" },
    'system-log': { id: 'system-log', title: 'SYSTEM LOG', icon: Terminal, component: SystemLogWidget, description: "Live kernel events" },
    'voice-uplink': { id: 'voice-uplink', title: 'VOICE UPLINK', icon: Mic, component: VoiceWidgetSide, description: "Active listening state" },
    'sticky-notes': { id: 'sticky-notes', title: 'FIELD NOTES', icon: StickyNote, component: StickyNoteWidget, description: "Scratchpad" },
    'clock': { id: 'clock', title: 'LOCAL TIME', icon: Clock, component: ClockWidget, description: "Digital chronometer" },
    'mini-calendar': { id: 'mini-calendar', title: 'CALENDAR', icon: Calendar, component: MiniCalendarWidget, description: "Month view" },
    'network-status': { id: 'network-status', title: 'NETWORK STATUS', icon: Activity, component: () => <div className="text-xs text-slate-500 font-mono text-center py-4">All Systems Nominal</div>, description: "Ping & latency" },
};

// ==========================================
// SHARED COMPONENTS
// ==========================================

const CircularGauge = ({ value, max, label, color = "emerald" }: { value: number, max: number, label: string, color?: "emerald" | "amber" | "red" | "cyan" }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(Math.max(value / max, 0), 1);
    const offset = circumference - percentage * circumference;
    const colors = { emerald: "text-emerald-500", amber: "text-amber-500", red: "text-red-500", cyan: "text-cyan-500" };

    return (
        <div className="flex flex-col items-center justify-center p-2">
            <div className="relative w-20 h-20 mb-2">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r={radius} className="text-slate-800 stroke-current" strokeWidth="6" fill="transparent" />
                    <circle cx="40" cy="40" r={radius} className={clsx(colors[color], "stroke-current transition-all duration-1000 ease-out")} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-bold text-slate-200">{Math.round((value / max) * 100)}%</span>
                </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">{label}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{value} / {max}</div>
            </div>
        </div>
    );
};

// --- NOTIFICATIONS & COMMAND ---
type NotificationType = 'info' | 'success' | 'warning' | 'error';
interface Notification { id: string; type: NotificationType; title: string; message: string; }

const NotificationToast = ({ notifications, removeNotification }: { notifications: Notification[], removeNotification: (id: string) => void }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <div key={notif.id} className={clsx("pointer-events-auto w-80 bg-slate-900/90 border-l-4 p-4 rounded shadow-2xl backdrop-blur-md animate-in slide-in-from-right-full duration-300 flex items-start gap-3", notif.type === 'info' && "border-blue-500", notif.type === 'success' && "border-emerald-500", notif.type === 'warning' && "border-amber-500", notif.type === 'error' && "border-red-500")}>
          <div className={clsx("mt-0.5", notif.type === 'info' && "text-blue-500", notif.type === 'success' && "text-emerald-500", notif.type === 'warning' && "text-amber-500", notif.type === 'error' && "text-red-500")}>
            {notif.type === 'info' && <Terminal className="w-4 h-4" />}
            {notif.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {notif.type === 'warning' && <TriangleAlert className="w-4 h-4" />}
            {notif.type === 'error' && <AlertCircle className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider mb-0.5">{notif.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
          </div>
          <button onClick={() => removeNotification(notif.id)} className="text-slate-600 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
};

const CommandPalette = ({ isOpen, onClose, onNavigate, notify }: any) => {
  const [query, setQuery] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[20vh]" onClick={onClose}>
       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
       <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
         <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800 bg-slate-900/50">
            <Command className="w-5 h-5 text-slate-500" />
            <input autoFocus type="text" placeholder="Type a command..." className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 font-mono text-sm" value={query} onChange={e => setQuery(e.target.value)} />
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">ESC</span>
         </div>
         <div className="p-2">
            <div className="p-8 text-center text-slate-500 text-sm font-mono">System Command Interface Active</div>
         </div>
       </div>
    </div>
  );
};

// ==========================================
// VIEW 1: DASHBOARD
// ==========================================

const DashboardView = ({ data, onEditLayout, isEditingLayout, layout, toggleWidget, moveWidget }: any) => {
  const chartData = useMemo(() => generateChartData(), [data]);

  const widgets: Record<string, React.ReactNode> = {
    'metrics': (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Daily Spend" value={`$${data.stats.costToday.toFixed(4)}`} subtext="/ $5.00 limit" icon={DollarSign} />
        <MetricCard title="Token Volume" value={data.stats.tokensToday.toLocaleString()} subtext="tokens generated" icon={Zap} trend={12}/>
        <MetricCard title="Active Agents" value={data.stats.activeSessions} subtext="swarms deployed" icon={Bot} />
        <MetricCard title="Tasks Done" value={data.stats.tasksCompletedToday} subtext="protocols executed" icon={CheckCircle2} />
      </div>
    ),
    'tokens': (
       <WidgetFrame title="TOKEN CONSUMPTION" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '4px'}} itemStyle={{color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: '12px'}}/>
                <Area type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
        </WidgetFrame>
    ),
    'vital_signs': (
       <WidgetFrame title="VITAL SIGNS" icon={Activity} className="h-full">
            <div className="grid grid-cols-2 gap-2 h-full items-center">
                <CircularGauge value={parseFloat(data.stats.costToday.toFixed(2))} max={5.00} label="Budget" color="emerald" />
                <CircularGauge value={data.systemHealth.cpu} max={100} label="CPU" color="cyan" />
                <CircularGauge value={2} max={100} label="Errors" color="amber" />
                <CircularGauge value={data.systemHealth.memory.percent} max={100} label="Mem" color="red" />
            </div>
        </WidgetFrame>
    ),
    'models': (
       <div className="grid grid-rows-2 gap-6 h-full">
            <WidgetFrame title="MODEL BATTLE" subtitle="Efficiency" className="h-full" icon={Sliders}>
                <ModelBattleChart data={data.modelMetrics} />
            </WidgetFrame>
            <WidgetFrame title="PROJECT RUNWAY" className="h-full bg-emerald-900/10 border-emerald-500/20" icon={InfinityIcon}>
                <RunwayWidget dailySpend={data.stats.costToday} />
            </WidgetFrame>
         </div>
    ),
    'agents': (
         <WidgetFrame title="ACTIVE NEURAL GRID" icon={Network}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.agents.map((agent: Agent, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded flex items-center gap-3 relative overflow-hidden">
                  <div className={clsx("absolute left-0 top-0 bottom-0 w-1", agent.status === 'working' ? "bg-emerald-500" : agent.status === 'error' ? "bg-red-500" : "bg-slate-700")}></div>
                  <div className="pl-2 flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5"><div className="text-xs font-bold text-slate-200">{agent.name}</div>{agent.status === 'working' && <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />}</div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">{agent.task}</div>
                  </div>
                </div>
              ))}
            </div>
         </WidgetFrame>
    )
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
       {/* Layout Edit Toolbar */}
       <div className="flex justify-between items-center mb-2">
           <NewsTicker />
           <button onClick={onEditLayout} className={clsx("ml-4 px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-2 border transition-all", isEditingLayout ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600")}>
               <Edit3 className="w-3 h-3" /> {isEditingLayout ? 'DONE_EDITING' : 'CUSTOMIZE_VIEW'}
           </button>
       </div>

       {/* Widget Grid */}
       <div className="flex-1 flex flex-col gap-6">
           {layout.map((item: any) => {
               if (!item.visible && !isEditingLayout) return null;
               
               let gridClass = '';
               if (item.id === 'metrics' || item.id === 'agents') gridClass = 'col-span-12';
               else if (item.id === 'tokens') gridClass = 'col-span-12 lg:col-span-6 h-[300px]';
               else gridClass = 'col-span-12 lg:col-span-3 h-[300px]';
               
               // For grid rendering we need a container. We'll simplify and do rows.
               return null; 
           })}
           
           {/* Custom Grid Implementation based on Layout State */}
           {/* Top Section */}
           {layout.find((l:any) => l.id === 'metrics')?.visible && (
              <div className="relative group/edit">
                  {isEditingLayout && <LayoutControls item={layout.find((l:any) => l.id === 'metrics')} toggle={toggleWidget} move={moveWidget} />}
                  {widgets['metrics']}
              </div>
           )}

           {/* Middle Section */}
           <div className="grid grid-cols-12 gap-6 min-h-[300px]">
                {layout.filter((l:any) => ['tokens', 'vital_signs', 'models'].includes(l.id)).map((item:any) => {
                     if (!item.visible && !isEditingLayout) return null;
                     const colSpan = item.id === 'tokens' ? 'lg:col-span-6' : 'lg:col-span-3';
                     return (
                         <div key={item.id} className={clsx("col-span-12 relative group/edit", colSpan)}>
                             {isEditingLayout && <LayoutControls item={item} toggle={toggleWidget} move={moveWidget} />}
                             <div className={clsx(!item.visible && "opacity-25 grayscale pointer-events-none")}>
                                 {widgets[item.id]}
                             </div>
                         </div>
                     )
                })}
           </div>

           {/* Bottom Section */}
           {layout.find((l:any) => l.id === 'agents')?.visible && (
               <div className="relative group/edit">
                    {isEditingLayout && <LayoutControls item={layout.find((l:any) => l.id === 'agents')} toggle={toggleWidget} move={moveWidget} />}
                   {widgets['agents']}
               </div>
           )}
       </div>
    </div>
  );
};

const LayoutControls = ({ item, toggle, move }: any) => (
    <div className="absolute -top-3 -right-3 z-50 flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-600 shadow-xl">
        <button onClick={() => move(item.id, -1)} className="p-1 hover:bg-slate-700 rounded text-slate-300"><ArrowUp className="w-3 h-3" /></button>
        <button onClick={() => move(item.id, 1)} className="p-1 hover:bg-slate-700 rounded text-slate-300"><ArrowDown className="w-3 h-3" /></button>
        <div className="w-px bg-slate-600 mx-1"></div>
        <button onClick={() => toggle(item.id)} className={clsx("p-1 rounded", item.visible ? "text-emerald-400 hover:bg-slate-700" : "text-slate-500 bg-slate-900")}>
            {item.visible ? <Eye className="w-3 h-3" /> : <X className="w-3 h-3" />}
        </button>
    </div>
);

// ==========================================
// VIEW 2: TASKS (MISSION PROTOCOLS)
// ==========================================

// Add `dependencies` to mock tasks
interface Task { id: string; title: string; type: string; status: string; priority: string; assignee: string; tags: string[]; dueDate: string; progress: number; dependencies?: string[]; }

const mockTasks: Task[] = [
  { id: 'MP-101', title: 'Optimize API Gateway Routes', type: 'Optimization', status: 'Active', priority: 'High', assignee: 'CTO', tags: ['Backend'], dueDate: '2h', progress: 65, dependencies: [] },
  { id: 'MP-102', title: 'Scrape Competitor Pricing', type: 'Feature', status: 'Backlog', priority: 'Std', assignee: 'GROWTH', tags: ['Data'], dueDate: '1d', progress: 0, dependencies: [] },
  { id: 'MP-103', title: 'Fix Billing Webhook Payload', type: 'Bug', status: 'Active', priority: 'Critical', assignee: 'OPS', tags: ['Stripe'], dueDate: '30m', progress: 90, dependencies: [] },
  { id: 'MP-105', title: 'Vector Search v2', type: 'Feature', status: 'Validation', priority: 'High', assignee: 'CTO', tags: ['AI'], dueDate: '4h', progress: 100, dependencies: ['MP-101'] },
  { id: 'MP-107', title: 'Resolve Auth Token Expiry', type: 'Bug', status: 'Validation', priority: 'High', assignee: 'SYS', tags: ['Auth'], dueDate: '1h', progress: 100, dependencies: [] },
];

const TaskDependencyGraph = ({ tasks }: { tasks: Task[] }) => {
    // Simple SVG layout for dependency graph
    return (
        <div className="w-full h-full bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none"></div>
            <svg width="800" height="400" className="pointer-events-auto">
                {/* Mock Layout */}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                    </marker>
                </defs>
                
                {/* Links */}
                <line x1="200" y1="200" x2="500" y2="200" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowhead)" />
                
                {/* Nodes */}
                <g transform="translate(200, 200)">
                    <circle r="30" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">MP-101</text>
                    <text x="0" y="45" textAnchor="middle" fill="#64748b" fontSize="10">API Opt</text>
                </g>

                <g transform="translate(500, 200)">
                    <circle r="30" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">MP-105</text>
                    <text x="0" y="45" textAnchor="middle" fill="#64748b" fontSize="10">Vector v2</text>
                </g>
                
                 <g transform="translate(350, 100)">
                    <circle r="30" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace">MP-103</text>
                    <text x="0" y="-45" textAnchor="middle" fill="#64748b" fontSize="10">Billing</text>
                </g>
            </svg>
            <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
                SCROLL TO ZOOM • DRAG TO PAN
            </div>
        </div>
    )
}

const TasksView = () => {
  const [viewMode, setViewMode] = useState<'board' | 'graph'>('board');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">MISSION PROTOCOLS</h2>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button onClick={() => setViewMode('board')} className={clsx("px-3 py-1.5 rounded text-xs font-mono transition-colors", viewMode === 'board' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300")}>BOARD_VIEW</button>
              <button onClick={() => setViewMode('graph')} className={clsx("px-3 py-1.5 rounded text-xs font-mono transition-colors", viewMode === 'graph' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300")}>DEPENDENCY_GRAPH</button>
          </div>
      </div>
      
      {viewMode === 'board' ? (
          <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
            <TaskColumn title="BACKLOG" count={2} tasks={mockTasks.filter(t => t.status === 'Backlog')} color="slate" />
            <TaskColumn title="ACTIVE" count={2} tasks={mockTasks.filter(t => t.status === 'Active')} color="emerald" />
            <TaskColumn title="VALIDATION" count={2} tasks={mockTasks.filter(t => t.status === 'Validation')} color="purple" />
          </div>
      ) : (
          <TaskDependencyGraph tasks={mockTasks} />
      )}
    </div>
  );
};

const TaskCard = ({ task, onDragStart }: any) => (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)} className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg cursor-grab active:cursor-grabbing hover:border-emerald-500/50 transition-all hover:bg-slate-900/80 group">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 rounded border border-slate-800">{task.id}</span>
            <Flag className={clsx("w-3 h-3", task.priority === 'Critical' ? "text-red-500" : "text-slate-500")} />
        </div>
        <h4 className="text-xs font-bold text-slate-200 mb-2">{task.title}</h4>
        <div className="flex gap-2">
             {task.tags.map((t: string) => <span key={t} className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500">{t}</span>)}
        </div>
    </div>
)

const TaskColumn = ({ title, tasks, color }: any) => (
    <div className={clsx("flex-1 flex flex-col min-w-[280px] bg-slate-950/30 rounded-lg border border-slate-800/50 h-full")}>
       <div className={clsx("px-4 py-3 border-b border-slate-800 bg-slate-900/20", color === 'emerald' && "border-t-2 border-t-emerald-500")}>
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-300">{title}</h3>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} onDragStart={(e: any, id: string) => e.dataTransfer.setData("taskId", id)} />
          ))}
       </div>
    </div>
);

// ==========================================
// VIEW 3: AGENTS (NEURAL GRID)
// ==========================================

const AgentDetailView = ({ agent, onBack }: { agent: Agent, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'uplink' | 'tools'>('status');
  
  return (
  <div className="flex flex-col gap-6 h-full animate-in slide-in-from-right-10 duration-300">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">{agent.name}</h2>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase"><span>{agent.role}</span><span>//</span><span>{agent.model}</span></div>
      </div>
      <div className="ml-auto flex gap-2">
          {['status', 'uplink', 'tools'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={clsx("px-4 py-2 rounded text-xs font-bold font-mono uppercase transition-all", activeTab === tab ? "bg-emerald-500 text-slate-950" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200")}>
                  {tab}
              </button>
          ))}
      </div>
    </div>

    <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <WidgetFrame title="CONTEXT HEATMAP" icon={BrainCircuit}>
             <div className="flex flex-col gap-4">
                 <div className="flex h-4 w-full rounded overflow-hidden bg-slate-800">
                     <div style={{width: `${agent.contextBreakdown.system}%`}} className="bg-purple-500 h-full" title="System Prompt"></div>
                     <div style={{width: `${agent.contextBreakdown.user}%`}} className="bg-blue-500 h-full" title="User History"></div>
                     <div style={{width: `${agent.contextBreakdown.rag}%`}} className="bg-emerald-500 h-full" title="RAG Documents"></div>
                     <div style={{width: `${agent.contextBreakdown.output}%`}} className="bg-slate-500 h-full" title="Generated Output"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> System ({agent.contextBreakdown.system}%)</div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> User ({agent.contextBreakdown.user}%)</div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> RAG ({agent.contextBreakdown.rag}%)</div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Output ({agent.contextBreakdown.output}%)</div>
                 </div>
             </div>
        </WidgetFrame>
        <WidgetFrame title="PERFORMANCE" icon={Activity}>
             <div className="flex justify-center py-4"><CircularGauge value={agent.contextUsed} max={agent.contextTotal} label="Ctx Load" color={agent.color} /></div>
        </WidgetFrame>
      </div>
      
      <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
         <WidgetFrame title={activeTab === 'uplink' ? "DIRECT NEURAL UPLINK" : activeTab === 'tools' ? "INSTALLED CAPABILITIES" : "LIVE EXECUTION LOG"} icon={activeTab === 'uplink' ? MessageSquare : activeTab === 'tools' ? Box : Terminal} className="h-full flex-1 min-h-0">
           {activeTab === 'status' && <TerminalWidget />}
           {activeTab === 'uplink' && <SecureChat agentName={agent.name} />}
           {activeTab === 'tools' && (
               <div className="grid grid-cols-3 gap-4">
                   {agent.tools.map(tool => (
                       <div key={tool} className="p-4 bg-slate-950 border border-slate-800 rounded flex flex-col items-center gap-2 hover:border-emerald-500/50 transition-colors cursor-default">
                           <Box className="w-6 h-6 text-slate-500" />
                           <span className="text-xs font-mono font-bold text-slate-300">{tool}</span>
                           <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">READY</span>
                       </div>
                   ))}
                   <div className="p-4 border border-dashed border-slate-800 rounded flex flex-col items-center gap-2 text-slate-600 justify-center hover:text-emerald-500 hover:border-emerald-500 cursor-pointer">
                       <Plus className="w-6 h-6" />
                       <span className="text-[10px] font-mono uppercase">Install Tool</span>
                   </div>
               </div>
           )}
         </WidgetFrame>
      </div>
    </div>
  </div>
)};

const AgentsView = ({ agents }: { agents: Agent[] }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dragOverAgentId, setDragOverAgentId] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, agentId: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
          alert(`Mission ${taskId} assigned to Agent ${agentId} via Neural Link.`);
          setDragOverAgentId(null);
      }
  };

  if (selectedAgent) return <AgentDetailView agent={selectedAgent} onBack={() => setSelectedAgent(null)} />;

  return (
    <div className="grid grid-cols-12 gap-6 h-full animate-in fade-in duration-300">
      {/* Sidebar Task Queue for Drag and Drop */}
      <div className="col-span-3 h-full flex flex-col">
          <WidgetFrame title="MISSION QUEUE" icon={ListTodo} className="h-full bg-slate-950/50">
             <div className="text-[10px] text-slate-500 mb-4 px-2">DRAG PROTOCOLS TO AGENTS TO ASSIGN</div>
             <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                 {mockTasks.filter(t => t.status === 'Backlog').map(task => (
                     <div key={task.id} draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)} className="p-3 bg-slate-900 border border-slate-800 rounded cursor-grab hover:border-slate-600 active:cursor-grabbing">
                         <div className="flex justify-between mb-1"><span className="text-[10px] font-mono text-slate-500">{task.id}</span><span className="text-[10px] text-amber-500">{task.priority}</span></div>
                         <div className="text-xs text-slate-300 font-bold truncate">{task.title}</div>
                     </div>
                 ))}
             </div>
          </WidgetFrame>
      </div>

      {/* Main Grid */}
      <div className="col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full content-start">
         {agents.map((agent) => (
             <div 
                key={agent.id} 
                onClick={() => setSelectedAgent(agent)}
                onDragOver={(e) => { e.preventDefault(); setDragOverAgentId(agent.id); }}
                onDragLeave={() => setDragOverAgentId(null)}
                onDrop={(e) => handleDrop(e, agent.id)}
                className={clsx(
                    "cursor-pointer transition-all duration-300 transform",
                    dragOverAgentId === agent.id ? "scale-105 ring-2 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "hover:scale-[1.02]"
                )}
             >
                 <AgentProcessor {...agent} status={dragOverAgentId === agent.id ? 'working' : agent.status} />
             </div>
         ))}
      </div>
    </div>
  );
};

// ==========================================
// VIEW 5: VAULT
// ==========================================

const VaultView = () => {
    const [viewMode, setViewMode] = useState<'tree' | 'graph'>('tree');
    
    return (
      <div className="grid grid-cols-12 gap-6 h-full h-[calc(100vh-8rem)]">
        <div className="col-span-12 lg:col-span-4 h-full flex flex-col gap-4">
             <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
                <button onClick={() => setViewMode('tree')} className={clsx("p-2 rounded transition-colors", viewMode === 'tree' ? "bg-slate-800 text-emerald-500" : "text-slate-500 hover:text-slate-300")}><Folder className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('graph')} className={clsx("p-2 rounded transition-colors", viewMode === 'graph' ? "bg-slate-800 text-emerald-500" : "text-slate-500 hover:text-slate-300")}><Share2 className="w-4 h-4" /></button>
             </div>
             <WidgetFrame title="SOURCE_DATA" icon={Folder} className="flex-1 min-h-0">
                 {viewMode === 'tree' ? <FileRepository /> : (
                     <div className="h-full flex items-center justify-center bg-slate-950 rounded border border-slate-800/50 overflow-hidden relative">
                         <div className="absolute inset-0 grid-pattern opacity-10"></div>
                         <svg width="300" height="300" viewBox="0 0 300 300">
                             <line x1="150" y1="150" x2="100" y2="100" stroke="#334155" />
                             <line x1="150" y1="150" x2="200" y2="100" stroke="#334155" />
                             <line x1="150" y1="150" x2="150" y2="220" stroke="#334155" />
                             <circle cx="150" cy="150" r="4" fill="#10b981" />
                             <circle cx="100" cy="100" r="3" fill="#64748b" />
                             <circle cx="200" cy="100" r="3" fill="#64748b" />
                             <circle cx="150" cy="220" r="3" fill="#64748b" />
                             <text x="150" y="240" textAnchor="middle" fill="#475569" fontSize="8">Docs</text>
                         </svg>
                     </div>
                 )}
             </WidgetFrame>
        </div>
        <div className="col-span-12 lg:col-span-8 h-full"><WidgetFrame title="PREVIEW" icon={FileText} className="h-full"><DocumentPreview /></WidgetFrame></div>
      </div>
    );
}

// ==========================================
// HELPERS & DUMMY COMPONENTS FROM PREV
// ==========================================

const MetricCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg flex flex-col gap-2 relative overflow-hidden group hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start"><span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">{title}</span><Icon className="w-4 h-4 text-emerald-500 opacity-70" /></div>
    <div className="text-2xl font-bold text-slate-100 font-sans tracking-tight">{value}</div>
    <div className="text-[10px] text-slate-500 font-mono">{trend && <span className={trend > 0 ? "text-emerald-500" : "text-red-500"}>{trend > 0 ? "+" : ""}{trend}% </span>}{subtext}</div>
    <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/50 w-0 group-hover:w-full transition-all duration-500"></div>
  </div>
);

const NewsTicker = () => (
  <div className="relative flex-1 overflow-hidden bg-emerald-950/20 border-y border-emerald-500/20 h-8 flex items-center shadow-[0_0_15px_rgba(16,185,129,0.05)]">
      <div className="absolute whitespace-nowrap animate-ticker font-mono text-[10px] text-emerald-400/80 uppercase tracking-widest hover:text-emerald-300 transition-colors">
        <span className="mx-8">// LATEST: AGENT "CTO_CORE" OPTIMIZED API GATEWAY ROUTING (140ms GAIN)</span>
        <span className="mx-8">// SYSTEM: CACHE PURGE SCHEDULED FOR 03:00 UTC</span>
      </div>
  </div>
);

const RunwayWidget = ({ dailySpend }: { dailySpend: number }) => (
     <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="mb-2">{dailySpend < 1.0 ? <InfinityIcon className="w-10 h-10 text-emerald-500 animate-pulse" /> : <AlertCircle className="w-10 h-10 text-amber-500" />}</div>
        <div className="text-3xl font-bold text-slate-100 mb-1 font-sans">{dailySpend < 1.0 ? "INFINITE" : "32 DAYS"}</div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Estimated Runway</div>
        <div className="text-[9px] text-slate-600 mt-2 font-mono">@ ${dailySpend.toFixed(2)} / day</div>
     </div>
);

const ModelBattleChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" stroke="#475569" fontSize={10} hide />
        <YAxis dataKey="model" type="category" stroke="#475569" fontSize={10} tick={{fill: '#94a3b8'}} width={80} />
        <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '4px'}} itemStyle={{color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: '10px'}} cursor={{fill: '#1e293b', opacity: 0.4}}/>
        <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
        <Bar dataKey="efficiency" name="Efficiency (Tasks/$)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
);

const AgentProcessor = ({ role, name, model, status, contextUsed, contextTotal, color }: any) => {
  const statusColors: any = { emerald: 'bg-emerald-500', cyan: 'bg-cyan-500', amber: 'bg-amber-500', red: 'bg-red-500' };
  const percent = (contextUsed / contextTotal) * 100;
  return (
      <WidgetFrame className={clsx("relative h-full cursor-pointer transition-all duration-300", status === 'thinking' && 'thinking-effect border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]', status === 'error' && 'animate-flash-card border-red-500', status === 'idle' && 'hover:border-slate-600')} hoverColor={color}>
        <div className="flex justify-between items-start mb-4 relative z-10"><div><h3 className="text-xs font-bold text-slate-100 tracking-widest uppercase">{role}</h3><p className="text-[10px] font-mono text-slate-500 mt-0.5">{name}</p></div><div className="flex items-center gap-2"><div className="relative">{status === 'thinking' && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>}<span className={clsx(`w-2 h-2 rounded-full block relative z-10`, statusColors[color], status === 'idle' && 'animate-breathe-dot')}></span></div><span className={clsx("text-[10px] font-mono uppercase", status === 'error' ? 'text-red-400 font-bold' : 'text-slate-400')}>{status}</span></div></div>
        <div className="space-y-4 mb-6 relative z-10"><div className="flex items-center justify-between p-2 bg-slate-950/50 rounded border border-slate-800"><div className="flex items-center gap-2"><Cpu className="w-3 h-3 text-slate-500" /><span className="text-[10px] font-mono text-slate-300">{model}</span></div>{status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}</div><div><div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5"><span>CONTEXT WINDOW</span><span>{contextUsed}k / {contextTotal}k</span></div><div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${statusColors[color]}`} style={{ width: `${percent}%` }} /></div></div></div>
      </WidgetFrame>
  );
};

const TerminalWidget = () => (
  <div className="font-mono text-[10px] space-y-2 h-full overflow-y-auto custom-scrollbar p-2">
    <div className="flex gap-2"><span className="text-emerald-500">➜</span><span className="text-slate-300">~ agent-cli status --verbose</span></div>
    <div className="text-slate-500 pl-4">Scanning active neural pathways...</div>
    <div className="text-slate-500 pl-4">Connected to 3 nodes.</div>
    <div className="flex gap-2 mt-4"><span className="text-emerald-500">➜</span><span className="text-slate-300">~ tail -f /var/log/neural.log</span></div>
    <div className="space-y-1 pl-4 opacity-80">
      <div className="text-slate-400"><span className="text-slate-600">[10:42:01]</span> <span className="text-emerald-400">INFO:</span> Context window optimization complete (14ms)</div>
      <div className="text-slate-400"><span className="text-slate-600">[10:42:05]</span> <span className="text-blue-400">DEBUG:</span> Vector embeddings updated for node #4</div>
      <div className="text-slate-400 animate-pulse">_</div>
    </div>
  </div>
);

const SecureChat = ({ agentName = 'Board' }: { agentName?: string }) => (
    <div className="flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <div className="flex justify-center"><span className="text-[10px] font-mono text-slate-600 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800/50">Uplink Established</span></div>
            <div className="flex flex-col items-end gap-2 group"><div className="flex items-center gap-3 mb-1 opacity-60 group-hover:opacity-100 transition-opacity"><span className="text-[10px] text-slate-500 font-mono tracking-wide">YOU • 2s ago</span><div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700"><User className="w-3 h-3 text-slate-400" /></div></div><div className="bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-sm leading-relaxed">Report status.</div></div>
            <div className="flex flex-col items-start gap-2 group"><div className="flex items-center gap-3 mb-1"><div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/30 ring-2 ring-emerald-500/10"><Bot className="w-3.5 h-3.5 text-emerald-400" /></div><div className="flex flex-col"><div className="flex items-center gap-2"><span className="text-[11px] text-emerald-400 font-bold tracking-wide uppercase">{agentName}</span></div></div></div><div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[85%] text-sm leading-relaxed shadow-sm">All systems nominal. Ready for tasking.</div></div>
        </div>
        <div className="mt-auto border-t border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm"><div className="relative flex items-end gap-3"><div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all flex flex-col"><textarea placeholder={`Message ${agentName}...`} rows={1} className="w-full bg-transparent border-none rounded-xl py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-0 font-sans resize-none" style={{ minHeight: '44px' }} /></div><button className="p-2.5 mb-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"><Send className="w-5 h-5" /></button></div></div>
    </div>
);

const FileRepository = () => (
  <div className="flex flex-col h-full">
    <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" placeholder="Search vault..." className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-9 pr-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50" /></div>
    <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar"><div><div className="flex items-center gap-2 py-1.5 px-3 rounded cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-mono text-sm"><ChevronDown className="w-3 h-3 text-slate-500" /><Folder className="w-4 h-4 text-slate-500" /><span>00_MISSION_CONTROL</span></div><div className="space-y-0.5 mt-0.5"><div className="flex items-center gap-2 py-1.5 px-3 ml-6 rounded cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-mono text-sm"><FileJson className="w-4 h-4 text-amber-500" /> DASHBOARD.json</div><div className="flex items-center gap-2 py-1.5 px-3 ml-6 rounded cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-mono text-sm"><FileJson className="w-4 h-4 text-amber-500" /> DATA_METRICS.json</div></div></div><div className="mt-2"><div className="flex items-center gap-2 py-1.5 px-3 rounded cursor-pointer text-slate-200 hover:bg-slate-800/50 font-mono text-sm"><ChevronDown className="w-3 h-3 text-slate-500" /><Folder className="w-4 h-4 text-emerald-500" /><span>20_GROWTH</span></div><div className="space-y-0.5 mt-0.5"><div className="flex items-center gap-2 py-1.5 px-3 ml-6 rounded cursor-pointer bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 font-mono text-sm"><FileText className="w-4 h-4 text-blue-500" /> social_strategy_v1.md</div><div className="flex items-center gap-2 py-1.5 px-3 ml-6 rounded cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-mono text-sm"><File className="w-4 h-4 text-slate-500" /> campaign_ideas.txt</div></div></div></div>
    <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-500"><span>4 FILES, 3 FOLDERS</span><span>1.2MB USED</span></div>
  </div>
);

const DocumentPreview = () => (
  <div className="flex flex-col h-full relative">
    <div className="flex-wrap items-center gap-3 pb-6 border-b border-slate-800/50 mb-6 hidden md:flex"><div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono"><Bot className="w-3 h-3" /><span>Growth_Bot</span></div><div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono"><DollarSign className="w-3 h-3" /><span>$0.04</span></div><div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono"><FileText className="w-3 h-3" /><span>Markdown</span></div></div>
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4"><h1 className="text-2xl font-bold text-slate-100 mb-6 font-sans tracking-tight">Q1 Growth Strategy</h1><p className="text-slate-400 leading-relaxed mb-6 font-sans text-sm">Based on the recent cohort analysis, we have identified three key areas for expansion in Q1 2026.</p><h2 className="text-lg font-bold text-slate-200 mb-4 font-sans flex items-center gap-2"><Hash className="w-4 h-4 text-emerald-500" /> Key Objectives</h2><ul className="list-disc pl-5 space-y-2 text-slate-400 font-sans text-sm mb-8 marker:text-emerald-500"><li>Increase DAU by <span className="text-emerald-400 font-mono">15%</span>.</li><li>Reduce Time-to-Hello-World to <span className="text-emerald-400 font-mono">2m</span>.</li></ul><div className="bg-slate-950 rounded border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto mb-8"><pre>{`{"target": "enterprise_tier", "metrics": ["api_latency"]}`}</pre></div></div>
    <div className="mt-auto pt-6 border-t border-slate-800 flex gap-4"><button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-mono font-bold text-xs uppercase"><X className="w-4 h-4" />Reject</button><button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all font-mono font-bold text-xs uppercase"><Check className="w-4 h-4" />Publish</button></div>
  </div>
);

// Growth View (Simplified for length)
const GrowthView = ({ posts }: { posts: SocialPost[] }) => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />CONTENT_STRATEGY // Q1</h2><button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors"><Plus className="w-4 h-4" /> ADD_CAMPAIGN</button></div>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-6 overflow-hidden flex flex-col"><div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 flex-1">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (<div key={day} className="bg-slate-950 p-2 text-center text-[10px] font-mono text-slate-500 font-bold">{day}</div>))}{days.map(day => { const dayPosts = posts.filter(p => p.day === day); return (<div key={day} className="bg-slate-950 p-2 min-h-[80px] hover:bg-slate-900/50 transition-colors relative group border-t border-slate-800/50"><span className="text-[10px] font-mono text-slate-600">{day}</span><div className="mt-1 space-y-1">{dayPosts.map((post, idx) => (<div key={idx} className={clsx("text-[9px] px-1.5 py-1 rounded border truncate cursor-pointer hover:scale-105 transition-transform", post.status === 'Done' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : post.status === 'Scheduled' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-400")}>{post.type === 'Twitter' && "🐦 "}{post.type === 'LinkedIn' && "💼 "}{post.title}</div>))}</div></div>);})}</div></div>
        </div>
    );
};

// Comms View (Simplified for length)
const VoiceUplink = () => {
    const [active, setActive] = useState(false);
    return (<div className="relative h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950/50"><div className="absolute top-6 left-0 right-0 text-center z-20"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm transition-colors ${active ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-900/50 border-slate-800'}`}><ShieldCheck className={`w-3 h-3 ${active ? 'text-emerald-500' : 'text-slate-500'}`} /><span className={`text-[10px] font-mono font-bold tracking-[0.2em] ${active ? 'text-emerald-500' : 'text-slate-500'}`}>{active ? 'CHANNEL SECURE // LISTENING...' : 'CHANNEL STANDBY'}</span></div></div><div className="relative z-10"><button onClick={() => setActive(!active)} className={`relative flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-300 ${active ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 hover:scale-105'}`}><Mic className="w-8 h-8" strokeWidth={1.5} /></button></div></div>);
};
const CommsView = () => (<div className="grid grid-cols-12 gap-6 h-full lg:h-[calc(100vh-8rem)]"><div className="col-span-12 lg:col-span-4 h-full"><WidgetFrame title="SECURE VOICE CHANNEL" icon={Mic} className="h-full border-emerald-500/30"><VoiceUplink /></WidgetFrame></div><div className="col-span-12 lg:col-span-8 h-full"><WidgetFrame title="ENCRYPTED MESSAGE STREAM" icon={MessageSquare} className="h-full"><SecureChat /></WidgetFrame></div></div>);

// Settings View (Simplified)
const SettingsToggle = ({ label, active, onClick }: any) => (<div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-lg"><span className="text-sm font-medium text-slate-300">{label}</span><button onClick={onClick} className={clsx("w-10 h-5 rounded-full relative transition-colors duration-300", active ? "bg-emerald-500" : "bg-slate-700")}><div className={clsx("absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm", active ? "left-6" : "left-1")}></div></button></div>);
const SettingsView = ({ crtMode, setCrtMode, compactMode, setCompactMode }: any) => (<div className="grid grid-cols-12 gap-6 h-full"><div className="col-span-12 lg:col-span-4 flex flex-col gap-6"><WidgetFrame title="VISUAL CONFIGURATION" icon={Monitor}><div className="space-y-4"><SettingsToggle label="CRT Scanline Overlay" active={crtMode} onClick={() => setCrtMode(!crtMode)} /><SettingsToggle label="Compact Density Mode" active={compactMode} onClick={() => setCompactMode(!compactMode)} /></div></WidgetFrame></div><div className="col-span-12 lg:col-span-8 flex flex-col gap-6"><WidgetFrame title="SECURITY & ACCESS" icon={Lock}><div className="p-4 border border-slate-800 bg-slate-900/30 rounded flex flex-col gap-2"><span className="text-xs text-slate-500 font-mono uppercase">Current Session</span><span className="text-lg text-slate-200 font-mono">ID: 94-AE-22</span><span className="text-[10px] text-emerald-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ENCRYPTED (AES-256)</span></div></WidgetFrame></div></div>);

// ==========================================
// RIGHT SIDEBAR COMPONENT
// ==========================================

const RightSidebarContent = ({ 
    widgets, 
    onAddWidget, 
    onRemoveWidget,
    availableWidgets,
    notify
}: { 
    widgets: WidgetId[], 
    onAddWidget: (id: WidgetId) => void, 
    onRemoveWidget: (id: WidgetId) => void,
    availableWidgets: WidgetDefinition[],
    notify: (t: any, title: string, msg: string) => void
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header controls */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/50">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">WIDGET STACK</span>
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={clsx(
                        "text-[10px] px-2 py-1 rounded border font-mono uppercase transition-colors",
                        isEditing ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    )}
                >
                    {isEditing ? "Done" : "Edit"}
                </button>
            </div>

            {/* Active Widgets */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 min-h-0">
                {widgets.map((widgetId, index) => {
                    const def = WIDGET_REGISTRY[widgetId];
                    if (!def) return null;
                    const Component = def.component;

                    return (
                        <div key={`${widgetId}-${index}`} className="relative group animate-in slide-in-from-right-8 duration-300">
                             {isEditing && (
                                <button 
                                    onClick={() => onRemoveWidget(widgetId)}
                                    className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                             )}
                             <WidgetFrame 
                                title={def.title} 
                                icon={def.icon} 
                                className={clsx(
                                    isEditing && "ring-2 ring-emerald-500/30 border-emerald-500/50 bg-emerald-950/10",
                                    (widgetId === 'system-log' || widgetId === 'sticky-notes') ? "flex-1 min-h-[200px]" : "flex-shrink-0"
                                )}
                             >
                                 <Component notify={notify} />
                             </WidgetFrame>
                        </div>
                    );
                })}
                
                {widgets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-600 border border-dashed border-slate-800 rounded-lg">
                        <Layout className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-mono">No widgets active</span>
                    </div>
                )}
            </div>

            {/* Add Widget Button */}
            {isEditing && (
                <div className="relative pt-4 border-t border-slate-800/50">
                    <button 
                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                        className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 border-dashed rounded flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Widget
                    </button>
                    
                    {isAddMenuOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-30 flex flex-col max-h-[300px] overflow-y-auto">
                            <div className="p-2 text-[10px] font-mono text-slate-500 bg-slate-950 border-b border-slate-800 uppercase tracking-wider">Available Widgets</div>
                            {availableWidgets.map(w => (
                                <button 
                                    key={w.id}
                                    onClick={() => { onAddWidget(w.id); setIsAddMenuOpen(false); }}
                                    className="p-3 text-left hover:bg-slate-800 flex items-center gap-3 border-b border-slate-800/50 last:border-0"
                                >
                                    <div className="p-1.5 bg-slate-800 rounded text-emerald-500"><w.icon className="w-4 h-4" /></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">{w.title}</div>
                                        <div className="text-[10px] text-slate-500">{w.description}</div>
                                    </div>
                                    <Plus className="w-4 h-4 text-slate-600 ml-auto" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

// Default layouts for each view
const DEFAULT_LAYOUTS: Record<ViewType, ViewLayoutConfig> = {
    'dashboard': { sidebarVisible: true, sidebarWidgets: ['quick-actions', 'system-log', 'voice-uplink'] },
    'agents': { sidebarVisible: true, sidebarWidgets: ['quick-actions', 'network-status', 'clock'] },
    'tasks': { sidebarVisible: true, sidebarWidgets: ['sticky-notes', 'mini-calendar'] },
    'growth': { sidebarVisible: true, sidebarWidgets: ['clock', 'sticky-notes', 'mini-calendar'] },
    'vault': { sidebarVisible: false, sidebarWidgets: ['quick-actions'] },
    'comms': { sidebarVisible: true, sidebarWidgets: ['network-status', 'system-log'] },
    'settings': { sidebarVisible: false, sidebarWidgets: [] },
};

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [crtMode, setCrtMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  // Dashboard Grid Layout State
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [dashboardGrid, setDashboardGrid] = useState([
      { id: 'metrics', visible: true },
      { id: 'tokens', visible: true },
      { id: 'vital_signs', visible: true },
      { id: 'models', visible: true },
      { id: 'agents', visible: true }
  ]);
  
  // Sidebar Layout State (Per View)
  // We initialize with a deep copy to ensure independence
  const [viewLayouts, setViewLayouts] = useState<Record<ViewType, ViewLayoutConfig>>(JSON.parse(JSON.stringify(DEFAULT_LAYOUTS)));
  const [isGlobalSidebarOpen, setIsGlobalSidebarOpen] = useState(true);

  // Widget management
  const addWidgetToView = (view: ViewType, widgetId: WidgetId) => {
      setViewLayouts(prev => ({
          ...prev,
          [view]: {
              ...prev[view],
              sidebarWidgets: [...prev[view].sidebarWidgets, widgetId]
          }
      }));
  };

  const removeWidgetFromView = (view: ViewType, widgetId: WidgetId) => {
      setViewLayouts(prev => {
          // Only remove the first instance found to handle duplicates if allowed, 
          // or filter all if we want unique. Let's assume unique for now for simplicity
          // or use index. But let's just filter by ID for this version.
          // Better: filter one instance.
          const newWidgets = [...prev[view].sidebarWidgets];
          const idx = newWidgets.indexOf(widgetId);
          if (idx > -1) newWidgets.splice(idx, 1);
          
          return {
              ...prev,
              [view]: {
                  ...prev[view],
                  sidebarWidgets: newWidgets
              }
          };
      });
  };

  const toggleDashboardWidget = (id: string) => {
      setDashboardGrid(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
  };

  const moveDashboardWidget = (id: string, direction: number) => {
      const idx = dashboardGrid.findIndex(i => i.id === id);
      if ((direction === -1 && idx === 0) || (direction === 1 && idx === dashboardGrid.length - 1)) return;
      const newLayout = [...dashboardGrid];
      const item = newLayout.splice(idx, 1)[0];
      newLayout.splice(idx + direction, 0, item);
      setDashboardGrid(newLayout);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update sidebar visibility based on view defaults when view changes
  useEffect(() => {
     // Optional: If we want to strictly follow the per-view visibility preference:
     setIsGlobalSidebarOpen(viewLayouts[currentView].sidebarVisible);
  }, [currentView]);

  const addNotification = (type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  const { data } = useSWR<DashboardData>('dashboard-data', fetchMockData, { fallbackData: INITIAL_DATA, refreshInterval: 5000, revalidateOnFocus: false });

  if (!data) return null;

  return (
    <div className={clsx("h-full", crtMode && "crt-overlay")}>
      <Shell 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        uplinkTime={data.uplinkTime} 
        isRightSidebarOpen={isGlobalSidebarOpen}
        onToggleRightSidebar={() => setIsGlobalSidebarOpen(!isGlobalSidebarOpen)}
        rightSidebar={
          <RightSidebarContent 
            widgets={viewLayouts[currentView].sidebarWidgets}
            availableWidgets={Object.values(WIDGET_REGISTRY)}
            onAddWidget={(id) => addWidgetToView(currentView, id)}
            onRemoveWidget={(id) => removeWidgetFromView(currentView, id)}
            notify={addNotification}
          />
        }
      >
        {currentView === 'dashboard' && <DashboardView data={data} layout={dashboardGrid} onEditLayout={() => setIsEditingLayout(!isEditingLayout)} isEditingLayout={isEditingLayout} toggleWidget={toggleDashboardWidget} moveWidget={moveDashboardWidget} />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'agents' && <AgentsView agents={data.agents} />}
        {currentView === 'growth' && <GrowthView posts={data.socialQueue} />}
        {currentView === 'vault' && <VaultView />}
        {currentView === 'comms' && <CommsView />}
        {currentView === 'settings' && <SettingsView crtMode={crtMode} setCrtMode={setCrtMode} compactMode={compactMode} setCompactMode={setCompactMode} notify={addNotification} />}
      </Shell>
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} onNavigate={setCurrentView} notify={addNotification} />
      <NotificationToast notifications={notifications} removeNotification={(id: string) => setNotifications(prev => prev.filter(n => n.id !== id))} />
    </div>
  );
}
