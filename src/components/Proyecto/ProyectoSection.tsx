import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Proyecto, AgenteIA } from '../../types';
import { generarTipoNarrativaSugerencias, generarEstiloSugerencias } from '../../utils/ai';
import ProyectoForm from './ProyectoForm';
import ProyectoCard from './ProyectoCard';
import AISuggestionModal from '../Shared/AISuggestionModal';

interface ProyectoSectionProps {
  proyectos: Proyecto[];
  setProyectos: (proyectos: Proyecto[]) => void;
  proyectoActual: Proyecto | null;
  setProyectoActualId: (id: string) => void;
  agentes: AgenteIA[];
}

const ProyectoSection: React.FC<ProyectoSectionProps> = ({
  proyectos,
  setProyectos,
  proyectoActual,
  setProyectoActualId,
  agentes
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<{
    tipoNarrativa: string[];
    estilo: string[];
  } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const agenteProyecto = agentes.find(a => a.seccion_servida === 'proyecto');

  const handleCreate = () => {
    setShowNewForm(true);
    setShowEditForm(false);
    setEditingProyecto(null);
  };

  const handleEdit = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setShowEditForm(true);
    setShowNewForm(false);
  };

  const handleSave = (proyecto: Partial<Proyecto>) => {
    if (editingProyecto) {
      // Update existing
      setProyectos(proyectos.map(p => 
        p.id === editingProyecto.id 
          ? { ...p, ...proyecto, actualizado_en: new Date().toISOString() }
          : p
      ));
    } else {
      // Create new
      const nuevoProyecto: Proyecto = {
        id: uuidv4(),
        nombre: proyecto.nombre || 'Nuevo Proyecto',
        tipo_narrativa: proyecto.tipo_narrativa || '',
        estilo: proyecto.estilo || '',
        contextos: proyecto.contextos || [],
        adjuntos: proyecto.adjuntos || [],
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      };
      setProyectos([...proyectos, nuevoProyecto]);
      setProyectoActualId(nuevoProyecto.id);
    }
    setShowNewForm(false);
    setShowEditForm(false);
    setEditingProyecto(null);
  };

  const handleDelete = (id: string) => {
    if (proyectos.length === 1) {
      alert('No puedes eliminar el unico proyecto. Crea otro primero.');
      return;
    }
    if (window.confirm('¿Estas seguro de que quieres eliminar este proyecto?')) {
      setProyectos(proyectos.filter(p => p.id !== id));
      if (proyectoActual?.id === id) {
        setProyectoActualId(proyectos[0]?.id || '');
      }
    }
  };

  const handleSetActual = (id: string) => {
    setProyectoActualId(id);
  };

  const handleGenerateSuggestions = async (proyectoData: Partial<Proyecto>) => {
    setLoadingSuggestions(true);
    try {
      const [tipoSugerencias, estiloSugerencias] = await Promise.all([
        generarTipoNarrativaSugerencias(proyectoData),
        generarEstiloSugerencias(proyectoData),
      ]);
      setAISuggestions({ tipoNarrativa: tipoSugerencias, estilo: estiloSugerencias });
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = (type: 'tipo_narrativa' | 'estilo', value: string) => {
    if (!editingProyecto) {
      const newProyecto: Partial<Proyecto> = { ...editingProyecto };
      if (type === 'tipo_narrativa') {
        newProyecto.tipo_narrativa = value;
      } else {
        newProyecto.estilo = value;
      }
      setEditingProyecto(newProyecto as Proyecto);
    }
    setShowSuggestions(false);
    setAISuggestions(null);
  };

  useEffect(() => {
    if (!showNewForm && !showEditForm) {
      setAISuggestions(null);
    }
  }, [showNewForm, showEditForm]);

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Proyecto</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Define el contexto general de tu obra narrativa
            </p>
          </div>
          
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors text-sm font-medium"
          >
            + Nuevo Proyecto
          </button>
        </div>

        {/* Project Cards */}
        <div className="space-y-4 mb-8">
          {proyectos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No hay proyectos creados
              </p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Crear Primer Proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proyectos.map(proyecto => (
                <ProyectoCard
                  key={proyecto.id}
                  proyecto={proyecto}
                  isActual={proyectoActual?.id === proyecto.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetActual={handleSetActual}
                />
              ))}
            </div>
          )}
        </div>

        {/* Current Project Details */}
        {proyectoActual && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Proyecto Actual: {proyectoActual.nombre}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo de Narrativa</p>
                <p className="text-gray-900 dark:text-white">
                  {proyectoActual.tipo_narrativa || 'No definido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estilo</p>
                <p className="text-gray-900 dark:text-white">
                  {proyectoActual.estilo || 'No definido'}
                </p>
              </div>
            </div>
            
            {proyectoActual.contextos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contextos</p>
                <div className="flex flex-wrap gap-2">
                  {proyectoActual.contextos.map(contexto => (
                    <span
                      key={contexto.id}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {contexto.tipo}: {contexto.descripcion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {proyectoActual.adjuntos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Adjuntos</p>
                <div className="space-y-2">
                  {proyectoActual.adjuntos.map(adjunto => (
                    <div
                      key={adjunto.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">📄</span>
                        <span className="text-sm">{adjunto.nombre}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {adjunto.tipo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forms */}
        {(showNewForm || showEditForm) && (
          <ProyectoForm
            proyecto={editingProyecto}
            onSave={handleSave}
            onCancel={() => {
              setShowNewForm(false);
              setShowEditForm(false);
              setEditingProyecto(null);
            }}
            onGenerateSuggestions={handleGenerateSuggestions}
            loadingSuggestions={loadingSuggestions}
            agente={agenteProyecto}
          />
        )}

        {/* AI Suggestions Modal */}
        {showSuggestions && aiSuggestions && (
          <AISuggestionModal
            title="Sugerencias de IA"
            onClose={() => setShowSuggestions(false)}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Tipo de Narrativa</h4>
                <div className="space-y-2">
                  {aiSuggestions.tipoNarrativa.map(sugerencia => (
                    <button
                      key={sugerencia}
                      onClick={() => handleAcceptSuggestion('tipo_narrativa', sugerencia)}
                      className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3">Estilo</h4>
                <div className="space-y-2">
                  {aiSuggestions.estilo.map(sugerencia => (
                    <button
                      key={sugerencia}
                      onClick={() => handleAcceptSuggestion('estilo', sugerencia)}
                      className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AISuggestionModal>
        )}
      </div>
    </div>
  );
};

export default ProyectoSection;