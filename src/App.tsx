import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Navbar from "./components/Navbar";
import LoginForm from "./components/Login";
import RegistrationForm from "./components/Register";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Demo from "./components/demo";

import PaymentPage from "./components/Paymentpage";
import ContactWidget from "./components/ContactWidget";
import BusinessDashboard from "./components/business/dashboard/page";
import BusinessReviews from "./components/business/reviews/page";
import ReviewLinkPage from "./components/business/review-link/page";
import AdminDashboard from "./components/admin/dashboard/page";
import BusinessesPage from "./components/admin/businesses/page";
import UsersPage from "./components/admin/users/page";
import Sidebar from "./components/sidebar";
import BusinessForm from "./components/Business-form";
import AccountPage from "./components/business/settings/account";
import BusinessUsersPage from "./components/business/settings/businessusers";
import LocationPage from "./components/business/settings/location";

import FeedbackForm from "./components/business/review-link/form";
import ReviewPage from "./components/business/review-link/review";

// Custom hook to scroll to hash section on route change
function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);
}

//  This function handles conditional rendering of Navbar
function AppRoutes() {
  useScrollToHash();
  const location = useLocation();

  // Hide Navbar on these routes
  const hideNavbarRoutes = ["/feedback", "/review"];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/contact" element={<ContactWidget />} />
        <Route path="/pricing" element={<Index />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/admin" element={<BusinessForm />} />
        <Route path="/businessform" element={<BusinessForm />} />
        <Route path="/components/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/components/business/reviews" element={<BusinessReviews />} />
        <Route path="/components/business/review-link" element={<ReviewLinkPage />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/components/business/settings/account" element={<AccountPage />} />
        <Route path="/components/business/settings/businessusers" element={<BusinessUsersPage />} />
        <Route path="/components/business/settings/location" element={<LocationPage />} />
        <Route path="/components/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/components/admin/businesses" element={<BusinessesPage />} />
        <Route path="/components/admin/users" element={<UsersPage />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
