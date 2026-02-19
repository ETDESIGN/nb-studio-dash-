import { DashboardData, ChartDataPoint } from './types';

// Initial state as requested
export const INITIAL_DATA: DashboardData = {
  uplinkTime: new Date().toISOString(),
  stats: {
    totalAgents: 3,
    activeSessions: 14,
    costToday: 0.4129,
    tokensToday: 190292,
    tasksCompletedToday: 12
  },
  systemHealth: {
    cpu: 2.3,
    memory: { "used": 3458, "total": 8192, "percent": 42 },
    disk: 84
  },
  services: {
    openclawGateway: { "status": "running" },
    costMonitor: { "status": "active" },
    pulseUplink: { "status": "sending" }
  },
  agents: [
    { 
      id: "agent-01",
      name: "CTO_Core_v4", 
      role: "ARCHITECT (CTO)",
      model: "Gemini 1.5 Pro",
      status: "thinking", 
      task: "Optimizing API Gateway routes",
      contextUsed: 45,
      contextTotal: 128,
      contextBreakdown: { system: 20, user: 15, rag: 45, output: 20 },
      tools: ["Kubectl", "AWS SDK", "Postgres", "Vercel CLI"],
      color: "emerald"
    },
    { 
      id: "agent-02",
      name: "Growth_Engine_01", 
      role: "GROWTH (CMO)",
      model: "Gemini 1.5 Flash",
      status: "idle", 
      task: "Waiting for social queue",
      contextUsed: 12,
      contextTotal: 64,
      contextBreakdown: { system: 40, user: 10, rag: 40, output: 10 },
      tools: ["Twitter API", "LinkedIn API", "OpenAI DALL-E", "Google Trends"],
      color: "cyan"
    },
    { 
      id: "agent-03",
      name: "Ops_Manager_X", 
      role: "OPERATIONS (COO)",
      model: "DeepSeek-V3",
      status: "error", 
      task: "Connection timeout on port 5432",
      contextUsed: 88,
      contextTotal: 128,
      contextBreakdown: { system: 10, user: 30, rag: 50, output: 10 },
      tools: ["Stripe API", "Quickbooks", "Slack Webhook", "SendGrid"],
      color: "red"
    }
  ],
  socialQueue: [
    { day: 2, title: "Launch Post", type: "LinkedIn", status: "Done" },
    { day: 5, title: "Feature Teaser", type: "Twitter", status: "Done" },
    { day: 12, title: "Case Study: Alpha", type: "Blog", status: "Scheduled" },
    { day: 15, title: "Meme Monday", type: "Twitter", status: "Draft" },
    { day: 22, title: "Product Update v2", type: "LinkedIn", status: "Draft" },
  ],
  modelMetrics: [
    { model: "Gemini 1.5 Flash", tasks: 1420, cost: 0.12, efficiency: 95 },
    { model: "Gemini 1.5 Pro", tasks: 340, cost: 0.21, efficiency: 65 },
    { model: "DeepSeek-V3", tasks: 850, cost: 0.08, efficiency: 88 },
    { model: "GPT-4o", tasks: 120, cost: 0.35, efficiency: 30 },
  ]
};

// Generate chart data for the last 6 hours
export const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Randomize slightly for "live" feel
    const baseTokens = 25000;
    const tokens = baseTokens + Math.floor(Math.random() * 15000);
    const cost = (tokens / 1000000) * 1.5; // Rough estimate
    
    data.push({
      time: time.getHours().toString().padStart(2, '0') + ':00',
      tokens,
      cost
    });
  }
  return data;
};

// Simulation function to mimic SWR revalidation with changing data
export const fetchMockData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const now = new Date();
  
  return {
    ...INITIAL_DATA,
    uplinkTime: now.toISOString(),
    stats: {
      ...INITIAL_DATA.stats,
      activeSessions: 14 + Math.floor(Math.random() * 5),
      tokensToday: INITIAL_DATA.stats.tokensToday + Math.floor(Math.random() * 500),
      costToday: INITIAL_DATA.stats.costToday + (Math.random() * 0.001)
    },
    systemHealth: {
      cpu: parseFloat((2 + Math.random() * 4).toFixed(1)),
      memory: {
        ...INITIAL_DATA.systemHealth.memory,
        percent: 40 + Math.floor(Math.random() * 10)
      },
      disk: 84
    },
    // Dynamically update agent status to simulate live behavior
    agents: INITIAL_DATA.agents.map(agent => {
      const isWorking = agent.status === 'thinking' || agent.status === 'working';
      const randomFlip = Math.random() > 0.85;
      
      let newStatus = agent.status;
      let newContext = agent.contextUsed;

      if (randomFlip) {
         if (isWorking) {
             newStatus = 'idle';
         } else if (agent.status === 'idle') {
             newStatus = 'thinking';
         }
      }

      // Simulate context window fluctuation
      if (newStatus === 'thinking' || newStatus === 'working') {
          newContext = Math.min(agent.contextTotal, agent.contextUsed + Math.floor(Math.random() * 5));
      }

      return {
        ...agent,
        status: newStatus,
        contextUsed: newContext
      };
    }),
    socialQueue: INITIAL_DATA.socialQueue,
    modelMetrics: INITIAL_DATA.modelMetrics.map(m => ({
        ...m,
        tasks: m.tasks + Math.floor(Math.random() * 2),
        cost: m.cost + (Math.random() * 0.0001)
    }))
  };
};
