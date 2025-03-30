import { Navigate } from "react-router-dom";
import LoadingPage from "@/pages/Loading/LoadingPage";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/authApiSlice";

interface AuthRouteProps {
  component: React.ComponentType;
}

/**
 * Auth Route
 *
 * Checks if a user is logged in (session exists) using /auth/me. If not then redirect to login.
 */
const AuthRoute: React.FC<AuthRouteProps> = ({ component: Component }) => {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: [],
    queryFn: me,
  })

  if (isLoading) {
    return <LoadingPage />;
  }

  return data ? <Component /> : <Navigate to="/login" replace />;
};

export default AuthRoute;
