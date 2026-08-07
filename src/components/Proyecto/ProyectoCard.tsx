import React from 'react';
import { Proyecto } from '../../types';

interface ProyectoCardProps {
  proyecto: Proyecto;
  isActual: boolean;
  onEdit: (proyecto: Proyecto) => void;
  onDelete: (id: string) => void;
  onSetActual: (id: string) => void;
}

const ProyectoCard: React.FC<ProyectoCardProps> = ({
  proyecto,
  isActual,
  onEdit,
  onDelete,
  onSetActual
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border-2 
      ${isActual ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}
      p-4 transition-all hover:shadow-md
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {proyecto.nombre}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            {proyecto.tipo_narrativa && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 
                             rounded text-xs">
                {proyecto.tipo_narrativa}
              </span>
            )}
            {proyecto.estilo && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 
                             rounded text-xs">
                {proyecto.estilo}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onSetActual(proyecto.id)}
            className={`
              p-1 rounded text-sm
              ${isActual 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }
            `}
            title="Seleccionar como proyecto actual"
          >
            {isActual ? '★' : '☆'}
          </button>
          <button
            onClick={() => onEdit(proyecto)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(proyecto.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      {proyecto.descripcion && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {proyecto.descripcion}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Contextos: {proyecto.contextos.length}</span>
        <span>Adjuntos: {proyecto.adjuntos.length}</span>
      </div>
    </div>
  );
};

export default ProyectoCard;