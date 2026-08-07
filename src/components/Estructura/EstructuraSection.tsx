import React from 'react';
import { Trama, StoryElement, Personaje, AgenteIA } from '../../types';

interface EstructuraSectionProps {
  tramas: Trama[];
  storyElements: StoryElement[];
  personajes: Personaje[];
  agentes: AgenteIA[];
}

const EstructuraSection: React.FC<EstructuraSectionProps> = ({
  tramas,
  storyElements,
  personajes,
  agentes
}) => {
  const agenteEstructura = agentes.find(a => a.seccion_servida === 'estructura');

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Estructura Narrativa</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organiza tus tramas en actos y escenas
            </p>
          </div>
        </div>

        {agenteEstructura && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-8">
            <p className="text-blue-700 dark:text-blue-200">
              <strong>Agente IA disponible:</strong> {agenteEstructura.nombre}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              {agenteEstructura.instrucciones}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Informacion de Estructura
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Esta seccion te permitira organizar tus tramas en una estructura narrativa completa con actos y escenas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tramas Disponibles</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tramas.length} tramas creadas
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Story Elements</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {storyElements.length} elementos disponibles
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Personajes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {personajes.length} personajes creados
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Asistente IA</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {agenteEstructura ? 'Agente de estructura disponible' : 'No hay agente asignado'}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Esta seccion esta en desarrollo. En futuras versiones podras:
            </p>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm mt-2 space-y-1">
              <li>- Crear actos y organizar escenas</li>
              <li>- Generar texto narrativo con IA</li>
              <li>- Visualizar la estructura completa</li>
              <li>- Exportar a formato de guion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstructuraSection;