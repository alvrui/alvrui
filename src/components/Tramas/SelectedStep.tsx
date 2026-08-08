import React, { useCallback, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Trama, TramaStoryElement, StoryElement, Personaje, ProblemaValidacion } from '../../types';

interface SelectedStepProps {
  trama: Trama;
  storyElements: StoryElement[];
  personajes: Personaje[];
  onRemoveElement: (elementId: string) => void;
  onUpdateElement: (elementId: string, updates: Partial<TramaStoryElement>) => void;
  onReorder: (draggedIndex: number, hoverIndex: number) => void;
  problemasValidacion: ProblemaValidacion[];
}

const DRAG_TYPE = 'TRAMA_ELEMENT';

interface DragItem {
  id: string;
  index: number;
}

interface DraggableElementProps {
  element: TramaStoryElement;
  index: number;
  storyElement: StoryElement | null;
  personajes: Personaje[];
  onRemove: () => void;
  onUpdate: (updates: Partial<TramaStoryElement>) => void;
  onAssignPersonaje: (role: string, personajeId: string) => void;
  problemas: ProblemaValidacion[];
  moveElement: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  index,
  storyElement,
  personajes,
  onRemove,
  onUpdate,
  onAssignPersonaje,
  problemas,
  moveElement
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ HandlerId }, drop] = useDrop({
    accept: DRAG_TYPE,
    collect(monitor) {
      return {
        HandlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveElement(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: element.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  if (!storyElement) {
    return (
      <div ref={ref} className="bg-red-50 dark:bg-red-900 p-3 rounded mb-2">
        <p className="text-red-700 dark:text-red-200 text-sm">Elemento no encontrado</p>
      </div>
    );
  }

  const opacity = isDragging ? 0.4 : 1;
  const hasProblems = problemas.length > 0;
  const availableRoles = storyElement.role_in_story.length > 0 ? storyElement.role_in_story : ['protagonist', 'antagonist', 'ally', 'mentor'];
  const assignedPersonaje = personajes.find(p => p.id === element.personaje_asignado_id);

  return (
    <div ref={ref} style={{ opacity }} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">≡</span>
            <h4 className="font-medium text-gray-900 dark:text-white">{storyElement.name}</h4>
            {hasProblems && (
              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded">!</span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{storyElement.logline_usage}</p>
        </div>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 p-1">X</button>
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rol</label>
          <select
            value={element.role_in_story || ''}
            onChange={(e) => onUpdate({ role_in_story: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {availableRoles.map(rol => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Personaje</label>
          <select
            value={element.personaje_asignado_id || ''}
            onChange={(e) => {
              if (element.role_in_story && e.target.value) {
                onAssignPersonaje(element.role_in_story, e.target.value);
              }
            }}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Seleccionar...</option>
            {personajes.map(personaje => (
              <option key={personaje.id} value={personaje.id}>{personaje.nombre}</option>
            ))}
          </select>
          {assignedPersonaje && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
              Asignado: {assignedPersonaje.nombre}
            </span>
          )}
        </div>
      </div>

      {element.descripcion_personalizada && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400">{element.descripcion_personalizada}</p>
        </div>
      )}

      {hasProblems && (
        <div className="mt-2">
          {problemas.map((problema, index) => (
            <p key={index} className="text-xs text-yellow-700 dark:text-yellow-200">
              {problema.mensaje}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectedStep: React.FC<SelectedStepProps> = ({
  trama,
  storyElements,
  personajes,
  onRemoveElement,
  onUpdateElement,
  onReorder,
  problemasValidacion
}) => {
  const getProblemasForElement = useCallback((elementId: string) => {
    return problemasValidacion.filter(p => p.elemento_id === elementId);
  }, [problemasValidacion]);

  if (trama.story_elements.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No hay Story Elements seleccionados
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Ve al paso Explorar para buscar y seleccionar elementos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Elementos Seleccionados ({trama.story_elements.length})
        </h3>
      </div>

      <div className="space-y-3">
        {trama.story_elements.map((element, index) => {
          const storyElement = storyElements.find(se => se.id === element.story_element_id);
          const problemas = getProblemasForElement(element.id);

          return (
            <DraggableElement
              key={element.id}
              element={element}
              index={index}
              storyElement={storyElement || null}
              personajes={personajes}
              onRemove={() => onRemoveElement(element.id)}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
              onAssignPersonaje={(role, personajeId) => {
                const updatedElement = {
                  ...element,
                  role_in_story: role,
                  personaje_asignado_id: personajeId
                };
                onUpdateElement(element.id, updatedElement);
              }}
              problemas={problemas}
              moveElement={onReorder}
            />
          );
        })}
      </div>

      {problemasValidacion.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Problemas de Validacion
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {problemasValidacion.map((problema, index) => (
              <li key={index}>{problema.mensaje}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectedStep;