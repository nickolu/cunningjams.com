'use client';

import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowUpDown, Grid3X3, Grid2X2, Save, CheckSquare, Square, MousePointer, Trash2 } from 'lucide-react';
import { SortOption } from '@/lib/cloudinary';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  thumbnailSize: number;
  onThumbnailSizeChange: (size: number) => void;
  isAdmin?: boolean;
  onSetAsCustom?: () => void;
  isMultiSelectMode?: boolean;
  onToggleMultiSelect?: () => void;
  selectedCount?: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onDeleteSelected?: (event: React.MouseEvent) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'custom', label: 'Custom Order' },
  { value: 'upload-newest', label: 'Upload Date (Newest)' },
  { value: 'upload-oldest', label: 'Upload Date (Oldest)' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'created-newest', label: 'Created Date (Newest)' },
  { value: 'created-oldest', label: 'Created Date (Oldest)' },
];

export function SortControls({ 
  sortBy, 
  onSortChange, 
  thumbnailSize, 
  onThumbnailSizeChange,
  isAdmin,
  onSetAsCustom,
  isMultiSelectMode = false,
  onToggleMultiSelect,
  selectedCount = 0,
  onSelectAll,
  onClearSelection,
  onDeleteSelected
}: SortControlsProps) {
  const [isSettingCustom, setIsSettingCustom] = useState(false);

  const handleSetAsCustom = async () => {
    if (!onSetAsCustom) return;
    
    setIsSettingCustom(true);
    try {
      await onSetAsCustom();
    } finally {
      setIsSettingCustom(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {option.value === 'custom' && isAdmin && ' (Drag to reorder)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Set as Custom Button (Admin Only) */}
          {isAdmin && sortBy !== 'custom' && onSetAsCustom && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetAsCustom}
              disabled={isSettingCustom}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSettingCustom ? 'Setting...' : 'Set as Custom'}
            </Button>
          )}

          {/* Multi-Select Toggle (Admin Only) */}
          {isAdmin && onToggleMultiSelect && (
            <Button
              variant={isMultiSelectMode ? "default" : "outline"}
              size="sm"
              onClick={onToggleMultiSelect}
              className="flex items-center gap-2"
            >
              <MousePointer className="w-4 h-4" />
              Multi-Select
            </Button>
          )}
        </div>

        {/* Thumbnail Size Controls */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Grid2X2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Size:</span>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Slider
              value={[thumbnailSize]}
              onValueChange={(value) => onThumbnailSizeChange(value[0])}
              max={6}
              min={2}
              step={1}
              className="flex-1"
            />
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {thumbnailSize} per row
          </span>
        </div>

        {/* Admin indicator */}
        {isAdmin && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Admin
          </div>
        )}
      </div>

      {/* Multi-Select Controls Bar (shown when in multi-select mode) */}
      {isMultiSelectMode && isAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckSquare className="w-4 h-4" />
            <span className="text-sm font-medium">
              {selectedCount} photo{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {onSelectAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                className="flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Select All
              </Button>
            )}
            
            {onClearSelection && selectedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Clear Selection
              </Button>
            )}

            {onDeleteSelected && selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </Button>
            )}
          </div>

          <div className="text-xs text-blue-600 dark:text-blue-400 ml-auto">
            Click photos to select • Drag selected photos to reorder as a group • Shift+click Delete to skip confirmation
          </div>
        </div>
      )}
    </div>
  );
}
