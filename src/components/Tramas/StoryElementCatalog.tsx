import React from 'react';
import { StoryElement } from '../../types';
import StoryElementCard from './StoryElementCard';

interface StoryElementCatalogProps {
  storyElements: StoryElement[];
  onSelect: (id: string) => void;
  favoritos: string[];
  recientes: string[];
  onToggleFavorite: (id: string) => void;
}

const StoryElementCatalog: React.FC<StoryElementCatalogProps> = ({
  storyElements,
  onSelect,
  favoritos,
  recientes,
  onToggleFavorite
}) => {
  return (
    <div className="space-y-2">
      {storyElements.map(storyElement => (
        <StoryElementCard
          key={storyElement.id}
          storyElement={storyElement}
          isFavorite={favoritos.includes(storyElement.id)}
          isRecent={recientes.includes(storyElement.id)}
          onToggleFavorite={onToggleFavorite}
          showActions={true}
          onClick={() => onSelect(storyElement.id)}
        />
      ))}
    </div>
  );
};

export default StoryElementCatalog;