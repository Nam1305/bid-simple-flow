import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "@/components/Navbar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Deposit from "./pages/Deposit";
import MyOrders from "./pages/MyOrders";
import CreateProduct from "./pages/seller/CreateProduct";
import ReviewPanel from "./pages/admin/ReviewPanel";
import NotFound from "./pages/NotFound";

import Home2 from "./pages/Home2"; 
import Home3 from "./pages/home3";

import ProductDetail2 from "./pages/ProductDetail2";
import ProductDetail3 from "./pages/ProductDetail3"

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>

        <Route path="/home2" element={<Home2 />} />
        <Route path="/home3" element={<Home3 />} />
        <Route path="/p3" element={<ProductDetail3 />} />

        <Route path="/product2/:id" element={
          <ProtectedRoute>
            <ProductDetail2 />
          </ProtectedRoute>
        } />

        <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/product/:id" element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } />
        <Route path="/checkout/:id" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/deposit/:id" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <Deposit />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <MyOrders />
          </ProtectedRoute>
        } />
        <Route path="/seller/create" element={
          <ProtectedRoute allowedRoles={['seller']}>
            <CreateProduct />
          </ProtectedRoute>
        } />
        <Route path="/admin/review" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReviewPanel />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
