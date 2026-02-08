import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Leaf } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Leaf className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>

      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-2">{t('notFound.title')}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">{t('notFound.description')}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('notFound.goBack')}
        </Button>
        <Button onClick={() => navigate('/dashboard')}>
          <Home className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('notFound.goHome')}
        </Button>
      </div>
    </div>
  );
}
