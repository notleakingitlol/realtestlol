import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertScanSchema, type Scan } from "@shared/schema";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  sqlInjection: z.boolean().default(true),
  jsInjection: z.boolean().default(true),
  httpSecurity: z.boolean().default(true),
}).transform((data) => ({
  url: data.url,
  scanTypes: [
    ...(data.sqlInjection ? ['sql'] : []),
    ...(data.jsInjection ? ['js'] : []),
    ...(data.httpSecurity ? ['http'] : []),
  ],
}));

type FormData = {
  url: string;
  sqlInjection: boolean;
  jsInjection: boolean;
  httpSecurity: boolean;
};

interface ScanFormProps {
  onScanStarted: (scan: Scan) => void;
}

export default function ScanForm({ onScanStarted }: ScanFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      sqlInjection: true,
      jsInjection: true,
      httpSecurity: true,
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (data: { url: string; scanTypes: string[] }) => {
      const response = await apiRequest("POST", "/api/scans", data);
      return response.json();
    },
    onSuccess: (scan: Scan) => {
      toast({
        title: "Scan Started",
        description: "Your vulnerability scan has been initiated.",
      });
      onScanStarted(scan);
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data); // Debug log
    const scanTypes = [
      ...(data.sqlInjection ? ['sql'] : []),
      ...(data.jsInjection ? ['js'] : []),
      ...(data.httpSecurity ? ['http'] : []),
    ];
    console.log("Scan types:", scanTypes); // Debug log

    if (scanTypes.length === 0) {
      toast({
        title: "Invalid Configuration",
        description: "Please select at least one vulnerability type to scan for.",
        variant: "destructive",
      });
      return;
    }

    scanMutation.mutate({
      url: data.url,
      scanTypes,
    });
  };

  return (
    <div className="mb-8">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com"
                          className="pl-10"
                          data-testid="input-url"
                        />
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sqlInjection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-sql"
                        />
                      </FormControl>
                      <FormLabel className="text-sm">SQL Injection</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jsInjection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-js"
                        />
                      </FormControl>
                      <FormLabel className="text-sm">JS Injection</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="httpSecurity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-http"
                        />
                      </FormControl>
                      <FormLabel className="text-sm">HTTP Security</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={scanMutation.isPending}
                data-testid="button-start-scan"
              >
                <Search className="mr-2 h-4 w-4" />
                {scanMutation.isPending ? "Starting Scan..." : "Start Security Scan"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
