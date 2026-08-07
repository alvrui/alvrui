import React, { useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import {
  Trama,
  TramaStoryElement,
  StoryElement,
  Personaje,
  ProblemaValidacion,
  AgenteIA,
  FiltroStoryElement,
} from '../../types';
import { filtrarStoryElements } from '../../utils/filtering';
import { validarAsignacionPersonaje, validarCompatibilidadGenero } from '../../utils/validation';
import StoryElementCard from './StoryElementCard';
import FilterPanel from './FilterPanel';
import SelectedElementsList from './SelectedElementsList';

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

interface TramaBuilderProps {
  trama: Trama;
  storyElements: StoryElement[];
  filteredStoryElements: StoryElement[];
  personajes: Personaje[];
  filterOptions: FilterOptions;
  filtros: FiltroStoryElement;
  setFiltros: (filtros: FiltroStoryElement) => void;
  favoritos: string[];
  recientes: string[];
  onAddFavorito: (id: string) => void;
  onRemoveFavorito: (id: string) => void;
  onAddReciente: (id: string) => void;
  onUpdateTrama: (trama: Trama) => void;
  onClose: () => void;
  problemasValidacion: ProblemaValidacion[];
  onGenerateRecommendations: () => void;
  onGenerateTitulo: () => void;
  loadingAI: boolean;
  agente?: AgenteIA | null;
}

const DRAG_TYPE = 'STORY_ELEMENT';

interface DragItem {
  id: string;
  index: number;
}

interface DraggableStoryElementProps {
  storyElement: StoryElement;
  index: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isFavorite: boolean;
  isRecent: boolean;
  onToggleFavorite: (id: string) => void;
}

const DraggableStoryElement: React.FC<DraggableStoryElementProps> = ({
  storyElement,
  index,
  onSelect,
  isSelected,
  isFavorite,
  isRecent,
  onToggleFavorite
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: storyElement.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={drag}
      onClick={() => onSelect(storyElement.id)}
      style={{ opacity }}
      className={isSelected ? 'selected-element' : ''}
    >
      <StoryElementCard
        storyElement={storyElement}
        isFavorite={isFavorite}
        isRecent={isRecent}
        onToggleFavorite={() => onToggleFavorite(storyElement.id)}
        showActions={true}
      />
    </div>
  );
};

interface DropZoneProps {
  children: React.ReactNode;
  onDrop: (item: DragItem) => void;
  canDrop: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ children, onDrop, canDrop }) => {
  const [{ handlerId }, drop] = useDrop({
    accept: DRAG_TYPE,
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!canDrop) return;
      onDrop(item);
    },
  });

  return (
    <div ref={drop} data-handler-id={handlerId} className="min-h-[100px]">
      {children}
    </div>
  );
};

const TramaBuilder: React.FC<TramaBuilderProps> = ({
  trama,
  storyElements,
  filteredStoryElements,
  personajes,
  filterOptions,
  filtros,
  setFiltros,
  favoritos,
  recientes,
  onAddFavorito,
  onRemoveFavorito,
  onAddReciente,
  onUpdateTrama,
  onClose,
  problemasValidacion,
  onGenerateRecommendations,
  onGenerateTitulo,
  loadingAI,
  agente
}) => {
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTitulo, setEditingTitulo] = useState(false);
  const [newTitulo, setNewTitulo] = useState(trama.titulo);

  // Selected elements in the trama
  const selectedInTrama = useMemo(() => {
    return new Set(trama.story_elements.map(e => e.story_element_id));
  }, [trama.story_elements]);

  // Filter elements not already in the trama
  const availableElements = useMemo(() => {
    return filteredStoryElements.filter(se => !selectedInTrama.has(se.id));
  }, [filteredStoryElements, selectedInTrama]);

  // Search filtered elements
  const searchFilteredElements = useMemo(() => {
    if (!searchQuery) return availableElements;
    const query = searchQuery.toLowerCase();
    return availableElements.filter(se =>
      se.name.toLowerCase().includes(query) ||
      se.logline_usage.toLowerCase().includes(query) ||
      se.tags_engine.some(tag => tag.toLowerCase().includes(query))
    );
  }, [availableElements, searchQuery]);

  // Add element to trama
  const handleAddElement = useCallback((storyElementId: string) => {
    const storyElement = storyElements.find(se => se.id === storyElementId);
    if (!storyElement) return;

    // Check if already in trama
    if (selectedInTrama.has(storyElementId)) return;

    const newStoryElement: TramaStoryElement = {
      id: uuidv4(),
      story_element_id: storyElementId,
      orden: trama.story_elements.length,
      role_in_story: storyElement.role_in_story[0] || '',
      descripcion_personalizada: '',
      atributos_personalizados: {},
    };

    const updatedTrama: Trama = {
      ...trama,
      story_elements: [...trama.story_elements, newStoryElement],
      actualizado_en: new Date().toISOString(),
    };

    onUpdateTrama(updatedTrama);
    onAddReciente(storyElementId);
  }, [storyElements, selectedInTrama, trama, onUpdateTrama, onAddReciente]);

  // Remove element from trama
  const handleRemoveElement = useCallback((elementId: string) => {
    const updatedTrama: Trama = {
      ...trama,
      story_elements: trama.story_elements.filter(e => e.id !== elementId),
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
  }, [trama, onUpdateTrama]);

  // Update element in trama
  const handleUpdateElement = useCallback((elementId: string, updates: Partial<TramaStoryElement>) => {
    const updatedTrama: Trama = {
      ...trama,
      story_elements: trama.story_elements.map(e =>
        e.id === elementId ? { ...e, ...updates } : e
      ),
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
  }, [trama, onUpdateTrama]);

  // Reorder elements
  const handleReorder = useCallback((draggedIndex: number, hoverIndex: number) => {
    const draggedElement = trama.story_elements[draggedIndex];
    const newElements = [...trama.story_elements];
    newElements.splice(draggedIndex, 1);
    newElements.splice(hoverIndex, 0, draggedElement);

    const updatedTrama: Trama = {
      ...trama,
      story_elements: newElements.map((e, index) => ({ ...e, orden: index })),
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
  }, [trama, onUpdateTrama]);

  // Assign character to role
  const handleAssignPersonaje = useCallback((elementId: string, role: string, personajeId: string) => {
    // Validate assignment
    const problemas = validarAsignacionPersonaje(personajeId, role, trama, personajes);
    if (problemas.length > 0 && problemas[0].tipo === 'error') {
      alert('No se puede asignar: ' + problemas[0].mensaje);
      return;
    }

    const updatedTrama: Trama = {
      ...trama,
      story_elements: trama.story_elements.map(e => {
        if (e.id === elementId) {
          return {
            ...e,
            role_in_story: role,
            personaje_asignado_id: personajeId,
          };
        }
        return e;
      }),
      personajes_asignados: [
        ...trama.personajes_asignados.filter(pa => pa.story_element_id !== elementId),
        { trama_id: trama.id, story_element_id: elementId, role, personaje_id: personajeId }
      ],
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
  }, [trama, personajes, onUpdateTrama]);

  // Save title
  const handleSaveTitulo = useCallback(() => {
    const updatedTrama: Trama = {
      ...trama,
      titulo: newTitulo,
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
    setEditingTitulo(false);
  }, [trama, newTitulo, onUpdateTrama]);

  // Toggle favorite
  const handleToggleFavorite = useCallback((elementId: string) => {
    if (favoritos.includes(elementId)) {
      onRemoveFavorito(elementId);
    } else {
      onAddFavorito(elementId);
    }
  }, [favoritos, onAddFavorito, onRemoveFavorito]);

  // Get validation problems for a specific element
  const getProblemasForElement = useCallback((elementId: string) => {
    return problemasValidacion.filter(p => p.elemento_id === elementId);
  }, [problemasValidacion]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ← Volver
              </button>
              
              {editingTitulo ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTitulo}
                    onChange={(e) => setNewTitulo(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitulo}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingTitulo(false);
                      setNewTitulo(trama.titulo);
                    }}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {trama.titulo}
                  </h3>
                  <button
                    onClick={() => setEditingTitulo(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Editar titulo"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onGenerateTitulo}
                    disabled={loadingAI}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50"
                    title="Generar titulo con IA"
                  >
                    {loadingAI ? '...' : 'IA'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onGenerateRecommendations}
                disabled={loadingAI}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
              >
                {loadingAI ? '...' : 'Recomendaciones IA'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                X
              </button>
            </div>
          </div>
          
          {agente && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Asistido por: {agente.nombre}
            </p>
          )}
        </div>

        <div className="p-6">
          {/* Main Layout: Catalog on left, Builder on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Catalog */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar Story Elements..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Filtros
                  </button>
                </div>

                {showFilters && (
                  <FilterPanel
                    filterOptions={filterOptions}
                    filtros={filtros}
                    setFiltros={setFiltros}
                    className="mb-4"
                  />
                )}
              </div>

              {/* Story Elements Catalog */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {searchFilteredElements.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No se encontraron Story Elements
                  </p>
                ) : (
                  searchFilteredElements.map((storyElement, index) => (
                    <DraggableStoryElement
                      key={storyElement.id}
                      storyElement={storyElement}
                      index={index}
                      onSelect={(id) => {
                        handleAddElement(id);
                        setSelectedElementIds(new Set([...selectedElementIds, id]));
                      }}
                      isSelected={selectedElementIds.has(storyElement.id)}
                      isFavorite={favoritos.includes(storyElement.id)}
                      isRecent={recientes.includes(storyElement.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Trama Builder */}
            <div className="lg:col-span-2">
              <SelectedElementsList
                trama={trama}
                storyElements={storyElements}
                personajes={personajes}
                onRemoveElement={handleRemoveElement}
                onUpdateElement={handleUpdateElement}
                onReorder={handleReorder}
                onAssignPersonaje={handleAssignPersonaje}
                getProblemasForElement={getProblemasForElement}
                problemasValidacion={problemasValidacion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TramaBuilder;