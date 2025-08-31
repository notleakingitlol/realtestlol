import { JSDOM } from 'jsdom';
import { vulnerabilityPatterns } from './vulnerability-patterns.js';
import { type InsertVulnerability } from '@shared/schema';

export interface ScanOptions {
  url: string;
  scanTypes: string[];
}

export interface ScanResult {
  vulnerabilities: InsertVulnerability[];
  metadata: {
    scannedFiles: number;
    scannedLines: number;
    totalFiles: number;
  };
}

export class VulnerabilityScanner {
  private baseUrl: string = '';

  async scanWebsite(options: ScanOptions): Promise<ScanResult> {
    this.baseUrl = new URL(options.url).origin;
    
    try {
      // Fetch the main HTML page
      const response = await fetch(options.url, {
        headers: {
          'User-Agent': 'VulnScanner/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${options.url}: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Find all JavaScript files and inline scripts
      const jsFiles = this.extractJavaScriptSources(document);
      const inlineScripts = this.extractInlineScripts(document);

      // Fetch external JavaScript files
      const externalScripts = await this.fetchExternalScripts(jsFiles);

      // Combine all JavaScript code
      const allScripts = [...inlineScripts, ...externalScripts];

      // Scan for vulnerabilities
      const vulnerabilities: InsertVulnerability[] = [];

      for (const script of allScripts) {
        const scriptVulns = this.scanJavaScriptCode(script, options.scanTypes);
        vulnerabilities.push(...scriptVulns);
      }

      // Calculate metadata
      const metadata = {
        scannedFiles: jsFiles.length + (inlineScripts.length > 0 ? 1 : 0),
        scannedLines: allScripts.reduce((total, script) => total + script.content.split('\n').length, 0),
        totalFiles: jsFiles.length + 1, // +1 for HTML file
      };

      return {
        vulnerabilities,
        metadata,
      };
    } catch (error) {
      console.error('Scan error:', error);
      throw new Error(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractJavaScriptSources(document: Document): string[] {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts
      .map((script) => (script as HTMLScriptElement).src)
      .filter((src) => src && !src.startsWith('data:') && !src.includes('replit.com'))
      .map((src) => this.resolveUrl(src));
  }

  private extractInlineScripts(document: Document): Array<{ file: string; content: string; lineOffset: number }> {
    const scripts = Array.from(document.querySelectorAll('script:not([src])'));
    return scripts
      .map((script, index) => ({
        file: `inline-script-${index + 1}`,
        content: script.textContent || '',
        lineOffset: 0,
      }))
      .filter((script) => script.content.trim().length > 0);
  }

  private async fetchExternalScripts(urls: string[]): Promise<Array<{ file: string; content: string; lineOffset: number }>> {
    const scripts = [];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'VulnScanner/1.0',
          },
        });

        if (response.ok) {
          const content = await response.text();
          scripts.push({
            file: this.getFileNameFromUrl(url),
            content,
            lineOffset: 0,
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch script: ${url}`, error);
        // Continue with other scripts
      }
    }

    return scripts;
  }

  private scanJavaScriptCode(
    script: { file: string; content: string; lineOffset: number },
    scanTypes: string[]
  ): InsertVulnerability[] {
    const vulnerabilities: InsertVulnerability[] = [];
    const lines = script.content.split('\n');

    // Filter patterns based on scan types
    const patterns = vulnerabilityPatterns.filter((pattern) =>
      scanTypes.includes(pattern.type)
    );

    for (const pattern of patterns) {
      let match;
      
      // Reset regex lastIndex to avoid issues with global flags
      pattern.pattern.lastIndex = 0;
      
      while ((match = pattern.pattern.exec(script.content)) !== null) {
        const matchText = match[0];
        const beforeMatch = script.content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length + script.lineOffset;
        
        // Get context around the vulnerable code
        const contextStart = Math.max(0, lineNumber - 3);
        const contextEnd = Math.min(lines.length, lineNumber + 2);
        const vulnerableCode = lines
          .slice(contextStart, contextEnd)
          .map((line, idx) => {
            const actualLineNum = contextStart + idx + 1;
            const prefix = actualLineNum === lineNumber ? '❌' : '  ';
            return `${prefix} ${actualLineNum}: ${line}`;
          })
          .join('\n');

        vulnerabilities.push({
          scanId: '', // Will be set by the caller
          title: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          type: pattern.type,
          file: script.file,
          line: lineNumber,
          vulnerableCode,
          attackVector: pattern.getAttackVector(matchText),
          exploitationScenario: pattern.getExploitationScenario(),
          recommendedFix: pattern.getRecommendedFix(),
        });

        // Prevent infinite loops with zero-width matches
        if (match.index === pattern.pattern.lastIndex) {
          pattern.pattern.lastIndex++;
        }
      }
    }

    return vulnerabilities;
  }

  private resolveUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`;
    }
    return `${this.baseUrl}/${url}`;
  }

  private getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'unknown.js';
    } catch {
      return 'unknown.js';
    }
  }
}
