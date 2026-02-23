import ProtectedRoute from "../../components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
        {/* Add more dashboard content here */}
      </div>
    </ProtectedRoute>
  );
}
