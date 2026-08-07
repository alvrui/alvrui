import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Narrativa, Proyecto, Personaje, AgenteIA } from '../../types';
import { generarDescripcionNarrativa } from '../../utils/ai';
import NarrativaCard from './NarrativaCard';
import NarrativaForm from './NarrativaForm';
import AISuggestionModal from '../Shared/AISuggestionModal';

interface NarrativasSectionProps {
  narrativas: Narrativa[];
  setNarrativas: (narrativas: Narrativa[]) => void;
  proyectoActual: Proyecto | null;
  personajes: Personaje[];
  agentes: AgenteIA[];
}

const NarrativasSection: React.FC<NarrativasSectionProps> = ({
  narrativas,
  setNarrativas,
  proyectoActual,
  personajes,
  agentes
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingNarrativa, setEditingNarrativa] = useState<Narrativa | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<{
    descripcion: string;
    alternativas: string[];
  } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const agenteNarrativas = agentes.find(a => a.seccion_servida === 'narrativas');

  const handleCreate = () => {
    if (!proyectoActual) {
      alert('Primero selecciona o crea un proyecto');
      return;
    }
    setShowNewForm(true);
    setShowEditForm(false);
    setEditingNarrativa(null);
  };

  const handleEdit = (narrativa: Narrativa) => {
    setEditingNarrativa(narrativa);
    setShowEditForm(true);
    setShowNewForm(false);
  };

  const handleSave = (narrativa: Partial<Narrativa>) => {
    if (!proyectoActual) return;
    
    if (editingNarrativa) {
      setNarrativas(narrativas.map(n => 
        n.id === editingNarrativa.id 
          ? { ...n, ...narrativa, actualizado_en: new Date().toISOString() }
          : n
      ));
    } else {
      const nuevaNarrativa: Narrativa = {
        id: uuidv4(),
        titulo: narrativa.titulo || 'Nueva Narrativa',
        descripcion: narrativa.descripcion || '',
        proyecto_id: proyectoActual.id,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      };
      setNarrativas([...narrativas, nuevaNarrativa]);
    }
    setShowNewForm(false);
    setShowEditForm(false);
    setEditingNarrativa(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estas seguro de que quieres eliminar esta narrativa?')) {
      setNarrativas(narrativas.filter(n => n.id !== id));
    }
  };

  const handleGenerateDescription = async (narrativaData: Partial<Narrativa>) => {
    setLoadingSuggestions(true);
    try {
      const response = await generarDescripcionNarrativa(narrativaData);
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
    if (editingNarrativa) {
      setEditingNarrativa({
        ...editingNarrativa,
        descripcion,
      });
    }
    setShowSuggestions(false);
    setAISuggestions(null);
  };

  // Filter narrativas by current project
  const narrativasFiltradas = proyectoActual 
    ? narrativas.filter(n => n.proyecto_id === proyectoActual.id)
    : narrativas;

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Narrativas</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Define las lineas generales de tu historia
            </p>
          </div>
          
          <button
            onClick={handleCreate}
            disabled={!proyectoActual}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            + Nueva Narrativa
          </button>
        </div>

        {!proyectoActual ? (
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700 p-4 mb-8">
            <p className="text-yellow-800 dark:text-yellow-200">
              Selecciona o crea un proyecto para crear narrativas
            </p>
          </div>
        ) : null}

        {narrativasFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay narrativas creadas para este proyecto
            </p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Crear Primera Narrativa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {narrativasFiltradas.map(narrativa => (
              <NarrativaCard
                key={narrativa.id}
                narrativa={narrativa}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {(showNewForm || showEditForm) && (
          <NarrativaForm
            narrativa={editingNarrativa}
            onSave={handleSave}
            onCancel={() => {
              setShowNewForm(false);
              setShowEditForm(false);
              setEditingNarrativa(null);
            }}
            onGenerateDescription={handleGenerateDescription}
            loadingSuggestions={loadingSuggestions}
            agente={agenteNarrativas}
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
                      className="block w-full text-left p-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
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

export default NarrativasSection;