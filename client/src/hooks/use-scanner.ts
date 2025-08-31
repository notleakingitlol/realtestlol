import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Scan, type Vulnerability } from "@shared/schema";

export function useScanner() {
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);

  const startScan = useMutation({
    mutationFn: async (data: { url: string; scanTypes: string[] }) => {
      const response = await apiRequest("POST", "/api/scans", data);
      return response.json();
    },
    onSuccess: (scan: Scan) => {
      setCurrentScan(scan);
    },
  });

  const getScan = (scanId: string) =>
    useQuery<Scan>({
      queryKey: ["/api/scans", scanId],
      enabled: !!scanId,
    });

  const getVulnerabilities = (scanId: string) =>
    useQuery<Vulnerability[]>({
      queryKey: ["/api/scans", scanId, "vulnerabilities"],
      enabled: !!scanId,
    });

  const resetScan = () => {
    setCurrentScan(null);
  };

  return {
    currentScan,
    startScan,
    getScan,
    getVulnerabilities,
    resetScan,
  };
}
