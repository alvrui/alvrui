import React from 'react';
import { AgenteIA } from '../../types';

interface AgenteCardProps {
  agente: AgenteIA;
  onEdit: (agente: AgenteIA) => void;
  onDelete: (id: string) => void;
}

const AgenteCard: React.FC<AgenteCardProps> = ({ agente, onEdit, onDelete }) => {
  const seccionNames: Record<AgenteIA['seccion_servida'], string> = {
    proyecto: 'Proyecto',
    personajes: 'Personajes',
    narrativas: 'Narrativas',
    tramas: 'Tramas',
    estructura: 'Estructura',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{agente.nombre}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">
            {seccionNames[agente.seccion_servida] || agente.seccion_servida}
          </span>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(agente)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Editar"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(agente.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            title="Eliminar"
          >
            Del
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {agente.instrucciones}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Contexto: {agente.campos_contexto.length} campos</span>
        <span>{new Date(agente.creado_en).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AgenteCard;