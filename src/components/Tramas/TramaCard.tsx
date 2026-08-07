import React from 'react';
import { Trama, StoryElement } from '../../types';

interface TramaCardProps {
  trama: Trama;
  storyElements: StoryElement[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAnalyze: () => void;
}

const TramaCard: React.FC<TramaCardProps> = ({ trama, storyElements, isSelected, onSelect, onDelete, onAnalyze }) => {
  const getStoryElementName = (id: string) => {
    const element = storyElements.find(se => se.id === id);
    return element ? element.name : id;
  };

  const elementCount = trama.story_elements.length;
  const hasProblems = trama.story_elements.some(e => !e.role_in_story || !e.personaje_asignado_id);
  
  const cardClass = isSelected 
    ? 'border-blue-500 ring-2 ring-blue-200' 
    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300';

  return (
    <div onClick={() => onSelect(trama.id)} className={'bg-white dark:bg-gray-800 rounded-lg border-2 p-4 transition-all cursor-pointer ' + cardClass}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{trama.titulo}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {elementCount} elementos
            </span>
            {hasProblems && (
              <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded">
                Atencion
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onAnalyze} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300" title="Analizar">Analyze</button>
          <button onClick={() => onDelete(trama.id)} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400" title="Eliminar">Del</button>
        </div>
      </div>

      {trama.story_elements.length > 0 && (
        <div className="space-y-1 mb-3">
          {trama.story_elements.slice(0, 3).map((element, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                {getStoryElementName(element.story_element_id)}
              </span>
              {element.role_in_story && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
                  {element.role_in_story}
                </span>
              )}
            </div>
          ))}
          {trama.story_elements.length > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">+{trama.story_elements.length - 3} more...</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{new Date(trama.creado_en).toLocaleDateString()}</span>
        <span className="truncate max-w-[150px]">{trama.id.slice(0, 8)}...</span>
      </div>
    </div>
  );
};

export default TramaCard;