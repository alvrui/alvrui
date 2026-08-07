import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Personaje, Proyecto, AgenteIA } from '../../types';
import { generarDescripcionPersonaje } from '../../utils/ai';
import PersonajeCard from './PersonajeCard';
import PersonajeForm from './PersonajeForm';
import AISuggestionModal from '../Shared/AISuggestionModal';

interface PersonajesSectionProps {
  personajes: Personaje[];
  setPersonajes: (personajes: Personaje[]) => void;
  proyectoActual: Proyecto | null;
  agentes: AgenteIA[];
}

const PersonajesSection: React.FC<PersonajesSectionProps> = ({
  personajes,
  setPersonajes,
  proyectoActual,
  agentes
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPersonaje, setEditingPersonaje] = useState<Personaje | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<{
    descripcion: string;
    alternativas: string[];
  } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const agentePersonajes = agentes.find(a => a.seccion_servida === 'personajes');

  const handleCreate = () => {
    setShowNewForm(true);
    setShowEditForm(false);
    setEditingPersonaje(null);
  };

  const handleEdit = (personaje: Personaje) => {
    setEditingPersonaje(personaje);
    setShowEditForm(true);
    setShowNewForm(false);
  };

  const handleSave = (personaje: Partial<Personaje>) => {
    if (editingPersonaje) {
      setPersonajes(personajes.map(p => 
        p.id === editingPersonaje.id 
          ? { ...p, ...personaje, actualizado_en: new Date().toISOString() }
          : p
      ));
    } else {
      const nuevoPersonaje: Personaje = {
        id: uuidv4(),
        nombre: personaje.nombre || 'Nuevo Personaje',
        descripcion: personaje.descripcion || '',
        rol: personaje.rol || 'protagonista',
        motivaciones: personaje.motivaciones || [],
        conflictos: personaje.conflictos || [],
        rasgos: personaje.rasgos || [],
        objetivos: personaje.objetivos || [],
        antecedentes: personaje.antecedentes || '',
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      };
      setPersonajes([...personajes, nuevoPersonaje]);
    }
    setShowNewForm(false);
    setShowEditForm(false);
    setEditingPersonaje(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estas seguro de que quieres eliminar este personaje?')) {
      setPersonajes(personajes.filter(p => p.id !== id));
    }
  };

  const handleGenerateDescription = async (personajeData: Partial<Personaje>) => {
    setLoadingSuggestions(true);
    try {
      const response = await generarDescripcionPersonaje(personajeData);
      setAISuggestions({
        descripcion: response.content,
        alternativas: response.alternatives,
      });
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = (descripcion: string) => {
    if (editingPersonaje) {
      setEditingPersonaje({
        ...editingPersonaje,
        descripcion,
      });
    }
    setShowSuggestions(false);
    setAISuggestions(null);
  };

  const roles = ['protagonista', 'antagonista', 'aliado', 'mentor', 'antiheroe', 'compañero', 'oponente'];

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Personajes</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Crea y gestiona los personajes de tu narrativa
            </p>
          </div>
          
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors text-sm font-medium"
          >
            + Nuevo Personaje
          </button>
        </div>

        {personajes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay personajes creados
            </p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Crear Primer Personaje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {personajes.map(personaje => (
              <PersonajeCard
                key={personaje.id}
                personaje={personaje}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {(showNewForm || showEditForm) && (
          <PersonajeForm
            personaje={editingPersonaje}
            onSave={handleSave}
            onCancel={() => {
              setShowNewForm(false);
              setShowEditForm(false);
              setEditingPersonaje(null);
            }}
            roles={roles}
            onGenerateDescription={handleGenerateDescription}
            loadingSuggestions={loadingSuggestions}
            agente={agentePersonajes}
          />
        )}

        {showSuggestions && aiSuggestions && (
          <AISuggestionModal
            title="Sugerencias de Descripcion"
            onClose={() => setShowSuggestions(false)}
          >
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-gray-900 dark:text-white">{aiSuggestions.descripcion}</p>
              </div>
              
              <button
                onClick={() => handleAcceptSuggestion(aiSuggestions.descripcion)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Usar esta descripcion
              </button>

              {aiSuggestions.alternativas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alternativas:
                  </h4>
                  {aiSuggestions.alternativas.map((alt, index) => (
                    <button
                      key={index}
                      onClick={() => handleAcceptSuggestion(alt)}
                      className="block w-full text-left p-2 text-sm bg-gray-100 dark:bg-gray-700 
                                 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </AISuggestionModal>
        )}
      </div>
    </div>
  );
};

export default PersonajesSection;