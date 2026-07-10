import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <LayoutDashboard size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild><Link to="/"><ArrowLeft size={16} className="mr-2" />Go to Dashboard</Link></Button>
          <Button variant="outline" asChild><Link to="/models">View Models</Link></Button>
        </div>
      </div>
    </div>
  );
}
