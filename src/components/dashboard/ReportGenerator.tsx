
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfExport";
import { supabase } from "@/integrations/supabase/client";

interface WifiRequest {
  id: string;
  name: string;
  email: string;
  room_number: string;
  device_type: string;
  issue_type: string;
  description: string;
  status: string;
  created_at: Date;
}

export function ReportGenerator() {
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('wifi_requests')
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.warning("No data available to generate report");
        setIsGenerating(false);
        return;
      }
      
      // Format the data
      const formattedRequests = data.map(request => ({
        ...request,
        created_at: new Date(request.created_at),
      }));
      
      // Generate PDF
      const fileName = await generatePDF(formattedRequests, reportType, dateRange);
      
      if (fileName) {
        toast.success("Report generated successfully", {
          description: `The report "${fileName}" has been downloaded to your device.`,
        });
      } else {
        throw new Error("Failed to generate PDF file");
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="report-type" className="text-sm font-medium">
            Report Type
          </label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type" className="border-primary/20 focus-visible:ring-primary">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="detailed">Detailed Report</SelectItem>
              <SelectItem value="response-time">Response Time Analysis</SelectItem>
              <SelectItem value="escalation">Escalation Report</SelectItem>
              <SelectItem value="device-type">Device Type Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal w-full md:w-[240px] border-primary/20 focus-visible:ring-primary"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleGenerateReport} 
        disabled={isGenerating || !reportType}
        className="w-full md:w-auto bg-primary hover:bg-primary/90"
      >
        {isGenerating ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Export to PDF
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground mt-2">
        Generate comprehensive reports for WiFi support activities. Reports include detailed statistics and can be filtered by date range.
      </div>
    </div>
  );
}
