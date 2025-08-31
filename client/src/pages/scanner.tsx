import { useState } from "react";
import { Shield } from "lucide-react";
import ScanForm from "@/components/scan-form";
import ScanProgress from "@/components/scan-progress";
import ScanResults from "@/components/scan-results";
import { Button } from "@/components/ui/button";
import { type Scan } from "@shared/schema";

export default function Scanner() {
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleScanComplete = (scan: Scan) => {
    setCurrentScan(scan);
  };

  const handleNewScan = () => {
    setCurrentScan(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="text-primary-foreground text-sm" />
              </div>
              <h1 className="text-xl font-bold text-foreground">VulnScanner</h1>
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">BETA</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowHistory(!showHistory)}
                data-testid="button-history"
              >
                History
              </button>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Settings</a>
              <Button variant="secondary" size="sm" data-testid="button-profile">
                Profile
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">JavaScript Vulnerability Scanner</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Automatically detect SQL injection, JavaScript injection, and HTTP security vulnerabilities in your web applications.
          </p>
        </div>

        {!currentScan && <ScanForm onScanStarted={setCurrentScan} />}
        
        {currentScan && currentScan.status !== "completed" && (
          <ScanProgress scanId={currentScan.id} onScanComplete={handleScanComplete} />
        )}
        
        {currentScan && currentScan.status === "completed" && (
          <ScanResults scan={currentScan} onNewScan={handleNewScan} />
        )}

        {/* Security Recommendations */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Shield className="text-accent mr-2 h-5 w-5" />
            Security Recommendations
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Implement Content Security Policy</h4>
                <p className="text-xs text-muted-foreground">Add CSP headers to prevent script injection attacks</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Use Parameterized Queries</h4>
                <p className="text-xs text-muted-foreground">Replace string concatenation with prepared statements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Sanitize User Input</h4>
                <p className="text-xs text-muted-foreground">Validate and escape all user-provided data</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Remove Debug Statements</h4>
                <p className="text-xs text-muted-foreground">Strip console.log and debug code from production</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-sm text-muted-foreground">© 2024 VulnScanner</span>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-foreground">Powered by Static Analysis Engine v2.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
