import ProtectedRoute from "../../components/Auth/ProtectedRoute";
import placeholderForms from "../../lib/placeholders";

export default function FormsPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Forms</h1>
        <ul className="space-y-2">
          {placeholderForms.map((form) => (
            <li key={form.id} className="border p-4 rounded shadow hover:bg-gray-50">
              <a href={form.link} className="text-blue-600 hover:underline">
                {form.name} ({form.type})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}
