import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardRedirector = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return navigate("/login");

    switch (user.role) {
      case "admin":
        return navigate("/admin/dashboard");
      case "landlord":
        return navigate("/landlord/dashboard");
      case "tenant":
        return navigate("/tenant/dashboard");
      case "caretaker":
        return navigate("/caretaker/dashboard");
      default:
        return navigate("/");
    }
  }, []);

  return null;
};

export default DashboardRedirector;
