
export interface DashboardStats {
  totalAgents: number;
  activeSessions: number;
  costToday: number;
  tokensToday: number;
  tasksCompletedToday: number;
}

export interface SystemHealth {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percent: number;
  };
  disk: number;
}

export interface ServiceStatus {
  status: 'running' | 'active' | 'sending' | 'stopped' | 'error';
}

export interface Services {
  openclawGateway: ServiceStatus;
  costMonitor: ServiceStatus;
  pulseUplink: ServiceStatus;
}

export interface AgentContextBreakdown {
  system: number; // Percentage
  user: number;
  rag: number;
  output: number;
}

export interface Agent {
  id: string; // Added ID
  name: string;
  role: string;
  model: string;
  status: 'thinking' | 'idle' | 'offline' | 'error' | 'working';
  task: string;
  contextUsed: number;
  contextTotal: number;
  contextBreakdown: AgentContextBreakdown; // New
  tools: string[]; // New
  color: 'emerald' | 'cyan' | 'amber' | 'red';
}

export interface SocialPost {
  day: number;
  title: string;
  type: 'LinkedIn' | 'Twitter' | 'Blog';
  status: 'Done' | 'Scheduled' | 'Draft' | 'Idea';
}

export interface ModelMetric {
  model: string;
  tasks: number;
  cost: number;
  efficiency: number; // Tasks per dollar score
}

export interface DashboardData {
  uplinkTime: string;
  stats: DashboardStats;
  systemHealth: SystemHealth;
  services: Services;
  agents: Agent[];
  socialQueue: SocialPost[];
  modelMetrics: ModelMetric[];
}

export interface ChartDataPoint {
  time: string;
  tokens: number;
  cost: number;
}

// --- NEW TYPES FOR CUSTOMIZATION ---

export type ViewType = 'dashboard' | 'agents' | 'tasks' | 'growth' | 'vault' | 'comms' | 'settings';

export type WidgetId = 'quick-actions' | 'system-log' | 'voice-uplink' | 'sticky-notes' | 'mini-calendar' | 'clock' | 'network-status';

export interface ViewLayoutConfig {
  sidebarVisible: boolean;
  sidebarWidgets: WidgetId[];
}

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  icon: any; 
  component: React.FC<any>;
  description?: string;
}
