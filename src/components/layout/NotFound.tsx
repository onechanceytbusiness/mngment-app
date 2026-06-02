import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16">
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title="Page not found"
        description="The automation or page you’re looking for doesn’t exist. It may have been moved or isn’t available yet."
        action={
          <Link to="/automations/fashion-audit">
            <Button variant="primary">Back to Automation Hub</Button>
          </Link>
        }
      />
    </div>
  );
}

export default NotFound;
