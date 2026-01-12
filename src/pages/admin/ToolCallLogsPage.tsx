import { useState, useEffect } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, Eye, Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface ToolCallLog {
  id: string;
  conversation_id: string | null;
  tool_name: string;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown> | null;
  status: string;
  error: string | null;
  created_at: string;
}

export default function ToolCallLogsPage() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ToolCallLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<ToolCallLog | null>(null);

  useEffect(() => {
    if (currentOrg) {
      fetchLogs();
    }
  }, [currentOrg]);

  const fetchLogs = async () => {
    if (!currentOrg) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("ai_tool_call_logs")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as unknown as ToolCallLog[]) || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tool call logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500/15 text-green-500 hover:bg-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.conversation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tool Call Logs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor AI agent tool calls and responses
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
          Refresh
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tool name, conversation ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No logs yet</h3>
              <p className="text-muted-foreground mt-1">
                Tool call logs from the AI agent will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Conversation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div>{format(new Date(log.created_at), "MMM d, yyyy")}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(log.created_at), "h:mm:ss a")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {log.tool_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.conversation_id ? (
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {log.conversation_id.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.error ? (
                        <span className="text-sm text-destructive truncate max-w-[200px] block">
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Tool Call Details</DialogTitle>
                            <DialogDescription>
                              {log.tool_name} - {format(new Date(log.created_at), "PPpp")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Request Payload</h4>
                              <ScrollArea className="h-[200px] rounded-md border p-4">
                                <pre className="text-xs">
                                  {JSON.stringify(log.request_payload, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Response Payload</h4>
                              <ScrollArea className="h-[200px] rounded-md border p-4">
                                <pre className="text-xs">
                                  {log.response_payload
                                    ? JSON.stringify(log.response_payload, null, 2)
                                    : "No response"}
                                </pre>
                              </ScrollArea>
                            </div>
                            {log.error && (
                              <div>
                                <h4 className="font-medium mb-2 text-destructive">Error</h4>
                                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
                                  <p className="text-sm text-destructive">{log.error}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
