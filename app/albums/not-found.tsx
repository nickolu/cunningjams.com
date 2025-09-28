import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Camera } from 'lucide-react';

export default function AlbumNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Album Not Found</CardTitle>
          <CardDescription>
            The photo album you're looking for doesn't exist or may have been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <Camera className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>This could happen if:</p>
            <ul className="text-left space-y-1 ml-4">
              <li>• The album URL is incorrect</li>
              <li>• The album has been archived</li>
              <li>• You don't have access to this album</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>If you believe this is an error, please contact the album owner.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}