import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element | null;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
};
