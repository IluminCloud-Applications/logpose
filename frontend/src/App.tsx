import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppGuard } from "@/components/layout/AppGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SetupPage from "@/pages/setup";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import CampaignsPage from "@/pages/campaigns";
import SalesPage from "@/pages/sales";
import CustomersPage from "@/pages/customers";
import RecoveryPage from "@/pages/recovery";
import ProductsPage from "@/pages/products";
import FunnelPage from "@/pages/funnel";
import PlatformsPage from "@/pages/platforms";
import FacebookAdsPage from "@/pages/facebook-ads";
import VturbPage from "@/pages/vturb";
import ProfilePage from "@/pages/profile";
import CompanyPage from "@/pages/company";
import RefundsPage from "@/pages/refunds";
import GeminiPage from "@/pages/gemini";
import { AIChatProvider } from "@/components/ai-chat/AIChatProvider";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppGuard>
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/recovery" element={<RecoveryPage />} />
              <Route path="/refunds" element={<RefundsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/funnel" element={<FunnelPage />} />
              <Route path="/platforms" element={<PlatformsPage />} />
              <Route path="/facebook-ads" element={<FacebookAdsPage />} />
              <Route path="/vturb" element={<VturbPage />} />
              <Route path="/company" element={<CompanyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/gemini" element={<GeminiPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppGuard>
      </TooltipProvider>
      <Toaster richColors position="top-right" />
      <AIChatProvider />
    </BrowserRouter>
  );
}
