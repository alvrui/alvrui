import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Proyecto, Contexto, Adjunto, AgenteIA } from '../../types';

interface ProyectoFormProps {
  proyecto?: Proyecto | null;
  onSave: (proyecto: Partial<Proyecto>) => void;
  onCancel: () => void;
  onGenerateSuggestions: (proyecto: Partial<Proyecto>) => void;
  loadingSuggestions: boolean;
  agente?: AgenteIA | null;
}

const ProyectoForm: React.FC<ProyectoFormProps> = ({
  proyecto,
  onSave,
  onCancel,
  onGenerateSuggestions,
  loadingSuggestions,
  agente
}) => {
  const [formData, setFormData] = useState<Partial<Proyecto>>({
    nombre: '',
    tipo_narrativa: '',
    estilo: '',
    contextos: [],
    adjuntos: [],
  });

  const [newContexto, setNewContexto] = useState<Omit<Contexto, 'id'>>({
    tipo: 'historico',
    descripcion: '',
  });

  const [newAdjunto, setNewAdjunto] = useState<Omit<Adjunto, 'id'>>({
    nombre: '',
    tipo: 'documento',
    url: '',
    tamano: 0,
  });

  useEffect(() => {
    if (proyecto) {
      setFormData({ ...proyecto });
    }
  }, [proyecto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContexto = () => {
    if (newContexto.descripcion.trim()) {
      const newContext: Contexto = {
        id: uuidv4(),
        ...newContexto,
      };
      setFormData(prev => ({
        ...prev,
        contextos: [...(prev.contextos || []), newContext],
      }));
      setNewContexto({ tipo: 'historico', descripcion: '' });
    }
  };

  const handleRemoveContexto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contextos: prev.contextos?.filter(c => c.id !== id) || [],
    }));
  };

  const handleAddAdjunto = () => {
    if (newAdjunto.nombre.trim() && newAdjunto.url.trim()) {
      const newAttachment: Adjunto = {
        id: uuidv4(),
        ...newAdjunto,
      };
      setFormData(prev => ({
        ...prev,
        adjuntos: [...(prev.adjuntos || []), newAttachment],
      }));
      setNewAdjunto({ nombre: '', tipo: 'documento', url: '', tamano: 0 });
    }
  };

  const handleRemoveAdjunto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      adjuntos: prev.adjuntos?.filter(a => a.id !== id) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleGenerate = () => {
    onGenerateSuggestions(formData);
  };

  const contextoTypes = ['historico', 'social', 'geografico', 'temporal', 'cultural'];
  const adjuntoTypes = ['documento', 'imagen', 'audio', 'video'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {proyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          {agente && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Asistido por: {agente.nombre}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Mi Gran Historia"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Narrativa
              </label>
              <div className="flex space-x-2">
                <select
                  name="tipo_narrativa"
                  value={formData.tipo_narrativa || ''}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="drama">Drama</option>
                  <option value="comedia">Comedia</option>
                  <option value="thriller">Thriller</option>
                  <option value="aventura">Aventura</option>
                  <option value="misterio">Misterio</option>
                  <option value="romance">Romance</option>
                  <option value="accion">Accion</option>
                  <option value="ciencia_ficcion">Ciencia Ficcion</option>
                  <option value="fantasia">Fantasia</option>
                  <option value="terror">Terror</option>
                </select>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loadingSuggestions}
                  className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 
                             rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Generar sugerencias con IA"
                >
                  {loadingSuggestions ? '...' : '🤖'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estilo
              </label>
              <select
                name="estilo"
                value={formData.estilo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar...</option>
                <option value="realista">Realista</option>
                <option value="estilizado">Estilizado</option>
                <option value="poetico">Poetico</option>
                <option value="minimalista">Minimalista</option>
                <option value="experimental">Experimental</option>
                <option value="clasico">Clasico</option>
                <option value="moderno">Moderno</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripcion
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descripcion general del proyecto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contextos
            </label>
            
            <div className="space-y-2 mb-3">
              {formData.contextos?.map(contexto => (
                <div
                  key={contexto.id}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    [{contexto.tipo}]
                  </span>
                  <span className="flex-1 text-sm">{contexto.descripcion}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveContexto(contexto.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <select
                value={newContexto.tipo}
                onChange={(e) => setNewContexto({ ...newContexto, tipo: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {contextoTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newContexto.descripcion}
                onChange={(e) => setNewContexto({ ...newContexto, descripcion: e.target.value })}
                placeholder="Descripcion del contexto"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddContexto}
                className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 
                           rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adjuntos
            </label>
            
            <div className="space-y-2 mb-3">
              {formData.adjuntos?.map(adjunto => (
                <div
                  key={adjunto.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">📄</span>
                    <span className="text-sm">{adjunto.nombre}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({adjunto.tipo})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdjunto(adjunto.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <select
                value={newAdjunto.tipo}
                onChange={(e) => setNewAdjunto({ ...newAdjunto, tipo: e.target.value as Adjunto['tipo'] })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {adjuntoTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newAdjunto.nombre}
                onChange={(e) => setNewAdjunto({ ...newAdjunto, nombre: e.target.value })}
                placeholder="Nombre"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={newAdjunto.url}
                onChange={(e) => setNewAdjunto({ ...newAdjunto, url: e.target.value })}
                placeholder="URL"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddAdjunto}
                className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 
                           rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                         rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {proyecto ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProyectoForm;