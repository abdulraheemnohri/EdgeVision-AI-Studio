import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Construction } from 'lucide-react';

export function ImageClassification() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <Construction size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Image Classification</h1>
        <p className="text-muted-foreground mb-6">
          This page is currently under development. It will be available soon!
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
