
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentsList from "./pages/StudentsList";
import StudentForm from "./pages/StudentForm";
import StudentDetails from "./pages/StudentDetails";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={
                  <>
                    <Header />
                    <Index />
                  </>
                } />
                <Route path="/students" element={
                  <>
                    <Header />
                    <StudentsList />
                  </>
                } />
                <Route path="/students/new" element={
                  <>
                    <Header />
                    <StudentForm />
                  </>
                } />
                <Route path="/students/edit/:id" element={
                  <>
                    <Header />
                    <StudentForm />
                  </>
                } />
                <Route path="/students/:id" element={
                  <>
                    <Header />
                    <StudentDetails />
                  </>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
