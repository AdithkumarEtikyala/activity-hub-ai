
import { useAuth } from "@/contexts/FirebaseAuthContext";
import MemberDashboard from "./MemberDashboard";
import OrganizerDashboard from "./OrganizerDashboard";

const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Please sign in to continue</p>
      </div>
    );
  }

  // Route based on user role
  if (user.role === 'organizer') {
    return <OrganizerDashboard />;
  }

  return <MemberDashboard />;
};

export default RoleBasedDashboard;
