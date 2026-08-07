import { useState, useCallback } from 'react';

export interface DragItem {
  id: string;
  index: number;
  type: string;
}

export function useDragAndDrop<T extends { id: string }>(items: T[], setItems: (items: T[]) => void) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const handleSort = useCallback(
    (draggedIndex: number, hoverIndex: number) => {
      if (draggedIndex === hoverIndex) return;

      const newItems = [...items];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);

      setItems(newItems);
      setDraggedItem(null);
    },
    [items, setItems]
  );

  const handleDragStart = useCallback((id: string, index: number, type: string) => {
    setDraggedItem({ id, index, type });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return {
    draggedItem,
    handleSort,
    handleDragStart,
    handleDragEnd,
  };
}