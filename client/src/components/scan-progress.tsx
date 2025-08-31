import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Scan } from "@shared/schema";

interface ScanProgressProps {
  scanId: string;
  onScanComplete: (scan: Scan) => void;
}

export default function ScanProgress({ scanId, onScanComplete }: ScanProgressProps) {
  const { data: scan, isLoading } = useQuery<Scan>({
    queryKey: ["/api/scans", scanId],
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (scan?.status === "completed") {
      onScanComplete(scan);
    }
  }, [scan, onScanComplete]);

  if (isLoading || !scan) {
    return (
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading scan status...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case "scanning":
        return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "HTML Analysis Complete";
      case "scanning":
        return "Analyzing JavaScript Files";
      default:
        return "Security Pattern Matching";
    }
  };

  return (
    <div className="mb-8" data-testid="scan-progress">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Scanning in Progress</h3>
            <div className="flex items-center space-x-2 text-accent">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm" data-testid="text-progress">{scan.progress}%</span>
            </div>
          </div>
          
          <Progress value={scan.progress} className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              {scan.progress >= 30 ? (
                <CheckCircle className="h-4 w-4 text-accent" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={scan.progress >= 30 ? "text-muted-foreground" : "text-foreground"}>
                HTML Analysis Complete
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {scan.progress >= 70 ? (
                <CheckCircle className="h-4 w-4 text-accent" />
              ) : scan.progress >= 30 ? (
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={
                scan.progress >= 70 ? "text-muted-foreground" : 
                scan.progress >= 30 ? "text-foreground" : "text-muted-foreground"
              }>
                Analyzing JavaScript Files
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {scan.progress >= 100 ? (
                <CheckCircle className="h-4 w-4 text-accent" />
              ) : scan.progress >= 70 ? (
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={
                scan.progress >= 100 ? "text-muted-foreground" : 
                scan.progress >= 70 ? "text-foreground" : "text-muted-foreground"
              }>
                Security Pattern Matching
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
