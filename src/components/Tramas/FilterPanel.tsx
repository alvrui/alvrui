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

  // Filter groups in priority order
  const filterGroups = [
    {
      title: 'Genero y Ambientacion',
      filters: [
        { key: 'primary_genres', label: 'Generos Principales', options: filterOptions.primary_genres },
        { key: 'secondary_genres', label: 'Generos Secundarios', options: filterOptions.secondary_genres },
        { key: 'default_settings', label: 'Entornos', options: filterOptions.settings },
        { key: 'default_periods', label: 'Periodos', options: filterOptions.periods },
      ]
    },
    {
      title: 'Personajes y Roles',
      filters: [
        { key: 'category', label: 'Categoria', options: filterOptions.categories },
        { key: 'subtype', label: 'Subtipo', options: filterOptions.subtypes },
        { key: 'role_in_story', label: 'Rol en Historia', options: filterOptions.roles },
        { key: 'narrative_scale', label: 'Escala Narrativa', options: filterOptions.narrative_scales },
      ]
    },
    {
      title: 'Estructura y Conflicto',
      filters: [
        { key: 'arc_phase_affinity', label: 'Fases del Arco', options: filterOptions.arc_phases },
        { key: 'conflict_type', label: 'Tipo de Conflicto', options: filterOptions.conflict_types },
        { key: 'stakes_level', label: 'Nivel de Apuesta', options: filterOptions.stakes_levels },
      ]
    }
  ];

  return (
    <div className={'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ' + className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Filtros</h4>
        {hasActiveFilters && (
          <button onClick={handleClearAll} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800">Limpiar todo</button>
        )}
      </div>

      {filterGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-gray-600 pb-1">
            {group.title}
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {group.filters.map((filter, filterIndex) => (
              filter.options.length > 0 && (
                <div key={filterIndex}>
                  <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{filter.label}</h6>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {filter.options.map(option => (
                      <button 
                        key={option} 
                        onClick={() => handleToggleFilter(filter.key, option)}
                        className={getFilterButtonClass(filter.key, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;