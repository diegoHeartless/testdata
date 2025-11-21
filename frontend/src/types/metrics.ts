export interface UserUsageMetrics {
  totalRequests: number;
  requestsLast24h: number;
  requestsLast7d: number;
  profilesGenerated: number;
  profilesGeneratedLast24h: number;
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
  lastActivity: string;
}

export interface UserProfileMetrics {
  total: number;
  byRegion: Record<string, number>;
  byDocumentType: Record<string, number>;
  recentActivity: Array<{
    id: string;
    createdAt: string;
    hasPassport: boolean;
    hasINN: boolean;
    hasSNILS: boolean;
  }>;
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connected: boolean;
    poolSize?: number;
    activeConnections?: number;
  };
  redis: {
    connected: boolean;
    memory?: number;
  };
  requests: {
    total: number;
    last24h: number;
    averageLatency: number;
    errorRate: number;
  };
}

export interface UsersMetrics {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  topUsers: Array<{
    apiKeyId: string;
    label: string;
    requestsCount: number;
    profilesGenerated: number;
  }>;
}

