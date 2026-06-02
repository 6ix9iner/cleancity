import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/UI';

const NotFound = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <AlertCircle className="w-20 h-20 mx-auto text-red-600 mb-4" />
      <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</p>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button size="lg">Back to Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
