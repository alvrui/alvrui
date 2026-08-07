import React from 'react';
import { Personaje } from '../../types';

interface PersonajeCardProps {
  personaje: Personaje;
  onEdit: (personaje: Personaje) => void;
  onDelete: (id: string) => void;
}

const PersonajeCard: React.FC<PersonajeCardProps> = ({ personaje, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {personaje.nombre}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">
              {personaje.rol}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(personaje)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Editar"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(personaje.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            title="Eliminar"
          >
            Del
          </button>
        </div>
      </div>

      {personaje.descripcion && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {personaje.descripcion}
        </p>
      )}

      <div className="space-y-2 text-xs">
        {personaje.motivaciones.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Motiv:</span>
            {personaje.motivaciones.map((mot, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {mot}
              </span>
            ))}
          </div>
        )}
        
        {personaje.conflictos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Conf:</span>
            {personaje.conflictos.map((conf, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                {conf}
              </span>
            ))}
          </div>
        )}

        {personaje.rasgos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Rasgos:</span>
            {personaje.rasgos.map((rasgo, i) => (
              <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded">
                {rasgo}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonajeCard;