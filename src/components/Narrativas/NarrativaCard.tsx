import React from 'react';
import { Narrativa } from '../../types';

interface NarrativaCardProps {
  narrativa: Narrativa;
  onEdit: (narrativa: Narrativa) => void;
  onDelete: (id: string) => void;
}

const NarrativaCard: React.FC<NarrativaCardProps> = ({ narrativa, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {narrativa.titulo}
          </h3>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(narrativa)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Editar"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(narrativa.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            title="Eliminar"
          >
            Del
          </button>
        </div>
      </div>

      {narrativa.descripcion && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {narrativa.descripcion}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
        <span>ID: {narrativa.id.slice(0, 8)}...</span>
        <span>{new Date(narrativa.creado_en).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default NarrativaCard;