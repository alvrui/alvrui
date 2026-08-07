import React from 'react';
import { StoryElement } from '../../types';

interface StoryElementCardProps {
  storyElement: StoryElement;
  isFavorite?: boolean;
  isRecent?: boolean;
  onToggleFavorite?: (id: string) => void;
  showActions?: boolean;
  onClick?: () => void;
}

const StoryElementCard: React.FC<StoryElementCardProps> = ({
  storyElement,
  isFavorite = false,
  isRecent = false,
  onToggleFavorite,
  showActions = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 story-element-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {storyElement.name}
          </h4>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {storyElement.category}
            </span>
            {storyElement.subtype && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {storyElement.subtype}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {storyElement.logline_usage}
          </p>
        </div>

        {showActions && (
          <div className="flex space-x-1 ml-2">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(storyElement.id);
                }}
                className={isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            )}
            {isRecent && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                Reciente
              </span>
            )}
          </div>
        )}
      </div>

      {/* Compact view by default, details can be expanded */}
      <div className="mt-2 flex flex-wrap gap-1">
        {storyElement.role_in_story.slice(0, 2).map((rol: string) => (
          <span
            key={rol}
            className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded"
          >
            {rol}
          </span>
        ))}
        {storyElement.role_in_story.length > 2 && (
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
            +{storyElement.role_in_story.length - 2} roles
          </span>
        )}
      </div>
    </div>
  );
};

export default StoryElementCard;