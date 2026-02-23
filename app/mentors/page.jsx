import ProtectedRoute from "../../components/Auth/ProtectedRoute";
import placeholderMentors from "../../lib/placeholders";

export default function MentorsPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Mentors</h1>
        <ul className="space-y-2">
          {placeholderMentors.map((mentor) => (
            <li key={mentor.id} className="border p-4 rounded shadow hover:bg-gray-50">
              <a href={mentor.link} className="text-blue-600 hover:underline">
                {mentor.name} ({mentor.role})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}
