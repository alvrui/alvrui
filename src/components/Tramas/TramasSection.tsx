import React, { useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trama, TramaStoryElement, StoryElement, Personaje, Narrativa, Proyecto, AgenteIA, FiltroStoryElement } from '../../types';
import { filtrarStoryElements, obtenerOpcionesFiltro } from '../../utils/filtering';
import { validarTrama } from '../../utils/validation';
import { recomendarStoryElements, generarTituloTrama, analizarCoherenciaTrama } from '../../utils/ai';
import TramaCard from './TramaCard';
import TramaBuilder from './TramaBuilder';
import AISuggestionModal from '../Shared/AISuggestionModal';

interface TramasSectionProps {
  tramas: Trama[];
  setTramas: (tramas: Trama[]) => void;
  proyectoActual: Proyecto | null;
  storyElements: StoryElement[];
  personajes: Personaje[];
  narrativas: Narrativa[];
  filtros: FiltroStoryElement;
  setFiltros: (filtros: FiltroStoryElement) => void;
  favoritos: string[];
  recientes: string[];
  onAddFavorito: (id: string) => void;
  onRemoveFavorito: (id: string) => void;
  onAddReciente: (id: string) => void;
  agentes: AgenteIA[];
}

const TramasSection: React.FC<TramasSectionProps> = ({
  tramas,
  setTramas,
  proyectoActual,
  storyElements,
  personajes,
  narrativas,
  filtros,
  setFiltros,
  favoritos,
  recientes,
  onAddFavorito,
  onRemoveFavorito,
  onAddReciente,
  agentes
}) => {
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedTramaId, setSelectedTramaId] = useState<string | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [aiTituloSuggestions, setAITituloSuggestions] = useState<string[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const agenteTramas = agentes.find(a => a.seccion_servida === 'tramas');
  const filteredStoryElements = useMemo(() => filtrarStoryElements(storyElements, filtros), [storyElements, filtros]);
  const filterOptions = useMemo(() => obtenerOpcionesFiltro(storyElements), [storyElements]);
  const currentTrama = useMemo(() => tramas.find(t => t.id === selectedTramaId) || null, [tramas, selectedTramaId]);
  const tramasFiltradas = useMemo(() => proyectoActual ? tramas.filter(t => t.proyecto_id === proyectoActual.id) : tramas, [tramas, proyectoActual]);

  const handleCreateTrama = useCallback(() => {
    if (!proyectoActual) {
      alert('Primero selecciona o crea un proyecto');
      return;
    }
    const nuevaTrama: Trama = {
      id: uuidv4(),
      titulo: 'Nueva Trama',
      proyecto_id: proyectoActual.id,
      story_elements: [],
      personajes_asignados: [],
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };
    setTramas([...tramas, nuevaTrama]);
    setSelectedTramaId(nuevaTrama.id);
    setShowCatalog(true);
  }, [proyectoActual, tramas, setTramas]);

  const handleDeleteTrama = useCallback((id: string) => {
    if (window.confirm('Estas seguro de que quieres eliminar esta trama?')) {
      setTramas(tramas.filter(t => t.id !== id));
      if (selectedTramaId === id) {
        setSelectedTramaId(null);
        setShowCatalog(false);
      }
    }
  }, [tramas, setTramas, selectedTramaId]);

  const handleSelectTrama = useCallback((id: string) => {
    setSelectedTramaId(id);
    setShowCatalog(true);
  }, []);

  const handleUpdateTrama = useCallback((trama: Trama) => {
    setTramas(tramas.map(t => t.id === trama.id ? trama : t));
  }, [tramas, setTramas]);

  const handleGenerateRecommendations = useCallback(async (trama: Trama) => {
    setLoadingAI(true);
    try {
      const recommendations = await recomendarStoryElements(trama, storyElements, proyectoActual, personajes);
      setAIRecommendations(recommendations);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAI(false);
    }
  }, [storyElements, proyectoActual, personajes]);

  const handleGenerateTitulo = useCallback(async (trama: Trama) => {
    setLoadingAI(true);
    try {
      const titles = await generarTituloTrama(trama, storyElements);
      setAITituloSuggestions(titles);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAI(false);
    }
  }, [storyElements]);

  const handleAnalyzeTrama = useCallback(async (trama: Trama) => {
    setLoadingAI(true);
    try {
      const analysis = await analizarCoherenciaTrama(trama, storyElements, proyectoActual);
      setAIAnalysis(analysis);
      setShowAIAnalysis(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAI(false);
    }
  }, [storyElements, proyectoActual]);

  const handleAcceptRecommendation = useCallback((storyElement: StoryElement) => {
    if (!currentTrama) return;
    const newStoryElement: TramaStoryElement = {
      id: uuidv4(),
      story_element_id: storyElement.id,
      orden: currentTrama.story_elements.length,
      role_in_story: storyElement.role_in_story[0] || '',
      descripcion_personalizada: '',
      atributos_personalizados: {},
    };
    const updatedTrama: Trama = {
      ...currentTrama,
      story_elements: [...currentTrama.story_elements, newStoryElement],
      actualizado_en: new Date().toISOString(),
    };
    handleUpdateTrama(updatedTrama);
    onAddReciente(storyElement.id);
    setShowAISuggestions(false);
  }, [currentTrama, handleUpdateTrama, onAddReciente]);

  const handleAcceptTitulo = useCallback((titulo: string) => {
    if (!currentTrama) return;
    const updatedTrama: Trama = {
      ...currentTrama,
      titulo,
      actualizado_en: new Date().toISOString(),
    };
    handleUpdateTrama(updatedTrama);
    setShowAISuggestions(false);
  }, [currentTrama, handleUpdateTrama]);

  const problemasValidacion = useMemo(() => currentTrama ? validarTrama(currentTrama, storyElements, personajes) : [], [currentTrama, storyElements, personajes]);

  const getCoherenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tramas</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Construye composiciones narrativas con Story Elements</p>
          </div>
          <button onClick={handleCreateTrama} disabled={!proyectoActual} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">+ Nueva Trama</button>
        </div>

        {!proyectoActual && (
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700 p-4 mb-8">
            <p className="text-yellow-800 dark:text-yellow-200">Selecciona o crea un proyecto para crear tramas</p>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tus Tramas</h3>
          {tramasFiltradas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No hay tramas creadas para este proyecto</p>
              <button onClick={handleCreateTrama} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Crear Primera Trama</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tramasFiltradas.map(trama => (
                <TramaCard key={trama.id} trama={trama} storyElements={storyElements} isSelected={selectedTramaId === trama.id} onSelect={handleSelectTrama} onDelete={handleDeleteTrama} onAnalyze={() => handleAnalyzeTrama(trama)} />
              ))}
            </div>
          )}
        </div>

        {selectedTramaId && currentTrama && showCatalog && (
          <TramaBuilder
            trama={currentTrama}
            storyElements={storyElements}
            filteredStoryElements={filteredStoryElements}
            personajes={personajes}
            filterOptions={filterOptions}
            filtros={filtros}
            setFiltros={setFiltros}
            favoritos={favoritos}
            recientes={recientes}
            onAddFavorito={onAddFavorito}
            onRemoveFavorito={onRemoveFavorito}
            onAddReciente={onAddReciente}
            onUpdateTrama={handleUpdateTrama}
            onClose={() => { setShowCatalog(false); setSelectedTramaId(null); }}
            problemasValidacion={problemasValidacion}
            onGenerateRecommendations={() => handleGenerateRecommendations(currentTrama)}
            onGenerateTitulo={() => handleGenerateTitulo(currentTrama)}
            loadingAI={loadingAI}
            agente={agenteTramas}
          />
        )}

        {showAISuggestions && (
          <AISuggestionModal title={aiRecommendations.length > 0 ? 'Recomendaciones de Story Elements' : 'Sugerencias de Titulo'} onClose={() => { setShowAISuggestions(false); setAIRecommendations([]); setAITituloSuggestions([]); }}>
            {aiRecommendations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Basado en tu trama actual, te recomendamos estos Story Elements:</p>
                <div className="space-y-3">
                  {aiRecommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{rec.storyElement.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rec.storyElement.logline_usage}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Razon: {rec.reason}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rec.storyElement.role_in_story.map((rol: string) => (
                              <span key={rol} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">{rol}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleAcceptRecommendation(rec.storyElement)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors ml-2">+ Agregar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sugerencias de titulo para tu trama:</p>
                <div className="space-y-2">
                  {aiTituloSuggestions.map((titulo, index) => (
                    <button key={index} onClick={() => handleAcceptTitulo(titulo)} className="block w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">{titulo}</button>
                  ))}
                </div>
              </div>
            )}
          </AISuggestionModal>
        )}

        {showAIAnalysis && aiAnalysis && (
          <AISuggestionModal title="Analisis de Coherencia" onClose={() => { setShowAIAnalysis(false); setAIAnalysis(null); }}>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coherencia General</span>
                  <span className={"px-2 py-1 rounded text-xs font-medium " + getCoherenceColor(aiAnalysis.coherence)}>{Math.round(aiAnalysis.coherence)}%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {aiAnalysis.coherence >= 80 ? 'La trama tiene una buena coherencia narrativa.' : aiAnalysis.coherence >= 50 ? 'La trama tiene algunos aspectos que mejorar.' : 'La trama necesita revision significativa.'}
                </p>
              </div>
              {aiAnalysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sugerencias:</h4>
                  {aiAnalysis.suggestions.map((sug: string, index: number) => (
                    <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm text-blue-700 dark:text-blue-200">{sug}</div>
                  ))}
                </div>
              )}
              {aiAnalysis.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Problemas detectados:</h4>
                  {aiAnalysis.issues.map((issue: string, index: number) => (
                    <div key={index} className="p-2 bg-red-50 dark:bg-red-900 rounded text-sm text-red-700 dark:text-red-200">{issue}</div>
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

export default TramasSection;