import { useState } from "react";
import { Users, Briefcase, ClipboardList, Loader2, RefreshCw, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { useJobberLeads } from "@/hooks/useJobberLeads";

export default function SalesLeadsPage() {
  const { data, isLoading, refetch, isError } = useJobberLeads(50);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Sales & Leads</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Connect Jobber to see your clients, requests, and jobs here.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/integrations"}>
              Go to Integrations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { clients, requests, jobs, summary } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Sales & Leads</h1>
          </div>
          <p className="text-muted-foreground">Live data • Powered by Jobber</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clients" value={summary.totalClients} icon={Users} subtitle="In Jobber" />
        <StatCard title="Active Leads" value={summary.activeLeads} icon={Users} variant="success" subtitle="Marked as lead" />
        <StatCard title="Open Requests" value={summary.openRequests} icon={ClipboardList} subtitle={`of ${summary.totalRequests} total`} />
        <StatCard title="Total Revenue" value={`$${summary.totalRevenue.toLocaleString()}`} icon={DollarSign} variant="success" subtitle={`${summary.activeJobs} active jobs`} />
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Recent Clients
          </CardTitle>
          <CardDescription>Latest clients from Jobber</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-muted-foreground text-sm">No clients found.</p>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 10).map((client) => (
                <div key={client.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.phones?.[0]?.number || "No phone"} • {client.emails?.[0]?.address || "No email"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.isLead && <Badge variant="secondary">Lead</Badge>}
                    {client.tags?.nodes?.map((t) => (
                      <Badge key={t.label} variant="outline" className="text-xs">{t.label}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Recent Jobs
          </CardTitle>
          <CardDescription>Active and recent jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No jobs found.</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-sm">{job.title || `Job #${job.jobNumber}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.client?.name || "No client"} • ${job.total}
                    </p>
                  </div>
                  <Badge variant={job.jobStatus === "active" ? "default" : "secondary"}>
                    {job.jobStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Recent Requests
          </CardTitle>
          <CardDescription>Service requests from customers</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No requests found.</p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 10).map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-sm">{req.title}</p>
                    <p className="text-xs text-muted-foreground">{req.client?.name || "No client"}</p>
                  </div>
                  <Badge variant="secondary">
                    request
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
