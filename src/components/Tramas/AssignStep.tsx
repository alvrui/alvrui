import React from 'react';
import { Trama, TramaStoryElement, StoryElement, Personaje } from '../../types';

interface AssignStepProps {
  trama: Trama;
  storyElements: StoryElement[];
  personajes: Personaje[];
  onAssignPersonaje: (elementId: string, role: string, personajeId: string) => void;
}

const AssignStep: React.FC<AssignStepProps> = ({
  trama,
  storyElements,
  personajes,
  onAssignPersonaje
}) => {
  const elementsWithRoles = trama.story_elements.filter(e => {
    const storyElement = storyElements.find(se => se.id === e.story_element_id);
    return storyElement && storyElement.role_in_story.length > 0;
  });

  const getStoryElement = (id: string) => storyElements.find(se => se.id === id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Asignar Personajes a Roles
        </h3>
      </div>

      {elementsWithRoles.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No hay elementos con roles para asignar
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Ve al paso Explorar y selecciona elementos con roles definidos
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personajes Disponibles</h4>
            <div className="flex flex-wrap gap-2">
              {personajes.map(personaje => {
                const assignedCount = trama.story_elements.filter(e => e.personaje_asignado_id === personaje.id).length;
                return (
                  <span
                    key={personaje.id}
                    className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm border border-gray-200 dark:border-gray-500"
                  >
                    {personaje.nombre} ({personaje.rol}) - Asignado: {assignedCount}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {elementsWithRoles.map(element => {
              const storyElement = getStoryElement(element.story_element_id);
              if (!storyElement) return null;

              const assignedPersonaje = personajes.find(p => p.id === element.personaje_asignado_id);

              return (
                <div
                  key={element.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{storyElement.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{storyElement.logline_usage}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Roles disponibles
                    </label>
                    
                    {storyElement.role_in_story.map(rol => {
                      const isAssigned = element.role_in_story === rol && !!element.personaje_asignado_id;
                      return (
                        <div key={rol} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">{rol}</span>
                          <select
                            value={isAssigned ? element.personaje_asignado_id : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                onAssignPersonaje(element.id, rol, e.target.value);
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Seleccionar personaje...</option>
                            {personajes.map(personaje => (
                              <option key={personaje.id} value={personaje.id}>
                                {personaje.nombre} ({personaje.rol})
                              </option>
                            ))}
                          </select>
                          {isAssigned && assignedPersonaje && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                              Asignado
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignStep;