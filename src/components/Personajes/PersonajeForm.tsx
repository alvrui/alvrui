import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Personaje, AgenteIA } from '../../types';

interface PersonajeFormProps {
  personaje?: Personaje | null;
  onSave: (personaje: Partial<Personaje>) => void;
  onCancel: () => void;
  roles: string[];
  onGenerateDescription: (personaje: Partial<Personaje>) => void;
  loadingSuggestions: boolean;
  agente?: AgenteIA | null;
}

const PersonajeForm: React.FC<PersonajeFormProps> = ({
  personaje,
  onSave,
  onCancel,
  roles,
  onGenerateDescription,
  loadingSuggestions,
  agente
}) => {
  const [formData, setFormData] = useState<Partial<Personaje>>({
    nombre: '',
    descripcion: '',
    rol: 'protagonista',
    motivaciones: [],
    conflictos: [],
    rasgos: [],
    objetivos: [],
    antecedentes: '',
  });

  const [newItem, setNewItem] = useState('');
  const [currentField, setCurrentField] = useState<'motivaciones' | 'conflictos' | 'rasgos' | 'objetivos'>('motivaciones');

  useEffect(() => {
    if (personaje) {
      setFormData({ ...personaje });
    }
  }, [personaje]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const field = currentField;
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[] || []), newItem.trim()],
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (field: keyof Personaje, index: number) => {
    const items = (formData[field] as string[]) || [];
    setFormData(prev => ({
      ...prev,
      [field]: items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleGenerate = () => {
    onGenerateDescription(formData);
  };

  const fields = ['motivaciones', 'conflictos', 'rasgos', 'objetivos'] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {personaje ? 'Editar Personaje' : 'Nuevo Personaje'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              X
            </button>
          </div>
          {agente && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Asistido por: {agente.nombre}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Juan Perez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol
              </label>
              <select
                name="rol"
                value={formData.rol || 'protagonista'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {roles.map(rol => (
                  <option key={rol} value={rol}>
                    {rol.charAt(0).toUpperCase() + rol.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripcion
            </label>
            <div className="flex space-x-2">
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows={4}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descripcion detallada del personaje..."
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loadingSuggestions || !formData.nombre}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors whitespace-nowrap"
                title="Generar descripcion con IA"
              >
                {loadingSuggestions ? '...' : 'IA'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Antecedentes
            </label>
            <textarea
              name="antecedentes"
              value={formData.antecedentes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Historia y trasfondo del personaje..."
            />
          </div>

          <div className="space-y-4">
            {fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <div className="space-y-2 mb-2">
                  {(formData[field] as string[])?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(field, index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={field.slice(0, -1)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setCurrentField(field);
                        handleAddItem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentField(field);
                      handleAddItem();
                    }}
                    className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {personaje ? 'Guardar Cambios' : 'Crear Personaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonajeForm;