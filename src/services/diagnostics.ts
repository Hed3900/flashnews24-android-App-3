/**
 * Global debug diagnostics store for BloggerService
 * Accessible from app UI for displaying on Android without DevTools
 */

export interface DiagnosticLog {
  timestamp: string;
  label: string;
  data?: any;
  isError?: boolean;
}

class DiagnosticsStore {
  private logs: DiagnosticLog[] = [];
  private maxLogs = 100; // Keep last 100 logs

  log(label: string, data?: any, isError: boolean = false) {
    const entry: DiagnosticLog = {
      timestamp: new Date().toLocaleTimeString(),
      label,
      data,
      isError
    };
    
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console
    const prefix = isError ? '❌ [BloggerService]' : '✓ [BloggerService]';
    if (data !== undefined) {
      console.log(`${prefix} ${label}:`, data);
    } else {
      console.log(`${prefix} ${label}`);
    }
  }

  error(label: string, data?: any) {
    this.log(label, data, true);
  }

  getLogs(): DiagnosticLog[] {
    return [...this.logs];
  }

  getLatestLog(): DiagnosticLog | null {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
  }

  getSummary(): {
    totalLogs: number;
    lastStatus: string;
    articleCount: number | null;
    errors: string[];
  } {
    const errors = this.logs.filter(l => l.isError).map(l => l.label);
    let articleCount: number | null = null;
    
    // Find the most recent article count
    for (let i = this.logs.length - 1; i >= 0; i--) {
      if (this.logs[i].label.includes('parsed') || this.logs[i].label.includes('Returning')) {
        articleCount = this.logs[i].data?.count ?? null;
        break;
      }
    }

    let lastStatus = 'Idle';
    if (this.logs.length > 0) {
      const lastLog = this.logs[this.logs.length - 1];
      if (lastLog.label.includes('failed') || lastLog.isError) {
        lastStatus = 'Failed';
      } else if (lastLog.label.includes('Successfully') || lastLog.label.includes('Returning')) {
        lastStatus = 'Success';
      } else if (lastLog.label.includes('Attempting') || lastLog.label.includes('Starting')) {
        lastStatus = 'Loading...';
      }
    }

    return {
      totalLogs: this.logs.length,
      lastStatus,
      articleCount,
      errors
    };
  }

  clear() {
    this.logs = [];
  }
}

// Global instance
export const diagnostics = new DiagnosticsStore();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__BLOGGER_DIAGNOSTICS__ = diagnostics;
}
