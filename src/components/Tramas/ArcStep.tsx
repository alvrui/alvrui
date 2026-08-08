import React from 'react';
import { Trama, TramaStoryElement, StoryElement, Personaje } from '../../types';

interface ArcStepProps {
  trama: Trama;
  storyElements: StoryElement[];
  onRemoveElement: (elementId: string) => void;
  personajes: Personaje[];
}

const ArcStep: React.FC<ArcStepProps> = ({
  trama,
  storyElements,
  onRemoveElement,
  personajes
}) => {
  const arcPhases = ['setup', 'inciting_incident', 'first_plot_point', 'midpoint', 'second_plot_point', 'climax', 'resolution', 'denouement'];
  
  const elementsByPhase: Record<string, { element: TramaStoryElement; storyElement: StoryElement | null }[]> = {};
  
  trama.story_elements.forEach(element => {
    const storyElement = storyElements.find(se => se.id === element.story_element_id);
    if (storyElement) {
      const primaryPhase = storyElement.arc_phase_affinity[0] || 'setup';
      if (!elementsByPhase[primaryPhase]) {
        elementsByPhase[primaryPhase] = [];
      }
      elementsByPhase[primaryPhase].push({ element, storyElement });
    }
  });

  const getCharacterName = (personajeId: string | undefined) => {
    if (!personajeId) return 'Sin asignar';
    const personaje = personajes.find(p => p.id === personajeId);
    return personaje ? personaje.nombre : personajeId;
  };

  const coveredPhases = Object.keys(elementsByPhase).length;
  const totalPhases = arcPhases.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Arco Narrativo: {trama.titulo}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {coveredPhases}/{totalPhases} fases cubiertas
        </span>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-4">
        {arcPhases.map(phase => {
          const phaseElements = elementsByPhase[phase] || [];
          const hasElements = phaseElements.length > 0;
          const phaseName = phase.replace(/_/g, ' ').toUpperCase();
          
          return (
            <div key={phase} className="flex-shrink-0 w-64">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{phaseName}</h4>
              </div>
              
              {hasElements ? (
                <div className="space-y-2">
                  {phaseElements.map(({ element, storyElement }) => {
                    if (!storyElement) return null;
                    
                    return (
                      <div
                        key={element.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {storyElement.name}
                            </p>
                            {element.role_in_story && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Role: {element.role_in_story}
                              </p>
                            )}
                            {element.personaje_asignado_id && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Personaje: {getCharacterName(element.personaje_asignado_id)}
                              </p>
                            )}
                          </div>
                          <button 
                            onClick={() => onRemoveElement(element.id)} 
                            className="text-gray-400 hover:text-red-500 text-sm"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vacio</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {arcPhases.map(phase => (
          <span key={phase} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
            {phase.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Arrastrar elementos entre fases para reordenar
      </p>
    </div>
  );
};

export default ArcStep;