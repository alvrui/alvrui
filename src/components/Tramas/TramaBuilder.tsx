import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import ExploreStep from './ExploreStep';
import SelectedStep from './SelectedStep';
import ArcStep from './ArcStep';
import AssignStep from './AssignStep';
import ValidateStep from './ValidateStep';

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

interface TramasBuilderProps {
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

const TramasBuilder: React.FC<TramasBuilderProps> = ({
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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingTitulo, setEditingTitulo] = useState(false);
  const [newTitulo, setNewTitulo] = useState(trama.titulo);

  const selectedInTrama = useMemo(() => {
    return new Set(trama.story_elements.map(e => e.story_element_id));
  }, [trama.story_elements]);

  const handleAddElement = useCallback((storyElementId: string) => {
    const storyElement = storyElements.find(se => se.id === storyElementId);
    if (!storyElement) return;
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

  const handleRemoveElement = useCallback((elementId: string) => {
    const updatedTrama: Trama = {
      ...trama,
      story_elements: trama.story_elements.filter(e => e.id !== elementId),
      personajes_asignados: trama.personajes_asignados.filter(pa => pa.story_element_id !== elementId),
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
  }, [trama, onUpdateTrama]);

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

  const handleAssignPersonaje = useCallback((elementId: string, role: string, personajeId: string) => {
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
  }, [trama, onUpdateTrama]);

  const handleSaveTitulo = useCallback(() => {
    const updatedTrama: Trama = {
      ...trama,
      titulo: newTitulo,
      actualizado_en: new Date().toISOString(),
    };
    onUpdateTrama(updatedTrama);
    setEditingTitulo(false);
  }, [trama, newTitulo, onUpdateTrama]);

  const getStepProgress = (step: number) => {
    switch (step) {
      case 1:
        return filteredStoryElements.length > 0 ? 'complete' : 'incomplete';
      case 2:
        return trama.story_elements.length > 0 ? 'complete' : 'incomplete';
      case 3:
        const phasesCovered = new Set(trama.story_elements.flatMap(e => {
          const se = storyElements.find(s => s.id === e.story_element_id);
          return se ? se.arc_phase_affinity : [];
        })).size;
        return phasesCovered >= 3 ? 'complete' : 'warning';
      case 4:
        const unassigned = trama.story_elements.filter(e => {
          const se = storyElements.find(s => s.id === e.story_element_id);
          return se && se.role_in_story.length > 0 && !e.personaje_asignado_id;
        }).length;
        return unassigned === 0 ? 'complete' : 'warning';
      case 5:
        return problemasValidacion.length === 0 ? 'complete' : 'warning';
      default:
        return 'incomplete';
    }
  };

  const stepNames = [
    'Explorar',
    'Seleccionados', 
    'Arco Narrativo',
    'Asignar Personajes',
    'Validar'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Volver
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
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingTitulo(false);
                      setNewTitulo(trama.titulo);
                    }}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 text-sm"
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
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
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

        {/* Tabs Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {stepNames.map((name, index) => {
                const stepNum = index + 1 as 1 | 2 | 3 | 4 | 5;
                const progress = getStepProgress(stepNum);
                const isActive = activeStep === stepNum;
                
                return (
                  <button
                    key={stepNum}
                    onClick={() => setActiveStep(stepNum)}
                    className={'px-4 py-2 rounded-t-md text-sm font-medium transition-colors ' + 
                      (isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-b-2 border-blue-500' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')
                    }
                  >
                    <span className="mr-1">{stepNum}.</span>
                    {name}
                    {progress === 'complete' && !isActive && <span className="ml-1">OK</span>}
                    {progress === 'warning' && !isActive && <span className="ml-1">!</span>}
                    {progress === 'incomplete' && !isActive && <span className="ml-1">-</span>}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {trama.story_elements.length} elementos
              </span>
              <span className={'px-2 py-0.5 rounded ' + 
                (problemasValidacion.length === 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  : problemasValidacion.some(p => p.tipo === 'error')
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200')
              }>
                {problemasValidacion.length} problemas
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {activeStep === 1 && (
            <ExploreStep
              storyElements={storyElements}
              filteredStoryElements={filteredStoryElements}
              filterOptions={filterOptions}
              filtros={filtros}
              setFiltros={setFiltros}
              favoritos={favoritos}
              recientes={recientes}
              onAddFavorito={onAddFavorito}
              onRemoveFavorito={onRemoveFavorito}
              onAddReciente={onAddReciente}
              selectedIds={selectedInTrama}
              onSelectElement={handleAddElement}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          )}

          {activeStep === 2 && (
            <SelectedStep
              trama={trama}
              storyElements={storyElements}
              personajes={personajes}
              onRemoveElement={handleRemoveElement}
              onUpdateElement={handleUpdateElement}
              onReorder={handleReorder}
              problemasValidacion={problemasValidacion}
            />
          )}

          {activeStep === 3 && (
            <ArcStep
              trama={trama}
              storyElements={storyElements}
              onRemoveElement={handleRemoveElement}
              personajes={personajes}
            />
          )}

          {activeStep === 4 && (
            <AssignStep
              trama={trama}
              storyElements={storyElements}
              personajes={personajes}
              onAssignPersonaje={handleAssignPersonaje}
            />
          )}

          {activeStep === 5 && (
            <ValidateStep
              trama={trama}
              storyElements={storyElements}
              personajes={personajes}
              problemasValidacion={problemasValidacion}
              onGenerateRecommendations={onGenerateRecommendations}
              onGenerateTitulo={onGenerateTitulo}
              loadingAI={loadingAI}
            />
          )}
        </div>

        {/* Step Navigation */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {activeStep > 1 && (
                <button
                  onClick={() => setActiveStep((activeStep - 1) as 1 | 2 | 3 | 4 | 5)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Anterior
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {activeStep < 5 && (
                <button
                  onClick={() => setActiveStep((activeStep + 1) as 1 | 2 | 3 | 4 | 5)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Siguiente
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TramasBuilder;