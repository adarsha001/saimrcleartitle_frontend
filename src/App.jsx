import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PropertyList from "./pages/PropertyList";
import PropertyDetail from "./pages/PropertyDetail";
import FeaturedProperties from "./pages/FeaturedProperties";
import AddProperty from "./pages/AddProperty";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LikesProvider } from "./context/LikesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./container/Home";
import { ViewModeProvider } from "./context/ViewModeContext";

// Admin Pages
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminProperties from "./components/AdminProperties";
import AdminClickAnalytics from "./components/AdminClickAnalytics";

// Enquiry Components
import EnquiryForm from "./components/EnquiryForm";
import AdminEnquiries from "./components/AdminEnquiries";

// NotFound Component
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import TermsAndConditionsSaimr from "./components/TermsAndConditions_SAIMR_Groups";

// Component to redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LikesProvider>
          <ViewModeProvider>
            <ScrollToTop />
            <Navbar />
            
            {/* Global Enquiry Form - Shows on all pages except admin */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={<EnquiryForm />} />
            </Routes>
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home/>} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/featured" element={<FeaturedProperties />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              
              {/* Auth Routes - Only accessible when NOT logged in */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Protected User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-property"
                element={
                  <ProtectedRoute>
                    <AddProperty />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/properties"
                element={
                  <AdminRoute>
                    <AdminProperties />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminRoute>
                    <AdminClickAnalytics />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/enquiries"
                element={
                  <AdminRoute>
                    <AdminEnquiries />
                  </AdminRoute>
                }
              />

              <Route path="/terms" element={<TermsAndConditionsSaimr />} />
<Route path="/terms-and-conditions" element={<TermsAndConditionsSaimr />} />
              {/* 404 Not Found Route - Catch all undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ViewModeProvider>
        </LikesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}