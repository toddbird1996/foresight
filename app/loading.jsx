export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
