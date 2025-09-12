'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PhotoCard } from './PhotoCard';
import { CloudinaryImage } from '@/lib/cloudinary-client';
import { GripVertical, Check } from 'lucide-react';

interface DraggablePhotoCardProps {
  photo: CloudinaryImage;
  onClick: (event?: React.MouseEvent) => void;
  isAdmin: boolean;
  isDragEnabled: boolean;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
}

export function DraggablePhotoCard({ 
  photo, 
  onClick, 
  isAdmin, 
  isDragEnabled,
  isMultiSelectMode = false,
  isSelected = false
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

  // Determine if we should show selection UI
  const showSelectionUI = isAdmin && isMultiSelectMode;

  if (!isAdmin || (!isDragEnabled && !showSelectionUI)) {
    // Regular photo card for non-admin users or when no admin features are enabled
    return (
      <div ref={setNodeRef} style={style}>
        <PhotoCard photo={photo} onClick={(e) => onClick(e)} />
      </div>
    );
  }

  // Enhanced photo card for admin users with drag and/or selection features
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      {/* Selection checkbox */}
      {showSelectionUI && (
        <div
          className="absolute top-2 left-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/80 hover:bg-white border border-gray-300 hover:border-gray-400'
            }`}
            onClick={(e) => onClick(e)}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </div>
        </div>
      )}

      {/* Drag handle */}
      {isDragEnabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      
      <div className={showSelectionUI ? 'cursor-pointer' : ''}>
        <PhotoCard photo={photo} onClick={(e) => onClick(e)} />
      </div>
    </div>
  );
}
