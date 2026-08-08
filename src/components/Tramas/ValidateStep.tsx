import React from 'react';
import { Trama, StoryElement, Personaje, ProblemaValidacion } from '../../types';

interface ValidateStepProps {
  trama: Trama;
  storyElements: StoryElement[];
  personajes: Personaje[];
  problemasValidacion: ProblemaValidacion[];
  onGenerateRecommendations: () => void;
  onGenerateTitulo: () => void;
  loadingAI: boolean;
}

const ValidateStep: React.FC<ValidateStepProps> = ({
  trama,
  storyElements,
  personajes,
  problemasValidacion,
  onGenerateRecommendations,
  onGenerateTitulo,
  loadingAI
}) => {
  const getValidationStatus = () => {
    const errors = problemasValidacion.filter(p => p.tipo === 'error').length;
    const warnings = problemasValidacion.filter(p => p.tipo === 'advertencia').length;
    
    if (errors > 0) return { status: 'error', message: 'Hay errores criticos que resolver' };
    if (warnings > 0) return { status: 'warning', message: 'Hay advertencias que revisar' };
    return { status: 'success', message: 'Trama coherente' };
  };

  const validation = getValidationStatus();
  
  const coveredPhases = new Set(trama.story_elements.flatMap(e => {
    const se = storyElements.find(s => s.id === e.story_element_id);
    return se ? se.arc_phase_affinity : [];
  })).size;
  
  const totalPhases = new Set(storyElements.flatMap(se => se.arc_phase_affinity)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Validacion de Coherencia
        </h3>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className={"w-12 h-12 rounded-full flex items-center justify-center " + 
            (validation.status === 'success' ? 'bg-green-100' :
             validation.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100')}>
            {validation.status === 'success' && <span className="text-green-700">OK</span>}
            {validation.status === 'warning' && <span className="text-yellow-700">!</span>}
            {validation.status === 'error' && <span className="text-red-700">X</span>}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Estado General</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{validation.message}</p>
          </div>
        </div>
      </div>

      {problemasValidacion.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Problemas Detectados</h4>
          
          {problemasValidacion.filter(p => p.tipo === 'error').length > 0 && (
            <div className="bg-red-50 dark:bg-red-900 rounded-lg p-3">
              <h5 className="text-sm font-medium text-red-700 dark:text-red-200 mb-2">Errores</h5>
              <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                {problemasValidacion.filter(p => p.tipo === 'error').map((problema, index) => (
                  <li key={index}>{problema.mensaje}</li>
                ))}
              </ul>
            </div>
          )}

          {problemasValidacion.filter(p => p.tipo === 'advertencia').length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3">
              <h5 className="text-sm font-medium text-yellow-700 dark:text-yellow-200 mb-2">Advertencias</h5>
              <ul className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
                {problemasValidacion.filter(p => p.tipo === 'advertencia').map((problema, index) => (
                  <li key={index}>{problema.mensaje}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
          <p className="text-green-700 dark:text-green-200">No se detectaron problemas de coherencia</p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          onClick={onGenerateTitulo}
          disabled={loadingAI}
          className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
        >
          {loadingAI ? '...' : 'Generar Titulo con IA'}
        </button>
        <button
          onClick={onGenerateRecommendations}
          disabled={loadingAI}
          className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
        >
          {loadingAI ? '...' : 'Recomendaciones IA'}
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Resumen</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Elementos:</span>
            <span className="ml-2 font-medium">{trama.story_elements.length}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Personajes asignados:</span>
            <span className="ml-2 font-medium">{trama.personajes_asignados.length}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Fases cubiertas:</span>
            <span className="ml-2 font-medium">{coveredPhases}/{totalPhases}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateStep;