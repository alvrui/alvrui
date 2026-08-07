import { Trama, StoryElement, Personaje, ProblemaValidacion } from '../types';

function getStoryElementName(id: string, storyElements: StoryElement[]): string {
  const element = storyElements.find(se => se.id === id);
  return element ? element.name : id;
}

export function validarTrama(
  trama: Trama,
  storyElements: StoryElement[],
  personajes: Personaje[]
): ProblemaValidacion[] {
  const problemas: ProblemaValidacion[] = [];

  trama.story_elements.forEach(element => {
    if (!element.role_in_story) {
      problemas.push({
        tipo: 'advertencia',
        mensaje: `Elemento "${getStoryElementName(element.story_element_id, storyElements)}" no tiene rol asignado`,
        severidad: 'media',
        elemento_id: element.id,
        campo: 'role_in_story',
      });
    }
  });

  trama.story_elements.forEach(element => {
    if (element.role_in_story && !element.personaje_asignado_id) {
      problemas.push({
        tipo: 'advertencia',
        mensaje: `Rol "${element.role_in_story}" en elemento "${getStoryElementName(element.story_element_id, storyElements)}" no tiene personaje asignado`,
        severidad: 'alta',
        elemento_id: element.id,
        campo: 'personaje_asignado_id',
      });
    }
  });

  const asignacionesPorPersonaje: Record<string, string[]> = {};
  trama.story_elements.forEach(element => {
    if (element.personaje_asignado_id) {
      if (!asignacionesPorPersonaje[element.personaje_asignado_id]) {
        asignacionesPorPersonaje[element.personaje_asignado_id] = [];
      }
      asignacionesPorPersonaje[element.personaje_asignado_id].push(element.role_in_story || '');
    }
  });

  Object.entries(asignacionesPorPersonaje).forEach(([personajeId, roles]) => {
    const personaje = personajes.find(p => p.id === personajeId);
    if (roles.includes('protagonist') && roles.includes('antagonist')) {
      problemas.push({
        tipo: 'error',
        mensaje: `Personaje "${personaje?.nombre || personajeId}" asignado como protagonista y antagonista`,
        severidad: 'alta',
        elemento_id: personajeId,
        campo: 'roles',
      });
    }
  });

  const generosEnTrama: Set<string> = new Set();
  trama.story_elements.forEach(element => {
    const storyElement = storyElements.find(se => se.id === element.story_element_id);
    if (storyElement) {
      storyElement.primary_genres.forEach(g => generosEnTrama.add(g));
      storyElement.secondary_genres.forEach(g => generosEnTrama.add(g));
    }
  });

  if (generosEnTrama.size > 3) {
    problemas.push({
      tipo: 'advertencia',
      mensaje: `La trama tiene muchos géneros diferentes (${generosEnTrama.size}), considerar enfocarse`,
      severidad: 'baja',
      elemento_id: trama.id,
      campo: 'generos',
    });
  }

  const tonalidades = trama.story_elements.map(element => {
    const storyElement = storyElements.find(se => se.id === element.story_element_id);
    return storyElement ? storyElement.tone_darkness : 0;
  });

  if (tonalidades.length > 0) {
    const avgTone = tonalidades.reduce((a, b) => a + b, 0) / tonalidades.length;
    const toneVariance = tonalidades.reduce((acc, val) => acc + Math.pow(val - avgTone, 2), 0) / tonalidades.length;
    if (toneVariance > 25) {
      problemas.push({
        tipo: 'advertencia',
        mensaje: 'Variación significativa en la tonalidad entre elementos',
        severidad: 'media',
        elemento_id: trama.id,
        campo: 'tonalidad',
      });
    }
  }

  const fasesOrdenadas = ['setup', 'inciting_incident', 'rising_action', 'midpoint', 'climax', 'resolution', 'denouement'];
  const elementosPorFase: Record<string, number[]> = {};
  trama.story_elements.forEach((element, index) => {
    const storyElement = storyElements.find(se => se.id === element.story_element_id);
    if (storyElement) {
      storyElement.arc_phase_affinity.forEach(fase => {
        if (!elementosPorFase[fase]) elementosPorFase[fase] = [];
        elementosPorFase[fase].push(index);
      });
    }
  });

  let lastFaseIndex = -1;
  fasesOrdenadas.forEach(fase => {
    if (elementosPorFase[fase] && elementosPorFase[fase].length > 0) {
      const minIndex = Math.min(...elementosPorFase[fase]);
      if (minIndex < lastFaseIndex) {
        problemas.push({
          tipo: 'advertencia',
          mensaje: `Elementos de fase "${fase}" aparecen antes que elementos de fases previas`,
          severidad: 'media',
          elemento_id: trama.id,
          campo: 'arco_narrativo',
        });
      }
      lastFaseIndex = Math.max(...elementosPorFase[fase]);
    }
  });

  return problemas;
}

export function validarAsignacionPersonaje(
  personajeId: string,
  role: string,
  trama: Trama,
  personajes: Personaje[]
): ProblemaValidacion[] {
  const problemas: ProblemaValidacion[] = [];
  const asignaciones = trama.story_elements.filter(element => element.personaje_asignado_id === personajeId);

  asignaciones.forEach(element => {
    if (element.role_in_story === 'protagonist' && role === 'antagonist') {
      problemas.push({
        tipo: 'error',
        mensaje: 'Personaje ya asignado como protagonista, no puede ser antagonista',
        severidad: 'alta',
        elemento_id: element.id,
        campo: 'personaje_asignado_id',
      });
    }
    if (element.role_in_story === 'antagonist' && role === 'protagonist') {
      problemas.push({
        tipo: 'error',
        mensaje: 'Personaje ya asignado como antagonista, no puede ser protagonista',
        severidad: 'alta',
        elemento_id: element.id,
        campo: 'personaje_asignado_id',
      });
    }
  });

  return problemas;
}

export function validarCompatibilidadGenero(
  storyElementId: string,
  proyectoGeneros: string[],
  storyElements: StoryElement[]
): ProblemaValidacion[] {
  const problemas: ProblemaValidacion[] = [];
  const storyElement = storyElements.find(se => se.id === storyElementId);
  if (!storyElement) return problemas;

  const generosComunes = storyElement.primary_genres.filter(g => proyectoGeneros.includes(g));
  if (generosComunes.length === 0) {
    problemas.push({
      tipo: 'advertencia',
      mensaje: `Elemento "${storyElement.name}" no coincide con los géneros del proyecto`,
      severidad: 'baja',
      elemento_id: storyElementId,
      campo: 'primary_genres',
    });
  }

  return problemas;
}