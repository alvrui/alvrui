import { StoryElement, Proyecto, Personaje, Narrativa, Trama, AgenteIA } from '../types';
import { fullCatalog } from '../data/storyElements';

// Simulated AI functions - these would be connected to real AI APIs in production
export interface AIResponse {
  content: string;
  alternatives: string[];
  reasoning: string;
}

export interface AIRecommendation {
  storyElement: StoryElement;
  score: number;
  reason: string;
}

export interface AIAnalysis {
  coherence: number;
  suggestions: string[];
  issues: string[];
}

// Generate project suggestions
const tipoNarrativaOptions = [
  'drama', 'comedia', 'thriller', 'aventura', 'misterio', 'romance',
  'accion', 'ciencia_ficcion', 'fantasia', 'terror', 'suspense',
  'historico', 'documental', 'animacion'
];

const estiloOptions = [
  'realista', 'estilizado', 'poetico', 'minimalista', 'experimental',
  'clasico', 'moderno', 'vanguardista', 'narrativo', 'visual'
];

export async function generarTipoNarrativaSugerencias(proyecto: Partial<Proyecto>): Promise<string[]> {
  // Simulate AI thinking
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const sugerencias = [];
  
  if (proyecto.descripcion) {
    const descLower = proyecto.descripcion.toLowerCase();
    if (descLower.includes('amor') || descLower.includes('relacion')) {
      sugerencias.push('romance');
    }
    if (descLower.includes('misterio') || descLower.includes('intriga')) {
      sugerencias.push('misterio');
    }
    if (descLower.includes('accion') || descLower.includes('emocion')) {
      sugerencias.push('drama');
    }
    if (descLower.includes('risas') || descLower.includes('comico')) {
      sugerencias.push('comedia');
    }
  }
  
  // Add some random suggestions
  const randomOptions = tipoNarrativaOptions
    .filter(opt => !sugerencias.includes(opt))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  return [...sugerencias, ...randomOptions];
}

export async function generarEstiloSugerencias(proyecto: Partial<Proyecto>): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const sugerencias = [];
  
  if (proyecto.tipo_narrativa) {
    if (['drama', 'romance'].includes(proyecto.tipo_narrativa)) {
      sugerencias.push('realista', 'poetico');
    }
    if (['ciencia_ficcion', 'fantasia'].includes(proyecto.tipo_narrativa)) {
      sugerencias.push('estilizado', 'visual');
    }
    if (['accion', 'thriller'].includes(proyecto.tipo_narrativa)) {
      sugerencias.push('moderno', 'experimental');
    }
  }
  
  const randomOptions = estiloOptions
    .filter(opt => !sugerencias.includes(opt))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  
  return [...sugerencias, ...randomOptions];
}

// Generate character descriptions
export async function generarDescripcionPersonaje(personaje: Partial<Personaje>): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const nombre = personaje.nombre || 'Personaje';
  const rol = personaje.rol || 'protagonista';
  
  const descripciones = {
    protagonista: `${nombre} es un personaje complejo con profundas motivaciones. Su viaje 
      esta marcado por el crecimiento personal y la superacion de obstaculos. 
      Tiene un pasado que lo define pero no lo limita.`,
    antagonista: `${nombre} representa la oposicion al protagonista, con motivaciones claras 
      y una presencia imponente. Su complejidad lo hace mas que un simple villano.`,
    aliado: `${nombre} es un apoyo fundamental para el protagonista, con habilidades complementarias 
      y una lealtad inquebrantable. Su presencia aporta equilibrio a la historia.`,
    mentor: `${nombre} es una figura sabia y experimentada que guia al protagonista en su viaje. 
      Su conocimiento y paciencia son clave para el desarrollo de la trama.`,
  };
  
  const baseDescription = descripciones[rol as keyof typeof descripciones] || descripciones.protagonista;
  
  return {
    content: baseDescription,
    alternatives: [
      `${nombre} tiene una personalidad ${['carismatica', 'misteriosa', 'determinada', 'sabia'][Math.floor(Math.random() * 4)]} 
      y una historia ${['fascinante', 'conmovedora', 'intrigante', 'inspiradora'][Math.floor(Math.random() * 4)]} que lo define.`,
      `Con ${['fuerza', 'inteligencia', 'coraje', 'sabiduria'][Math.floor(Math.random() * 4)]} y 
      ${['determinacion', 'pasion', 'lealtad', 'ambicion'][Math.floor(Math.random() * 4)]} como sus principales rasgos, 
      ${nombre} se enfrenta a los desafios con ${['valentia', 'astucia', 'resiliencia', 'creatividad'][Math.floor(Math.random() * 4)]}.`,
    ],
    reasoning: `Generando descripcion para personaje "${nombre}" con rol "${rol}"`
  };
}

// Generate narrative descriptions
export async function generarDescripcionNarrativa(narrativa: Partial<Narrativa>): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const titulo = narrativa.titulo || 'Historia sin titulo';
  
  return {
    content: `"${titulo}" es una historia ${['captivadora', 'emocionante', 'intrigante', 'conmovedora'][Math.floor(Math.random() * 4)]} 
      que explora temas de ${['amor', 'traicion', 'superacion', 'descubrimiento', 'redencion'][Math.floor(Math.random() * 5)]} 
      a traves de un viaje ${['personal', 'colectivo', 'epico', 'intimo'][Math.floor(Math.random() * 4)]}. 
      Los personajes se enfrentan a ${['desafios', 'dilemas', 'secretos', 'peligros'][Math.floor(Math.random() * 4)]} 
      que ponen a prueba sus ${['valores', 'limites', 'sueños', 'miedos'][Math.floor(Math.random() * 4)]}.`,
    alternatives: [
      `Una narrativa que combina ${['accion', 'drama', 'misterio', 'aventura'][Math.floor(Math.random() * 4)]} 
      con momentos de ${['reflexion', 'emocion', 'suspense', 'humor'][Math.floor(Math.random() * 4)]}, 
      "${titulo}" promete mantener al espectador enganchado desde el principio.`,
      `Con un ritmo ${['rapido', 'pausado', 'variable', 'constante'][Math.floor(Math.random() * 4)]} 
      y una estructura ${['lineal', 'no lineal', 'fragmentada', 'circular'][Math.floor(Math.random() * 4)]}, 
      esta historia ofrece una experiencia narrativa unica.`,
    ],
    reasoning: `Generando descripcion para narrativa "${titulo}"`
  };
}

// Recommend Story Elements based on context
export async function recomendarStoryElements(
  trama: Trama,
  storyElements: StoryElement[],
  proyecto?: Proyecto,
  personajes?: Personaje[]
): Promise<AIRecommendation[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const usedIds = new Set(trama.story_elements.map(e => e.story_element_id));
  const availableElements = storyElements.filter(se => !usedIds.has(se.id));
  
  // Score elements based on various factors
  const recommendations: AIRecommendation[] = availableElements.map(se => {
    let score = 0;
    const reasons: string[] = [];
    
    // Check genre compatibility
    if (proyecto) {
      const genreMatch = se.primary_genres.some(g => proyecto.tipo_narrativa === g) ||
                         se.secondary_genres.some(g => proyecto.tipo_narrativa === g);
      if (genreMatch) {
        score += 30;
        reasons.push('Coincide con el genero del proyecto');
      }
    }
    
    // Check if element has roles that are not yet filled
    const missingRoles = se.role_in_story.filter(rol => 
      !trama.story_elements.some(e => e.role_in_story === rol)
    );
    if (missingRoles.length > 0) {
      score += 20 * missingRoles.length;
      reasons.push('Tiene roles no asignados en la trama');
    }
    
    // Check arc phase affinity - prefer elements that fit in the current structure
    const currentPhases = trama.story_elements.flatMap(e => {
      const element = storyElements.find(se => se.id === e.story_element_id);
      return element ? element.arc_phase_affinity : [];
    });
    
    const phaseMatch = se.arc_phase_affinity.some(p => currentPhases.includes(p));
    if (phaseMatch) {
      score += 15;
      reasons.push('Fase del arco compatible');
    }
    
    // Check tone compatibility
    if (trama.story_elements.length > 0) {
      const avgTone = trama.story_elements.reduce((sum, e) => {
        const element = storyElements.find(se => se.id === e.story_element_id);
        return sum + (element ? element.tone_seriousness : 5);
      }, 0) / trama.story_elements.length;
      
      const toneDiff = Math.abs(se.tone_seriousness - avgTone);
      if (toneDiff < 2) {
        score += 10;
        reasons.push('Tono compatible');
      }
    }
    
    // Add some randomness
    score += Math.random() * 10;
    
    return {
      storyElement: se,
      score,
      reason: reasons.join(', ') || 'Recomendacion general'
    };
  });
  
  // Sort by score and return top 5
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// Analyze plot coherence
export async function analizarCoherenciaTrama(
  trama: Trama,
  storyElements: StoryElement[],
  proyecto?: Proyecto
): Promise<AIAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const problemas = [];
  const sugerencias = [];
  
  // Check genre coherence
  if (proyecto) {
    const proyectoGenero = proyecto.tipo_narrativa;
    const elementosConGenero = trama.story_elements.filter(e => {
      const se = storyElements.find(s => s.id === e.story_element_id);
      return se && (se.primary_genres.includes(proyectoGenero) || se.secondary_genres.includes(proyectoGenero));
    });
    
    const porcentajeCompatibilidad = (elementosConGenero.length / trama.story_elements.length) * 100;
    if (porcentajeCompatibilidad < 50) {
      problemas.push('Baja compatibilidad de generos con el proyecto');
      sugerencias.push('Considerar elementos con generos mas compatibles');
    }
  }
  
  // Check role coverage
  const rolesCubiertos = new Set(trama.story_elements.map(e => e.role_in_story));
  if (!rolesCubiertos.has('protagonist')) {
    problemas.push('Falta un elemento con rol de protagonista');
    sugerencias.push('Agregar un Story Element con rol de protagonista');
  }
  
  // Check arc phase coverage
  const fasesCubiertas = new Set(
    trama.story_elements.flatMap(e => {
      const se = storyElements.find(s => s.id === e.story_element_id);
      return se ? se.arc_phase_affinity : [];
    })
  );
  
  const fasesDeseadas = ['setup', 'inciting_incident', 'rising_action', 'climax'];
  const fasesFaltantes = fasesDeseadas.filter(f => !fasesCubiertas.has(f));
  
  if (fasesFaltantes.length > 0) {
    problemas.push('Faltan fases del arco narrativo');
    sugerencias.push('Agregar elementos para cubrir: ' + fasesFaltantes.join(', '));
  }
  
  // Calculate coherence score (0-100)
  let coherence = 100;
  coherence -= problemas.length * 15;
  coherence += sugerencias.length * 5;
  coherence = Math.max(0, Math.min(100, coherence));
  
  return {
    coherence,
    suggestions: sugerencias.length > 0 ? sugerencias : ['La trama parece bien estructurada'],
    issues: problemas.length > 0 ? problemas : ['Ningun problema detectado']
  };
}

// Generate plot title
export async function generarTituloTrama(trama: Partial<Trama>, storyElements: StoryElement[]): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const elementNames = trama.story_elements?.map(e => {
    const se = storyElements.find(s => s.id === e.story_element_id);
    return se ? se.name : '';
  }).filter(Boolean) || [];
  
  if (elementNames.length === 0) {
    return [
      'El Viaje Comienza',
      'La Gran Aventura',
      'Conflicto y Resolucion',
      'Historia Sin Nombre',
      'La Narrativa'
    ];
  }
  
  const baseTitle = elementNames.length <= 3 
    ? elementNames.join(' y ')
    : `${elementNames.slice(0, 2).join(', ')} y mas`;
  
  return [
    `${baseTitle}`,
    `El ${elementNames[0]} y su Viaje`,
    `La Historia de ${elementNames[0]}`,
    `${elementNames[0]}: ${['El Desafio', 'La Transformacion', 'El Conflicto', 'La Busqueda'][Math.floor(Math.random() * 4)]}`,
    `Trama de ${elementNames.slice(0, 2).join(' y ')}`
  ];
}

// Generate scene from story elements
export async function generarEscena(
  storyElementId: string,
  personajeId: string,
  storyElements: StoryElement[],
  personajes: Personaje[]
): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const storyElement = storyElements.find(se => se.id === storyElementId);
  const personaje = personajes.find(p => p.id === personajeId);
  
  if (!storyElement || !personaje) {
    return {
      content: 'No se pudo generar la escena debido a datos faltantes.',
      alternatives: [],
      reasoning: 'Faltan datos del Story Element o personaje'
    };
  }
  
  const sceneTypes = storyElement.scene_type_affinity.length > 0 
    ? storyElement.scene_type_affinity
    : ['confrontacion', 'dialogo', 'accion'];
  
  const sceneType = sceneTypes[Math.floor(Math.random() * sceneTypes.length)];
  
  return {
    content: `[${sceneType.toUpperCase()}] ${personaje.nombre} se enfrenta a ${storyElement.name}. 
    ${['La tension es palpable.', 'El dialogo revela motivaciones ocultas.', 
        'La accion es intensa.', 'El momento es emotivo.'][Math.floor(Math.random() * 4)]}
    ${personaje.nombre} debe ${['superar', 'comprender', 'enfrentar', 'aceptar'][Math.floor(Math.random() * 4)]} 
    ${['su destino', 'el desafio', 'la verdad', 'su miedo'][Math.floor(Math.random() * 4)]}.`,
    alternatives: [
      `[${sceneType.toUpperCase()}] En un ${['lugar oscuro', 'espacio abierto', 'interior acogedor', 'entorno misterioso'][Math.floor(Math.random() * 4)]}, 
      ${personaje.nombre} interactua con ${storyElement.name} mientras ${['descubre', 'resuelve', 'enfrenta', 'explora'][Math.floor(Math.random() * 4)]} 
      ${['un secreto', 'un problema', 'una verdad', 'un desafio'][Math.floor(Math.random() * 4)]}.`,
      `[${sceneType.toUpperCase()}] La escena comienza con ${personaje.nombre} 
      ${['observando', 'hablando con', 'persiguiendo a', 'escapando de'][Math.floor(Math.random() * 4)]} 
      ${storyElement.name}. El ${['conflicto', 'dialogo', 'misterio', 'drama'][Math.floor(Math.random() * 4)]} 
      se desarrolla ${['lentamente', 'rapidamente', 'intensamente', 'sutilmente'][Math.floor(Math.random() * 4)]}.`
    ],
    reasoning: `Generando escena para ${storyElement.name} con ${personaje.nombre} (tipo: ${sceneType})`
  };
}

// AI Agent functions
export async function ejecutarAgenteIA(
  agente: AgenteIA,
  contexto: Record<string, unknown>,
  prompt: string
): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate different agent behaviors based on their section
  const sectionResponses: Record<string, () => AIResponse> = {
    proyecto: () => ({
      content: `Basado en el contexto del proyecto, sugiero: ${['Enfocarse en el desarrollo de personajes', 
        'Explorar el conflicto central', 'Definir mejor el tono', 'Agregar mas contexto historico'][Math.floor(Math.random() * 4)]}`,
      alternatives: [
        'Considerar una estructura narrativa no lineal',
        'Agregar elementos de misterio',
        'Desarrollar mas el trasfondo de los personajes'
      ],
      reasoning: 'Analizando contexto del proyecto'
    }),
    personajes: () => ({
      content: `Para el personaje: ${['Desarrollar su motivacion', 'Explorar su pasado', 
        'Definir sus relaciones', 'Establecer sus conflictos'][Math.floor(Math.random() * 4)]}`,
      alternatives: [
        'Agregar rasgos de personalidad contrastantes',
        'Crear un arco de transformacion',
        'Desarrollar su relacion con el protagonista'
      ],
      reasoning: 'Analizando desarrollo de personajes'
    }),
    narrativas: () => ({
      content: `Para la narrativa: ${['Reforzar el tema central', 'Desarrollar subtramas', 
        'Mejorar la cohesion', 'Agregar simbolismo'][Math.floor(Math.random() * 4)]}`,
      alternatives: [
        'Explorar diferentes perspectivas',
        'Agregar elementos de suspense',
        'Desarrollar el clmax de manera mas impactante'
      ],
      reasoning: 'Analizando estructura narrativa'
    }),
    tramas: () => ({
      content: `Para la trama: ${['Verificar la coherencia de generos', 'Asegurar la progresion del arco', 
        'Validar las asignaciones de personajes', 'Mejorar la variedad de escenas'][Math.floor(Math.random() * 4)]}`,
      alternatives: [
        'Agregar elementos que complementen la trama',
        'Revisar el orden de los Story Elements',
        'Validar la compatibilidad de roles'
      ],
      reasoning: 'Analizando estructura de la trama'
    }),
    estructura: () => ({
      content: `Para la estructura: ${['Dividir en actos claros', 'Asegurar el ritmo', 
        'Validar la progresion emocional', 'Mejorar las transiciones'][Math.floor(Math.random() * 4)]}`,
      alternatives: [
        'Considerar una estructura en 3 actos',
        'Agregar escenas de transicion',
        'Validar la duracion de cada acto'
      ],
      reasoning: 'Analizando estructura narrativa'
    }),
  };
  
  const response = sectionResponses[agente.seccion_servida]?.() || sectionResponses.proyecto();
  return response;
}

// Sample AI agents
export const agentesIAIniciales: AgenteIA[] = [
  {
    id: 'agente-proyecto',
    nombre: 'Asistente de Proyecto',
    seccion_servida: 'proyecto',
    instrucciones: 'Ayuda a definir y mejorar los aspectos generales del proyecto narrativo',
    campos_contexto: ['tipo_narrativa', 'estilo', 'contextos', 'adjuntos'],
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
  {
    id: 'agente-personajes',
    nombre: 'Creador de Personajes',
    seccion_servida: 'personajes',
    instrucciones: 'Genera y mejora personajes con profundas motivaciones y arcos narrativos',
    campos_contexto: ['nombre', 'descripcion', 'rol', 'motivaciones', 'conflictos'],
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
  {
    id: 'agente-narrativas',
    nombre: 'Desarrollador de Narrativas',
    seccion_servida: 'narrativas',
    instrucciones: 'Ayuda a crear y enriquecer las lineas generales de la historia',
    campos_contexto: ['titulo', 'descripcion', 'proyecto_id'],
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
  {
    id: 'agente-tramas',
    nombre: 'Constructor de Tramas',
    seccion_servida: 'tramas',
    instrucciones: 'Asiste en la seleccion y organizacion de Story Elements para crear tramas coherentes',
    campos_contexto: ['titulo', 'story_elements', 'arquetipo', 'personajes_asignados'],
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
  {
    id: 'agente-estructura',
    nombre: 'Arquitecto de Estructura',
    seccion_servida: 'estructura',
    instrucciones: 'Ayuda a organizar las tramas en actos y escenas',
    campos_contexto: ['trama_id', 'actos', 'escenas'],
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
];