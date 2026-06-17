import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => (
  <div className="min-h-[80vh] flex items-center justify-center text-center px-4 bg-gray-100">
    <div>
      <p className="text-8xl font-black text-gray-200 leading-none select-none">404</p>
      <h1 className="text-2xl font-black text-black mt-4 mb-2 tracking-tight">Page not found</h1>
      <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard"
        className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export const UnauthorizedPage = () => (
  <div className="min-h-[80vh] flex items-center justify-center text-center px-4 bg-gray-100">
    <div>
      <p className="text-8xl font-black text-gray-200 leading-none select-none">403</p>
      <h1 className="text-2xl font-black text-black mt-4 mb-2 tracking-tight">Access denied</h1>
      <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
        You don't have permission to view this page.
      </p>
      <Link to="/dashboard"
        className="inline-flex items-center gap-2 border border-gray-200 text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Go back
      </Link>
    </div>
  </div>
);