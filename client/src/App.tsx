import { Route, Switch } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "./components/ui/toaster";
import AuthPage from "./pages/auth-page";
import AdminDashboard from "./pages/admin-dashboard";
import EmployeeDashboard from "./pages/employee-dashboard";
import NotFound from "./pages/not-found";
import ProtectedRoute from "./lib/protected-route";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Switch>
          <Route path="/login" component={AuthPage} />
          <Route path="/admin">
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/employee">
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
