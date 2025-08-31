import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Globe, Search, Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertScanSchema, type Scan } from "@shared/schema";

const urlFormSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

const fileFormSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileContent: z.string().min(1, "File content is required"),
});

type UrlFormData = {
  url: string;
};

type FileFormData = {
  fileName: string;
  fileContent: string;
};

interface ScanFormProps {
  onScanStarted: (scan: Scan) => void;
}

export default function ScanForm({ onScanStarted }: ScanFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const urlForm = useForm<UrlFormData>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const fileForm = useForm<FileFormData>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      fileName: "",
      fileContent: "",
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (data: { url?: string; fileName?: string; fileContent?: string; scanType: string; scanTypes: string[] }) => {
      const response = await apiRequest("POST", "/api/scans", data);
      return response.json();
    },
    onSuccess: (scan: Scan) => {
      toast({
        title: "Scan Started",
        description: "Your vulnerability scan has been initiated.",
      });
      onScanStarted(scan);
      // Reset forms
      urlForm.reset();
      fileForm.reset();
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onUrlSubmit = (data: UrlFormData) => {
    scanMutation.mutate({
      url: data.url,
      scanType: "url",
      scanTypes: ['sql', 'js', 'http'],
    });
  };

  const onFileSubmit = (data: FileFormData) => {
    scanMutation.mutate({
      fileName: data.fileName,
      fileContent: data.fileContent,
      scanType: "file",
      scanTypes: ['sql', 'js', 'http'],
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.js') && !file.name.endsWith('.jsx') && !file.name.endsWith('.ts') && !file.name.endsWith('.tsx')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JavaScript or TypeScript file (.js, .jsx, .ts, .tsx)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        fileForm.setValue('fileName', file.name);
        fileForm.setValue('fileContent', content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mb-8">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" data-testid="tab-url">
                <Globe className="mr-2 h-4 w-4" />
                Scan Website
              </TabsTrigger>
              <TabsTrigger value="file" data-testid="tab-file">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4">
              <Form {...urlForm}>
                <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-4">
                  <FormField
                    control={urlForm.control}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-sm text-muted-foreground mb-4">
                    This scanner will analyze the website for SQL injection, JavaScript injection, and HTTP security vulnerabilities.
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={scanMutation.isPending}
                    data-testid="button-start-url-scan"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {scanMutation.isPending ? "Starting Scan..." : "Start Website Scan"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <Form {...fileForm}>
                <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-4">
                  <FormItem>
                    <FormLabel>JavaScript File</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".js,.jsx,.ts,.tsx"
                          onChange={handleFileChange}
                          className="pl-10"
                          data-testid="input-file"
                        />
                        <File className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </FormControl>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                      </p>
                    )}
                  </FormItem>

                  <div className="text-sm text-muted-foreground mb-4">
                    Upload a JavaScript or TypeScript file (.js, .jsx, .ts, .tsx) to analyze for security vulnerabilities.
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={scanMutation.isPending || !selectedFile}
                    data-testid="button-start-file-scan"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {scanMutation.isPending ? "Analyzing File..." : "Analyze File"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
