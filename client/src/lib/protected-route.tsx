import { ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "employee";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    // 권한이 없는 경우 적절한 페이지로 리다이렉트
    if (user.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/employee");
    }
    return null;
  }

  return <>{children}</>;
}
