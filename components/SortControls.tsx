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
import { ArrowUpDown, Grid3X3, Grid2X2, Save, CheckSquare, Square, MousePointer, Trash2, Minus, Plus, ArrowUpDown as ReverseIcon } from 'lucide-react';
import { SortOption } from '@/lib/cloudinary';
import { useMobile } from '@/hooks/use-mobile';

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
  onReverseOrder?: () => void;
  isProcessingOrder?: boolean;
  isSavingOrder?: boolean;
  unsavedChanges?: boolean;
  variant?: 'default' | 'compact';
  showMainControls?: boolean;
  showMultiSelectBar?: boolean;
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
  onDeleteSelected,
  onReverseOrder,
  isProcessingOrder = false,
  isSavingOrder = false,
  unsavedChanges = false,
  variant = 'default',
  showMainControls = true,
  showMultiSelectBar = true,
}: SortControlsProps) {
  const [isSettingCustom, setIsSettingCustom] = useState(false);
  const isMobile = useMobile();

  const handleSetAsCustom = async () => {
    if (!onSetAsCustom) return;
    
    setIsSettingCustom(true);
    try {
      await onSetAsCustom();
    } finally {
      setIsSettingCustom(false);
    }
  };

  // Mobile-optimized size selector with buttons
  const MobileSizeSelector = () => {
    const handleDecrease = () => {
      const newSize = Math.max(1, thumbnailSize - 1);
      onThumbnailSizeChange(newSize);
    };

    const handleIncrease = () => {
      const newSize = Math.min(4, thumbnailSize + 1);
      onThumbnailSizeChange(newSize);
    };

    return (
      <div className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Grid2X2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Size</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            disabled={thumbnailSize <= 1 || isProcessingOrder}
            className="h-10 w-10 p-0 touch-manipulation"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center justify-center w-12 h-10 text-sm font-medium bg-background border rounded">
            {thumbnailSize}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            disabled={thumbnailSize >= 6 || isProcessingOrder}
            className="h-10 w-10 p-0 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {thumbnailSize === 1 ? 'column' : 'per row'}
        </span>
      </div>
    );
  };

  // Desktop size selector with slider
  const DesktopSizeSelector = () => (
    <div className={`flex items-center gap-2 ${variant === 'compact' ? '' : 'flex-1 min-w-0'}`}>
      <Grid2X2 className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">Size:</span>
      <div className={`flex items-center gap-2 ${variant === 'compact' ? 'w-32' : 'flex-1 max-w-xs'}`}>
        <Slider
          value={[thumbnailSize]}
          onValueChange={(value) => onThumbnailSizeChange(value[0])}
          max={12}
          min={1}
          step={1}
          disabled={isProcessingOrder}
          className={variant === 'compact' ? 'w-full' : 'flex-1'}
        />
        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {thumbnailSize} {thumbnailSize === 1 ? 'column' : 'per row'}
      </span>
    </div>
  );

  // If we're only showing the multi-select bar, render it as the root so sticky works (parent is the page container)
  if (!showMainControls && showMultiSelectBar && isMultiSelectMode && isAdmin) {
    return (
      <div className="sticky top-16 z-30 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-blue-50/95 dark:bg-blue-950/40 backdrop-blur rounded-lg border border-blue-200 dark:border-blue-800 shadow-md">
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
              disabled={isProcessingOrder}
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
              disabled={isProcessingOrder}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Clear Selection
            </Button>
          )}

          {onReverseOrder && selectedCount > 1 && sortBy === 'custom' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReverseOrder}
              disabled={isProcessingOrder}
              className="flex items-center gap-2"
            >
              <ReverseIcon className="w-4 h-4" />
              {isProcessingOrder ? 'Processing...' : 'Reverse Order'}
            </Button>
          )}

          {onDeleteSelected && selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              disabled={isProcessingOrder}
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showMainControls && (
        <div className={variant === 'compact' ? 'flex items-center gap-3' : 'flex flex-col gap-4 p-4 bg-muted/50 rounded-lg'}>
          {/* Sort Controls */}
          <div className={variant === 'compact' ? 'flex items-center gap-2' : 'flex items-center gap-2 w-full sm:w-auto'}>
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={onSortChange} disabled={isProcessingOrder}>
              <SelectTrigger className={`${variant === 'compact' ? 'w-[160px]' : (isMobile ? 'flex-1' : 'w-[180px]')} ${isProcessingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
          </div>

          {/* Size Controls - Conditional rendering based on mobile */}
          {isMobile ? (
            variant === 'compact' ? null : <MobileSizeSelector />
          ) : (
            <DesktopSizeSelector />
          )}

          {/* Admin Controls Row */}
          {isAdmin && (
            <div className={variant === 'compact' ? 'flex items-center gap-2 ml-auto' : 'flex items-center gap-2 w-full sm:w-auto'}>
              {sortBy !== 'custom' && onSetAsCustom && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetAsCustom}
                  disabled={isSettingCustom || isProcessingOrder}
                  className={variant === 'compact' ? 'flex items-center gap-2' : 'flex items-center gap-2 flex-1 sm:flex-none'}
                >
                  <Save className="w-4 h-4" />
                  {variant === 'compact' ? 'Set' : (isSettingCustom ? 'Setting...' : 'Set as Custom')}
                </Button>
              )}

              {onToggleMultiSelect && (
                <Button
                  variant={isMultiSelectMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={onToggleMultiSelect}
                  disabled={isProcessingOrder}
                  className={variant === 'compact' ? 'flex items-center gap-2' : 'flex items-center gap-2 flex-1 sm:flex-none'}
                >
                  <MousePointer className="w-4 h-4" />
                  Multi-Select
                </Button>
              )}
            </div>
          )}

          {/* Admin/Saving indicator - hide in compact to save space */}
          {isAdmin && variant !== 'compact' && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                Admin
              </div>
              {unsavedChanges && (
                <div className={`flex items-center gap-1 text-xs ${isSavingOrder ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'} px-2 py-1 rounded-full`}>
                  <div className={`w-2 h-2 rounded-full ${isSavingOrder ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {isSavingOrder ? 'Saving…' : 'Saved'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Multi-Select Controls Bar (shown when in multi-select mode) */}
      {showMultiSelectBar && isMultiSelectMode && isAdmin && (
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
                disabled={isProcessingOrder}
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
                disabled={isProcessingOrder}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Clear Selection
              </Button>
            )}

            {onReverseOrder && selectedCount > 1 && sortBy === 'custom' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReverseOrder}
                disabled={isProcessingOrder}
                className="flex items-center gap-2"
              >
                <ReverseIcon className="w-4 h-4" />
                {isProcessingOrder ? 'Processing...' : 'Reverse Order'}
              </Button>
            )}

            {onDeleteSelected && selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                disabled={isProcessingOrder}
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
