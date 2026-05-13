
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ClubRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">("loading");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStatus("denied");
        navigate("/login", { state: { redirect: location.pathname }, replace: true });
        return;
      }

      // Check if the JWT has the 'club' role
      // In Supabase, custom claims are in session.user.app_metadata or can be parsed from access_token
      const jwtBase64 = session.access_token.split('.')[1];
      const payload = JSON.parse(atob(jwtBase64));
      
      if (payload.role === 'club') {
        setStatus("authorized");
      } else {
        // If not a club, check if it's an admin/moderator (they can also see club areas usually)
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        const roleList = Array.isArray(roles) ? roles.map((r: any) => r.role) : [];
        if (roleList.includes("admin") || roleList.includes("moderator")) {
          setStatus("authorized");
        } else {
          setStatus("denied");
          navigate("/login", { replace: true });
        }
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return status === "authorized" ? <>{children}</> : null;
};

export default ClubRoute;
