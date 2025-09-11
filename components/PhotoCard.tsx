import { CloudinaryImage } from '@/lib/cloudinary';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface PhotoCardProps {
  photo: CloudinaryImage;
  onClick: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
      onClick={onClick}
    >
      <div className="aspect-square relative">
        <Image
          src={photo.secure_url}
          alt={photo.original_filename || 'Photo'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
      </div>
    </Card>
  );
}
