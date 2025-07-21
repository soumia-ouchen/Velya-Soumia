import { Link } from 'react-router-dom';
import { useTheme } from './themeContext';

export default function NotFound() {
  const { theme } = useTheme(); // If you want to use theme
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="text-center p-8 max-w-md">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="mb-8">
          The page youre looking for doesnt exist or has been moved.
        </p>
        <Link 
          to="/" 
          className={`px-6 py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}