import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-sm text-gray-500">© {new Date().getFullYear()} Foresight</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/disclaimer" className="hover:text-red-600">Legal Disclaimer</Link>
            <Link href="/privacy" className="hover:text-red-600">Privacy</Link>
            <Link href="/terms" className="hover:text-red-600">Terms</Link>
            <Link href="/programs" className="hover:text-red-600">Support</Link>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3">Foresight provides educational guidance, not legal advice. Always consult a lawyer for your specific situation.</p>
      </div>
    </footer>
  );
}
