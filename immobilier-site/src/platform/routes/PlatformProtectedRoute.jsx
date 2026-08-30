import { Navigate } from "react-router-dom";

import PlatformAuthService
    from "../../services/platformAuth.service";


export default function PlatformProtectedRoute({
    children
}) {

    const authenticated =
        PlatformAuthService.isAuthenticated();


    if (!authenticated) {

        return (
            <Navigate
                to="/platform/login"
                replace
            />
        );

    }


    const user =
        PlatformAuthService.getUser();


    if (
        !user ||
        user.role !== "PLATFORM_ADMIN"
    ) {

        PlatformAuthService.logout();

        return (
            <Navigate
                to="/platform/login"
                replace
            />
        );

    }


    return children;

}