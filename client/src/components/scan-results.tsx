import { useQuery } from "@tanstack/react-query";
import { Download, ShieldCheck, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VulnerabilityCard from "./vulnerability-card";
import { type Scan, type Vulnerability } from "@shared/schema";

interface ScanResultsProps {
  scan: Scan;
  onNewScan: () => void;
}

export default function ScanResults({ scan, onNewScan }: ScanResultsProps) {
  const { data: vulnerabilities = [], isLoading } = useQuery<Vulnerability[]>({
    queryKey: ["/api/scans", scan.id, "vulnerabilities"],
  });

  const getSeverityCounts = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    vulnerabilities.forEach((vuln) => {
      const severity = vuln.severity.toLowerCase() as keyof typeof counts;
      if (counts.hasOwnProperty(severity)) {
        counts[severity]++;
      }
    });
    return counts;
  };

  const severityCounts = getSeverityCounts();
  const totalVulns = vulnerabilities.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="scan-results">
      {/* Scan Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Scan Results</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-scan-date">
                Scanned {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : 'recently'}
              </span>
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button onClick={onNewScan} size="sm" data-testid="button-new-scan">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Scan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive" data-testid="count-critical">
                {severityCounts.critical}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-400" data-testid="count-high">
                {severityCounts.high}
              </div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-400" data-testid="count-medium">
                {severityCounts.medium}
              </div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-400" data-testid="count-low">
                {severityCounts.low}
              </div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <span data-testid="text-scanned-files">
              {scan.metadata?.scannedFiles || 0} JavaScript files
            </span>{" "}
            and{" "}
            <span data-testid="text-scanned-lines">
              {scan.metadata?.scannedLines || 0} lines of code
            </span>{" "}
            analyzed
          </div>
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      {totalVulns > 0 ? (
        <div className="space-y-4">
          {vulnerabilities.map((vulnerability) => (
            <VulnerabilityCard key={vulnerability.id} vulnerability={vulnerability} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Vulnerabilities Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Great news! Our scanner didn't detect any JavaScript security vulnerabilities in your application.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
