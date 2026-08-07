import React from 'react';
import { FiltroStoryElement } from '../../types';

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

interface FilterPanelProps {
  filterOptions: FilterOptions;
  filtros: FiltroStoryElement;
  setFiltros: (filtros: FiltroStoryElement) => void;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  filtros,
  setFiltros,
  className = ''
}) => {
  const handleToggleFilter = (category: string, value: string) => {
    const currentValues = filtros[category as keyof FiltroStoryElement] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setFiltros({
      ...filtros,
      [category]: newValues.length > 0 ? newValues : undefined,
      busqueda: undefined
    });
  };

  const handleClearAll = () => {
    setFiltros({});
  };

  const hasActiveFilters = Object.values(filtros).some(v => v && (Array.isArray(v) ? v.length > 0 : v));

  const getFilterButtonClass = (category: string, value: string) => {
    const isActive = filtros[category as keyof FiltroStoryElement]?.includes(value);
    return isActive
      ? 'block text-left text-xs px-2 py-1 rounded bg-blue-600 text-white'
      : 'block text-left text-xs px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500';
  };

  return (
    <div className={'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ' + className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Filtros</h4>
        {hasActiveFilters && (
          <button onClick={handleClearAll} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800">Limpiar todo</button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filterOptions.categories.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Categoria</h5>
            <div className="space-y-1">
              {filterOptions.categories.slice(0, 5).map(category => (
                <button key={category} onClick={() => handleToggleFilter('category', category)} className={getFilterButtonClass('category', category)}>{category}</button>
              ))}
            </div>
          </div>
        )}

        {filterOptions.roles.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Rol</h5>
            <div className="space-y-1">
              {filterOptions.roles.slice(0, 5).map(role => (
                <button key={role} onClick={() => handleToggleFilter('role_in_story', role)} className={getFilterButtonClass('role_in_story', role)}>{role}</button>
              ))}
            </div>
          </div>
        )}

        {filterOptions.primary_genres.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Genero</h5>
            <div className="space-y-1">
              {filterOptions.primary_genres.slice(0, 5).map(genre => (
                <button key={genre} onClick={() => handleToggleFilter('primary_genres', genre)} className={getFilterButtonClass('primary_genres', genre)}>{genre}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;