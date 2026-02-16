import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OrgProvider, useOrg } from "@/contexts/OrgContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/public/PublicLayout";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import OnboardingPage from "@/pages/auth/OnboardingPage";

// Public pages
import HomePage from "@/pages/public/HomePage";
import AboutPage from "@/pages/public/AboutPage";
import ServicesPage from "@/pages/public/ServicesPage";
import ContactPage from "@/pages/public/ContactPage";
import ReferralLandingPage from "@/pages/public/ReferralLandingPage";
import {
  TreeRemovalPage,
  TreeTrimmingPage,
  TreePruningPage,
  StumpGrindingPage,
  EmergencyTreeRemovalPage,
  DebrisRemovalPage,
  LandscapingPage,
  LandClearingPage,
  LotClearingPage,
  BrushRemovalPage,
} from "@/pages/public/services";

// AI Platform pages
import AIControlCenter from "@/pages/AIControlCenter";
import MainDashboardPage from "@/pages/MainDashboardPage";
import AIChatPage from "@/pages/AIChatPage";
import AICallsPage from "@/pages/AICallsPage";
import AIBookingAssistantPage from "@/pages/AIBookingAssistantPage";
import AIVoiceContentPage from "@/pages/AIVoiceContentPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import MarketingAnalyticsPage from "@/pages/MarketingAnalyticsPage";
import AIProductivityPage from "@/pages/AIProductivityPage";
import SalesLeadsPage from "@/pages/SalesLeadsPage";
import MailersPage from "@/pages/MailersPage";
import CanvassingPage from "@/pages/CanvassingPage";
import MetaAdsGuidePage from "@/pages/MetaAdsGuidePage";
import GoogleAdsGuidePage from "@/pages/GoogleAdsGuidePage";
import SettingsPage from "@/pages/SettingsPage";
import VoiceAgentTestPage from "@/pages/VoiceAgentTestPage";
import GTMPage from "@/pages/GTMPage";
import GTMOnboardingPage from "@/pages/GTMOnboardingPage";
import SEODashboardPage from "@/pages/SEODashboardPage";
import SEOOnboardingPage from "@/pages/SEOOnboardingPage";
import LLMPresencePage from "@/pages/LLMPresencePage";
import NotFound from "@/pages/NotFound";

// Admin pages
import JobberIntegrationPage from "@/pages/admin/JobberIntegrationPage";
import ToolCallLogsPage from "@/pages/admin/ToolCallLogsPage";

// OAuth callback pages
import GoogleAdsCallbackPage from "@/pages/integrations/GoogleAdsCallbackPage";
import MetaAdsCallbackPage from "@/pages/integrations/MetaAdsCallbackPage";

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
      {/* Public website */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/offer" element={<PublicLayout><ReferralLandingPage /></PublicLayout>} />
      <Route path="/services/tree-removal" element={<PublicLayout><TreeRemovalPage /></PublicLayout>} />
      <Route path="/services/tree-trimming" element={<PublicLayout><TreeTrimmingPage /></PublicLayout>} />
      <Route path="/services/tree-pruning" element={<PublicLayout><TreePruningPage /></PublicLayout>} />
      <Route path="/services/stump-grinding" element={<PublicLayout><StumpGrindingPage /></PublicLayout>} />
      <Route path="/services/emergency-tree-removal" element={<PublicLayout><EmergencyTreeRemovalPage /></PublicLayout>} />
      <Route path="/services/debris-removal" element={<PublicLayout><DebrisRemovalPage /></PublicLayout>} />
      <Route path="/services/landscaping" element={<PublicLayout><LandscapingPage /></PublicLayout>} />
      <Route path="/services/land-clearing" element={<PublicLayout><LandClearingPage /></PublicLayout>} />
      <Route path="/services/lot-clearing" element={<PublicLayout><LotClearingPage /></PublicLayout>} />
      <Route path="/services/brush-removal" element={<PublicLayout><BrushRemovalPage /></PublicLayout>} />

      {/* Auth routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

      {/* Admin/Dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><MainDashboardPage /></ProtectedRoute>} />
      <Route path="/ai-control" element={<ProtectedRoute><AIControlCenter /></ProtectedRoute>} />
      <Route path="/ai-chat" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />
      <Route path="/ai-calls" element={<ProtectedRoute><AICallsPage /></ProtectedRoute>} />
      <Route path="/ai-booking" element={<ProtectedRoute><AIBookingAssistantPage /></ProtectedRoute>} />
      <Route path="/ai-voice-content" element={<ProtectedRoute><AIVoiceContentPage /></ProtectedRoute>} />
      <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
      <Route path="/integrations/jobber" element={<ProtectedRoute><JobberIntegrationPage /></ProtectedRoute>} />
      <Route path="/integrations/google-ads/callback" element={<GoogleAdsCallbackPage />} />
      <Route path="/integrations/meta-ads/callback" element={<MetaAdsCallbackPage />} />
      <Route path="/marketing" element={<ProtectedRoute><MarketingAnalyticsPage /></ProtectedRoute>} />
      <Route path="/meta-ads-guide" element={<ProtectedRoute><MetaAdsGuidePage /></ProtectedRoute>} />
      <Route path="/google-ads-guide" element={<ProtectedRoute><GoogleAdsGuidePage /></ProtectedRoute>} />
      <Route path="/ai-productivity" element={<ProtectedRoute><AIProductivityPage /></ProtectedRoute>} />
      <Route path="/sales-leads" element={<ProtectedRoute><SalesLeadsPage /></ProtectedRoute>} />
      <Route path="/mailers" element={<ProtectedRoute><MailersPage /></ProtectedRoute>} />
      <Route path="/canvassing" element={<ProtectedRoute><CanvassingPage /></ProtectedRoute>} />
      <Route path="/gtm" element={<ProtectedRoute><GTMPage /></ProtectedRoute>} />
      <Route path="/gtm-onboarding" element={<ProtectedRoute><GTMOnboardingPage /></ProtectedRoute>} />
      <Route path="/seo" element={<ProtectedRoute><SEODashboardPage /></ProtectedRoute>} />
      <Route path="/seo-onboarding" element={<ProtectedRoute><SEOOnboardingPage /></ProtectedRoute>} />
      <Route path="/llm-presence" element={<ProtectedRoute><LLMPresencePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute><ToolCallLogsPage /></ProtectedRoute>} />

      {/* Voice Agent Test - Public route */}
      <Route path="/voice-agent-test" element={<VoiceAgentTestPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <HelmetProvider>
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
  </HelmetProvider>
);

export default App;
