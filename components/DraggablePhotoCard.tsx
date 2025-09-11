'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PhotoCard } from './PhotoCard';
import { CloudinaryImage } from '@/lib/cloudinary-client';
import { GripVertical } from 'lucide-react';

interface DraggablePhotoCardProps {
  photo: CloudinaryImage;
  onClick: () => void;
  isAdmin: boolean;
  isDragEnabled: boolean;
}

export function DraggablePhotoCard({ 
  photo, 
  onClick, 
  isAdmin, 
  isDragEnabled 
}: DraggablePhotoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: photo.public_id,
    disabled: !isDragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isAdmin || !isDragEnabled) {
    // Regular photo card for non-admin users or when dragging is disabled
    return (
      <div ref={setNodeRef} style={style}>
        <PhotoCard photo={photo} onClick={onClick} />
      </div>
    );
  }

  // Draggable photo card for admin users
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <PhotoCard photo={photo} onClick={onClick} />
    </div>
  );
}
