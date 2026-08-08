import React, { useMemo } from 'react';
import { StoryElement, FiltroStoryElement } from '../../types';
import StoryElementCard from './StoryElementCard';
import FilterPanel from './FilterPanel';

interface FilterOptions {
  categories: string[];
  subtypes: string[];
  roles: string[];
  arc_phases: string[];
  primary_genres: string[];
  secondary_genres: string[];
  conflict_types: string[];
  narrative_scales: string[];
  stakes_levels: string[];
  periods: string[];
  settings: string[];
}

interface ExploreStepProps {
  storyElements: StoryElement[];
  filteredStoryElements: StoryElement[];
  filterOptions: FilterOptions;
  filtros: FiltroStoryElement;
  setFiltros: (filtros: FiltroStoryElement) => void;
  favoritos: string[];
  recientes: string[];
  onAddFavorito: (id: string) => void;
  onRemoveFavorito: (id: string) => void;
  onAddReciente: (id: string) => void;
  selectedIds: Set<string>;
  onSelectElement: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ExploreStep: React.FC<ExploreStepProps> = ({
  storyElements,
  filteredStoryElements,
  filterOptions,
  filtros,
  setFiltros,
  favoritos,
  recientes,
  onAddFavorito,
  onRemoveFavorito,
  onAddReciente,
  selectedIds,
  onSelectElement,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters
}) => {
  const availableElements = useMemo(() => {
    return filteredStoryElements.filter(se => !selectedIds.has(se.id));
  }, [filteredStoryElements, selectedIds]);

  const searchFilteredElements = useMemo(() => {
    if (!searchQuery) return availableElements;
    const query = searchQuery.toLowerCase();
    return availableElements.filter(se =>
      se.name.toLowerCase().includes(query) ||
      se.logline_usage.toLowerCase().includes(query) ||
      se.spanish_name.toLowerCase().includes(query) ||
      (se.tags_engine && se.tags_engine.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [availableElements, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar Story Elements..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Filtros
          </button>
        </div>
        
        {showFilters && (
          <FilterPanel
            filterOptions={filterOptions}
            filtros={filtros}
            setFiltros={setFiltros}
          />
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {searchFilteredElements.length} elementos disponibles
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
        {searchFilteredElements.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">
            No se encontraron Story Elements
          </p>
        ) : (
          searchFilteredElements.map(storyElement => (
            <div
              key={storyElement.id}
              onClick={() => {
                onSelectElement(storyElement.id);
                onAddReciente(storyElement.id);
              }}
              className={selectedIds.has(storyElement.id) ? 'selected-element cursor-pointer' : 'cursor-pointer'}
            >
              <StoryElementCard
                storyElement={storyElement}
                isFavorite={favoritos.includes(storyElement.id)}
                isRecent={recientes.includes(storyElement.id)}
                onToggleFavorite={() => {
                  if (favoritos.includes(storyElement.id)) {
                    onRemoveFavorito(storyElement.id);
                  } else {
                    onAddFavorito(storyElement.id);
                  }
                }}
                showActions={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExploreStep;