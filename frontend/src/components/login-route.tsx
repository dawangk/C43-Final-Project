import { me } from "@/api/authApiSlice";
import useAuthStore from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
  component: React.ComponentType;
}

/**
 * Login Route
 *
 * Checks if a user session exists in localstorage and if user is logged in already using /auth/me. If so then redirect to dashboard.
 */
const LoginRoute: React.FC<AuthRouteProps> = ({ component: Component }) => {
  const userInfo = useAuthStore(state => state.userInfo);

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: [],
    queryFn: me,
  })

  return !isLoading && data && userInfo ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Component />
  );
};

export default LoginRoute;
