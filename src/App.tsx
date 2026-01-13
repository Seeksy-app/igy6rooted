import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OrgProvider, useOrg } from "@/contexts/OrgContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import OnboardingPage from "@/pages/auth/OnboardingPage";

// AI Platform pages
import AIControlCenter from "@/pages/AIControlCenter";
import AIChatPage from "@/pages/AIChatPage";
import AICallsPage from "@/pages/AICallsPage";
import AIBookingAssistantPage from "@/pages/AIBookingAssistantPage";
import AIVoiceContentPage from "@/pages/AIVoiceContentPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import MarketingAnalyticsPage from "@/pages/MarketingAnalyticsPage";
import AIProductivityPage from "@/pages/AIProductivityPage";
import MetaAdsGuidePage from "@/pages/MetaAdsGuidePage";
import GoogleAdsGuidePage from "@/pages/GoogleAdsGuidePage";
import SettingsPage from "@/pages/SettingsPage";
import VoiceAgentTestPage from "@/pages/VoiceAgentTestPage";
import GTMPage from "@/pages/GTMPage";
import NotFound from "@/pages/NotFound";

// Admin pages
import JobberIntegrationPage from "@/pages/admin/JobberIntegrationPage";
import ToolCallLogsPage from "@/pages/admin/ToolCallLogsPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentOrg, loading: orgLoading } = useOrg();

  if (authLoading || orgLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!currentOrg) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { currentOrg } = useOrg();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && currentOrg) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentOrg, loading: orgLoading } = useOrg();

  if (authLoading || orgLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (currentOrg) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

      {/* AI Platform routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AIControlCenter /></ProtectedRoute>} />
      <Route path="/ai-chat" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />
      <Route path="/ai-calls" element={<ProtectedRoute><AICallsPage /></ProtectedRoute>} />
      <Route path="/ai-booking" element={<ProtectedRoute><AIBookingAssistantPage /></ProtectedRoute>} />
      <Route path="/ai-voice-content" element={<ProtectedRoute><AIVoiceContentPage /></ProtectedRoute>} />
      <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
      <Route path="/integrations/jobber" element={<ProtectedRoute><JobberIntegrationPage /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><MarketingAnalyticsPage /></ProtectedRoute>} />
      <Route path="/meta-ads-guide" element={<ProtectedRoute><MetaAdsGuidePage /></ProtectedRoute>} />
      <Route path="/google-ads-guide" element={<ProtectedRoute><GoogleAdsGuidePage /></ProtectedRoute>} />
      <Route path="/ai-productivity" element={<ProtectedRoute><AIProductivityPage /></ProtectedRoute>} />
      <Route path="/gtm" element={<ProtectedRoute><GTMPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/logs" element={<ProtectedRoute><ToolCallLogsPage /></ProtectedRoute>} />

      {/* Voice Agent Test - Public route */}
      <Route path="/voice-agent-test" element={<VoiceAgentTestPage />} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
