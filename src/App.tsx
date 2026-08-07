import React, { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Proyecto, Personaje, Narrativa, Trama, AgenteIA, EstadoUI, FiltroStoryElement } from './types';
import { fullCatalog } from './data/storyElements';
import { agentesIAIniciales } from './utils/ai';
import { useLocalStorage } from './hooks/useLocalStorage';
import ProyectoSection from './components/Proyecto/ProyectoSection';
import PersonajesSection from './components/Personajes/PersonajesSection';
import NarrativasSection from './components/Narrativas/NarrativasSection';
import TramasSection from './components/Tramas/TramasSection';
import EstructuraSection from './components/Estructura/EstructuraSection';
import AgentesSection from './components/Agentes/AgentesSection';
import Navbar from './components/Navbar/Navbar';

const App: React.FC = () => {
  // Load data from localStorage
  const [proyectos, setProyectos] = useLocalStorage<Proyecto[]>('guiones-proyectos', []);
  const [personajes, setPersonajes] = useLocalStorage<Personaje[]>('guiones-personajes', []);
  const [narrativas, setNarrativas] = useLocalStorage<Narrativa[]>('guiones-narrativas', []);
  const [tramas, setTramas] = useLocalStorage<Trama[]>('guiones-tramas', []);
  const [agentes, setAgentes] = useLocalStorage<AgenteIA[]>('guiones-agentes', agentesIAIniciales);
  
  // UI State
  const [uiState, setUiState] = useState<EstadoUI>({
    seccion_actual: 'proyecto',
    modo_edicion: false,
    filtros_activos: {},
    elementos_favoritos: [],
    elementos_recientes: [],
  });

  // Current project context
  const [proyectoActualId, setProyectoActualId] = useLocalStorage<string>('guiones-proyecto-actual', '');
  
  const proyectoActual = useMemo(() => {
    return proyectos.find(p => p.id === proyectoActualId) || null;
  }, [proyectos, proyectoActualId]);

  // Filter story elements by current project if available
  const storyElements = useMemo(() => {
    if (proyectoActual) {
      // Could filter by project genre in the future
      return fullCatalog;
    }
    return fullCatalog;
  }, [proyectoActual]);

  const handleChangeSection = (seccion: EstadoUI['seccion_actual']) => {
    setUiState(prev => ({ ...prev, seccion_actual: seccion }));
  };

  const handleSetFiltros = (filtros: FiltroStoryElement) => {
    setUiState(prev => ({ ...prev, filtros_activos: filtros }));
  };

  const handleAddFavorito = (elementId: string) => {
    setUiState(prev => ({
      ...prev,
      elementos_favoritos: [...new Set([...prev.elementos_favoritos, elementId])]
    }));
  };

  const handleRemoveFavorito = (elementId: string) => {
    setUiState(prev => ({
      ...prev,
      elementos_favoritos: prev.elementos_favoritos.filter(id => id !== elementId)
    }));
  };

  const handleAddReciente = (elementId: string) => {
    setUiState(prev => ({
      ...prev,
      elementos_recientes: [elementId, ...prev.elementos_recientes.filter(id => id !== elementId)].slice(0, 10)
    }));
  };

  // Render the current section
  const renderSection = () => {
    switch (uiState.seccion_actual) {
      case 'proyecto':
        return (
          <ProyectoSection
            proyectos={proyectos}
            setProyectos={setProyectos}
            proyectoActual={proyectoActual}
            setProyectoActualId={setProyectoActualId}
            agentes={agentes}
          />
        );
      case 'personajes':
        return (
          <PersonajesSection
            personajes={personajes}
            setPersonajes={setPersonajes}
            proyectoActual={proyectoActual}
            agentes={agentes}
          />
        );
      case 'narrativas':
        return (
          <NarrativasSection
            narrativas={narrativas}
            setNarrativas={setNarrativas}
            proyectoActual={proyectoActual}
            personajes={personajes}
            agentes={agentes}
          />
        );
      case 'tramas':
        return (
          <TramasSection
            tramas={tramas}
            setTramas={setTramas}
            proyectoActual={proyectoActual}
            storyElements={storyElements}
            personajes={personajes}
            narrativas={narrativas}
            filtros={uiState.filtros_activos}
            setFiltros={handleSetFiltros}
            favoritos={uiState.elementos_favoritos}
            recientes={uiState.elementos_recientes}
            onAddFavorito={handleAddFavorito}
            onRemoveFavorito={handleRemoveFavorito}
            onAddReciente={handleAddReciente}
            agentes={agentes}
          />
        );
      case 'estructura':
        return (
          <EstructuraSection
            tramas={tramas}
            storyElements={storyElements}
            personajes={personajes}
            agentes={agentes}
          />
        );
      case 'agentes':
        return (
          <AgentesSection
            agentes={agentes}
            setAgentes={setAgentes}
          />
        );
      default:
        return <ProyectoSection
          proyectos={proyectos}
          setProyectos={setProyectos}
          proyectoActual={proyectoActual}
          setProyectoActualId={setProyectoActualId}
          agentes={agentes}
        />;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar
          seccionActual={uiState.seccion_actual}
          onChangeSection={handleChangeSection}
          tieneProyecto={proyectos.length > 0}
        />
        
        <main className="guiones-container">
          {renderSection()}
        </main>
      </div>
    </DndProvider>
  );
};

export default App;