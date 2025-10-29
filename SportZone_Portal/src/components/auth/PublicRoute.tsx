// components/routes/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactElement;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
