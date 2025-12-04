/**
 * Project Health Agent Types
 * Tipos para análise de saúde do projeto
 */

export interface BugStatus {
  bug: string;
  file: string;
  verification: string;
  fixed: boolean;
  details?: string;
}

export interface ConfigStatus {
  polyfills: boolean;
  safeArea: boolean;
  edgeFunction: boolean;
  privacyManifest: boolean;
  edgeToEdge: boolean;
  targetSdk: number;
}

export interface QualityMetrics {
  tsErrors: number;
  eslintErrors: number;
  eslintWarnings: number;
}

export interface ProjectHealthReport {
  timestamp: number;
  overallScore: number; // 0-100
  readyForDeploy: boolean;

  bugs: {
    total: number;
    fixed: number;
    pending: BugStatus[];
  };

  config: ConfigStatus;
  quality: QualityMetrics;
  recommendations: string[];
}

export interface HealthCheckOptions {
  checkBugs?: boolean;
  checkConfig?: boolean;
  checkQuality?: boolean;
  verbose?: boolean;
}
