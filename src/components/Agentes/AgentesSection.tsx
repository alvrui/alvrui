import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AgenteIA } from '../../types';
import { agentesIAIniciales } from '../../utils/ai';
import AgenteCard from './AgenteCard';

interface AgentesSectionProps {
  agentes: AgenteIA[];
  setAgentes: (agentes: AgenteIA[]) => void;
}

const AgentesSection: React.FC<AgentesSectionProps> = ({ agentes, setAgentes }) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingAgente, setEditingAgente] = useState<AgenteIA | null>(null);
  const [formData, setFormData] = useState<Partial<AgenteIA>>({
    nombre: '',
    seccion_servida: 'proyecto',
    instrucciones: '',
    campos_contexto: [],
  });

  const secciones = ['proyecto', 'personajes', 'narrativas', 'tramas', 'estructura'] as const;

  const handleCreate = () => {
    setEditingAgente(null);
    setFormData({
      nombre: '',
      seccion_servida: 'proyecto',
      instrucciones: '',
      campos_contexto: [],
    });
    setShowNewForm(true);
  };

  const handleEdit = (agente: AgenteIA) => {
    setEditingAgente(agente);
    setFormData({ ...agente });
    setShowNewForm(true);
  };

  const handleSave = () => {
    if (editingAgente) {
      setAgentes(agentes.map(a => 
        a.id === editingAgente.id 
          ? { ...a, ...formData, actualizado_en: new Date().toISOString() }
          : a
      ));
    } else {
      const nuevoAgente: AgenteIA = {
        id: uuidv4(),
        nombre: formData.nombre || 'Nuevo Agente',
        seccion_servida: formData.seccion_servida || 'proyecto',
        instrucciones: formData.instrucciones || '',
        campos_contexto: formData.campos_contexto || [],
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      };
      setAgentes([...agentes, nuevoAgente]);
    }
    setShowNewForm(false);
    setEditingAgente(null);
  };

  const handleDelete = (id: string) => {
    if (agentes.length <= 1) {
      alert('Debe haber al menos un agente IA');
      return;
    }
    if (window.confirm('¿Estas seguro de que quieres eliminar este agente?')) {
      setAgentes(agentes.filter(a => a.id !== id));
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Restablecer agentes a los valores iniciales?')) {
      setAgentes(agentesIAIniciales);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Agentes de IA</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configura y gestiona los agentes de IA especializados
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + Nuevo Agente
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Restablecer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {agentes.map(agente => (
            <AgenteCard
              key={agente.id}
              agente={agente}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informacion
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Los agentes de IA son asistentes especializados que te ayudan en diferentes areas de tu proyecto narrativo.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Cada agente esta configurado para trabajar con una seccion especifica y puede utilizar el contexto relevante para generar propuestas coherentes.
          </p>
        </div>

        {showNewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingAgente ? 'Editar Agente' : 'Nuevo Agente'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowNewForm(false);
                      setEditingAgente(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    X
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Asistente de Personajes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seccion
                  </label>
                  <select
                    value={formData.seccion_servida || 'proyecto'}
                    onChange={(e) => setFormData({ ...formData, seccion_servida: e.target.value as AgenteIA['seccion_servida'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {secciones.map(seccion => (
                      <option key={seccion} value={seccion}>
                        {seccion.charAt(0).toUpperCase() + seccion.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instrucciones
                  </label>
                  <textarea
                    value={formData.instrucciones || ''}
                    onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Descripcion de lo que hace este agente..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campos de Contexto
                  </label>
                  <input
                    type="text"
                    value={(formData.campos_contexto || []).join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      campos_contexto: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Separados por comas: nombre, descripcion, etc."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Campos que el agente puede utilizar para generar contexto
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNewForm(false);
                      setEditingAgente(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingAgente ? 'Guardar Cambios' : 'Crear Agente'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentesSection;