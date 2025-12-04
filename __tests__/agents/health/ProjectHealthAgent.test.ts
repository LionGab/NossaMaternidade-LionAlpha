/**
 * Tests for ProjectHealthAgent
 */

import { ProjectHealthAgent } from '../../../src/agents/health/ProjectHealthAgent';
import type { ProjectHealthReport } from '../../../src/agents/health/types';

describe('ProjectHealthAgent', () => {
  let agent: ProjectHealthAgent;

  beforeEach(() => {
    agent = new ProjectHealthAgent();
  });

  describe('initialization', () => {
    it('should create agent with correct config', () => {
      const info = agent.getInfo();
      expect(info.name).toBe('project-health-agent');
      expect(info.version).toBe('1.0.0');
      expect(info.capabilities).toContain('check-bugs');
      expect(info.capabilities).toContain('check-config');
      expect(info.capabilities).toContain('check-quality');
    });

    it('should initialize successfully', async () => {
      await expect(agent.initialize()).resolves.not.toThrow();
    });
  });

  describe('process', () => {
    it('should generate health report with all checks', async () => {
      const report = await agent.process({
        checkBugs: true,
        checkConfig: true,
        checkQuality: true,
      });

      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
      expect(typeof report.readyForDeploy).toBe('boolean');
      expect(report.bugs).toBeDefined();
      expect(report.config).toBeDefined();
      expect(report.quality).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should generate report with only bug checks', async () => {
      const report = await agent.process({
        checkBugs: true,
        checkConfig: false,
        checkQuality: false,
      });

      expect(report).toBeDefined();
      expect(report.bugs.total).toBeGreaterThanOrEqual(0);
    });

    it('should include pending bugs in report', async () => {
      const report = await agent.process({
        checkBugs: true,
      });

      expect(report.bugs.pending).toBeDefined();
      expect(Array.isArray(report.bugs.pending)).toBe(true);
      expect(report.bugs.total).toBe(
        report.bugs.fixed + report.bugs.pending.length
      );
    });
  });

  describe('analyze', () => {
    it('should perform full analysis', async () => {
      const report = await agent.analyze();

      expect(report).toBeDefined();
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeVerbose', () => {
    it('should perform verbose analysis', async () => {
      const report = await agent.analyzeVerbose();

      expect(report).toBeDefined();
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('report structure', () => {
    let report: ProjectHealthReport;

    beforeEach(async () => {
      report = await agent.analyze();
    });

    it('should have valid bugs structure', () => {
      expect(report.bugs).toBeDefined();
      expect(typeof report.bugs.total).toBe('number');
      expect(typeof report.bugs.fixed).toBe('number');
      expect(Array.isArray(report.bugs.pending)).toBe(true);
    });

    it('should have valid config structure', () => {
      expect(report.config).toBeDefined();
      expect(typeof report.config.polyfills).toBe('boolean');
      expect(typeof report.config.safeArea).toBe('boolean');
      expect(typeof report.config.edgeFunction).toBe('boolean');
      expect(typeof report.config.privacyManifest).toBe('boolean');
      expect(typeof report.config.edgeToEdge).toBe('boolean');
      expect(typeof report.config.targetSdk).toBe('number');
    });

    it('should have valid quality structure', () => {
      expect(report.quality).toBeDefined();
      expect(typeof report.quality.tsErrors).toBe('number');
      expect(typeof report.quality.eslintErrors).toBe('number');
      expect(typeof report.quality.eslintWarnings).toBe('number');
    });

    it('should have recommendations array', () => {
      expect(Array.isArray(report.recommendations)).toBe(true);
      report.recommendations.forEach((rec) => {
        expect(typeof rec).toBe('string');
      });
    });
  });

  describe('readyForDeploy logic', () => {
    it('should not be ready if there are pending bugs', async () => {
      const report = await agent.analyze();

      if (report.bugs.pending.length > 0) {
        expect(report.readyForDeploy).toBe(false);
      }
    });

    it('should have recommendations when not ready for deploy', async () => {
      const report = await agent.analyze();

      if (!report.readyForDeploy) {
        expect(report.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('score calculation', () => {
    it('should have score between 0 and 100', async () => {
      const report = await agent.analyze();

      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
    });

    it('should have higher score when bugs are fixed', async () => {
      const report = await agent.analyze();

      // Score should reflect bug fixes
      const bugFixRatio = report.bugs.total > 0
        ? report.bugs.fixed / report.bugs.total
        : 1;

      if (bugFixRatio === 1) {
        // Se todos os bugs estão corrigidos, score de bugs deve ser máximo
        expect(report.overallScore).toBeGreaterThanOrEqual(40);
      }
    });
  });
});
