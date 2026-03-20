import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Film, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Film size={32} className="text-primary/60" />
        </div>
        <h1 className="text-7xl font-display tracking-widest text-gradient-red mb-4">404</h1>
        <p className="text-xl font-bold text-white mb-2">Page Not Found</p>
        <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">
          Looks like this page went missing. Let's get you back to streaming.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
