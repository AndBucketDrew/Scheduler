import { Navigate, Outlet } from "react-router-dom";
import { getPermissionsFromToken } from "./auth.js";

// Component to protect routes based on authentication and permissions
const ProtectedRoute = ({ requiredPerm = [] }) => {
    // Retrieve authentication token from session storage
    const token = sessionStorage.getItem("lh_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Extract user permissions from the token
    const userPermissions = getPermissionsFromToken();

    // Check if user has any of the required permissions (if specified)
    if (requiredPerm.length > 0) {
        const hasAccess = requiredPerm.some((perm) => userPermissions.includes(perm));
        // Redirect to a default route if user lacks required permissions
        if (!hasAccess) {
            return <Navigate to="/shifts/my-shifts" replace />;
        }
    }

    // Render child routes if authentication and permissions are valid
    return <Outlet />;
};

export default ProtectedRoute;