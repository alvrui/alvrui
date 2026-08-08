// Project Types
export interface Proyecto {
  id: string;
  nombre: string;
  tipo_narrativa: string;
  estilo: string;
  contextos: Contexto[];
  adjuntos: Adjunto[];
  creado_en: string;
  actualizado_en: string;
}

export interface Contexto {
  id: string;
  tipo: 'historico' | 'social' | 'geografico' | 'temporal' | 'cultural' | string;
  descripcion: string;
}

export interface Adjunto {
  id: string;
  nombre: string;
  tipo: 'documento' | 'imagen' | 'audio' | 'video' | string;
  url: string;
  tamano: number;
}

// Character Types
export interface Personaje {
  id: string;
  nombre: string;
  descripcion: string;
  rol: 'protagonista' | 'antagonista' | 'aliado' | 'mentor' | 'antiheroe' | string;
  motivaciones: string[];
  conflictos: string[];
  rasgos: string[];
  objetivos: string[];
  antecedentes: string;
  creado_en: string;
  actualizado_en: string;
}

// Narrative Types
export interface Narrativa {
  id: string;
  titulo: string;
  descripcion: string;
  proyecto_id: string;
  creado_en: string;
  actualizado_en: string;
}

// Story Element Types
export interface StoryElement {
  id: string;
  name: string;
  category: string;
  subtype: string;
  role_in_story: string[];
  logline_usage: string;
  dramatic_function: string;
  arc_phase_affinity: string[];
  scene_type_affinity: string[];
  primary_genres: string[];
  secondary_genres: string[];
  tone_seriousness: number;
  tone_darkness: number;
  tone_stylization: number;
  emotional_core: string;
  moral_axis: string;
  character_change_potential: number;
  narrative_scale: 'personal' | 'local' | 'regional' | 'nacional' | 'global' | 'cosmico';
  conflict_type: string[];
  stakes_level: 'bajo' | 'medio' | 'alto' | 'extremo';
  default_periods: string[];
  default_settings: string[];
  period_flexibility: number;
  worldbuilding_requirement: number;
  sensitivity_tags: string[];
  rating_floor: string;
  hays_code_relevant: boolean;
  professional_notes: string;
  script_usage_notes: string;
  production_implications: string;
  tags_engine: string[];
  priority_for_generation: number;
  english_name: string;
  spanish_name: string;
}

// Plot Types
export interface Trama {
  id: string;
  titulo: string;
  proyecto_id: string;
  narrativa_id?: string;
  arquetipo?: string;
  story_elements: TramaStoryElement[];
  personajes_asignados: AsignacionPersonaje[];
  creado_en: string;
  actualizado_en: string;
}

export interface TramaStoryElement {
  id: string;
  story_element_id: string;
  orden: number;
  role_in_story: string;
  personaje_asignado_id?: string;
  descripcion_personalizada: string;
  atributos_personalizados: Record<string, unknown>;
}

export interface AsignacionPersonaje {
  trama_id: string;
  story_element_id: string;
  role: string;
  personaje_id: string;
}

// Narrative Structure Types
export interface EstructuraNarrativa {
  id: string;
  trama_id: string;
  actos: Acto[];
  creado_en: string;
  actualizado_en: string;
}

export interface Acto {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  escenas: Escena[];
}

export interface Escena {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  texto: string;
  story_element_ids: string[];
  personaje_ids: string[];
  tipo: string;
  duracion: string;
}

// AI Agent Types
export interface AgenteIA {
  id: string;
  nombre: string;
  ultima_conversacion_id?: string;
  seccion_servida: 'proyecto' | 'personajes' | 'narrativas' | 'tramas' | 'estructura';
  instrucciones: string;
  campos_contexto: string[];
  creado_en: string;
  actualizado_en: string;
}

// Filter Types
export interface FiltroStoryElement {
  category?: string[];
  subtype?: string[];
  role_in_story?: string[];
  arc_phase_affinity?: string[];
  primary_genres?: string[];
  secondary_genres?: string[];
  tone_seriousness?: [number, number];
  tone_darkness?: [number, number];
  conflict_type?: string[];
  narrative_scale?: string[];
  stakes_level?: string[];
  default_periods?: string[];
  default_settings?: string[];
  busqueda?: string;
}

// Validation Types
export interface ProblemaValidacion {
  tipo: 'advertencia' | 'error';
  mensaje: string;
  severidad: 'baja' | 'media' | 'alta';
  elemento_id?: string;
  campo?: string;
}

// UI State Types
export interface EstadoUI {
  seccion_actual: 'proyecto' | 'personajes' | 'narrativas' | 'tramas' | 'estructura' | 'agentes';
  modo_edicion: boolean;
  elemento_seleccionado_id?: string;
  filtros_activos: FiltroStoryElement;
  elementos_favoritos: string[];
  elementos_recientes: string[];
}

// Arc Phase Types
export type FaseArco = 
  | 'setup'
  | 'inciting_incident'
  | 'rising_action'
  | 'midpoint'
  | 'climax'
  | 'resolution'
  | 'denouement';

export const fasesArco: FaseArco[] = [
  'setup',
  'inciting_incident',
  'rising_action',
  'midpoint',
  'climax',
  'resolution',
  'denouement',
];

// Genre Types
export const generosPrincipales = [
  'drama',
  'comedia',
  'thriller',
  'aventura',
  'misterio',
  'romance',
  'accion',
  'ciencia_ficcion',
  'fantasia',
  'terror',
  'suspense',
];

// Narrative Archetype Types
export const arquetiposNarrativos = [
  'viaje_del_heroe',
  'tragedia',
  'comedia',
  'busqueda',
  'aventura',
  'misterio',
  'romance',
  'supervivencia',
  'redencion',
  'transformacion',
];

// Character Role Types
export const rolesPersonaje = [
  'protagonista',
  'antagonista',
  'aliado',
  'mentor',
  'antiheroe',
  'compañero',
  'oponente',
  'figura_autoridad',
  'victima',
  'heroe',
];

// Conflict Types
export const tiposConflicto = [
  'interpersonal',
  'interno',
  'social',
  'fisico',
  'moral',
  'existencial',
  'tecnologico',
  'sobrenatural',
];

// Tone Descriptors
export interface Tono {
  seriedad: number; // 0-10
  oscuridad: number; // 0-10
  estilizacion: number; // 0-10
}

// Sample Story Elements for the catalog
export const sampleStoryElements: StoryElement[] = [
  {
    id: 'heroe-accidental',
    name: 'Héroe accidental',
    category: 'PROTAGONIST',
    subtype: 'heroic_archetype',
    role_in_story: ['protagonist'],
    logline_usage: 'Un personaje ordinario que se ve obligado a asumir un papel heroico',
    dramatic_function: 'Protagonista que experimenta crecimiento a traves de la adversidad',
    arc_phase_affinity: ['setup', 'inciting_incident', 'rising_action', 'climax'],
    scene_type_affinity: ['confrontacion', 'decision', 'transformacion'],
    primary_genres: ['drama', 'aventura'],
    secondary_genres: ['accion', 'ciencia_ficcion'],
    tone_seriousness: 7,
    tone_darkness: 5,
    tone_stylization: 3,
    emotional_core: 'Esperanza y sacrificio',
    moral_axis: 'Altruismo vs Egoismo',
    character_change_potential: 9,
    narrative_scale: 'personal',
    conflict_type: ['interpersonal', 'interno'],
    stakes_level: 'alto',
    default_periods: ['contemporaneo', 'futuro_cercano'],
    default_settings: ['ciudad', 'pueblo_pequeño'],
    period_flexibility: 8,
    worldbuilding_requirement: 4,
    sensitivity_tags: [],
    rating_floor: 'PG-13',
    hays_code_relevant: false,
    professional_notes: 'Ideal para historias de crecimiento personal',
    script_usage_notes: 'Funciona bien en el primer acto para establecer el personaje',
    production_implications: 'Requiere actor con buen rango emocional',
    tags_engine: ['heroe', 'crecimiento', 'ordinario_a_extraordinario'],
    priority_for_generation: 10,
    english_name: 'Accidental Hero',
    spanish_name: 'Héroe accidental',
  },
  {
    id: 'mentor-sabio',
    name: 'Mentor sabio',
    category: 'SUPPORTING',
    subtype: 'mentor_archetype',
    role_in_story: ['mentor'],
    logline_usage: 'Figura experimentada que guia al protagonista',
    dramatic_function: 'Proporcionar sabiduria y entrenamiento al heroe',
    arc_phase_affinity: ['setup', 'rising_action'],
    scene_type_affinity: ['consejo', 'entrenamiento', 'revelacion'],
    primary_genres: ['fantasia', 'ciencia_ficcion'],
    secondary_genres: ['aventura', 'drama'],
    tone_seriousness: 8,
    tone_darkness: 3,
    tone_stylization: 2,
    emotional_core: 'Sabiduria y paciencia',
    moral_axis: 'Sabiduria vs Ignorancia',
    character_change_potential: 2,
    narrative_scale: 'personal',
    conflict_type: ['interpersonal'],
    stakes_level: 'medio',
    default_periods: ['any'],
    default_settings: ['any'],
    period_flexibility: 10,
    worldbuilding_requirement: 6,
    sensitivity_tags: [],
    rating_floor: 'PG',
    hays_code_relevant: false,
    professional_notes: 'Puede ser una figura paternal o maternal',
    script_usage_notes: 'Importante en el primer acto',
    production_implications: 'Actor de edad avanzada preferible',
    tags_engine: ['mentor', 'sabiduria', 'guia'],
    priority_for_generation: 9,
    english_name: 'Wise Mentor',
    spanish_name: 'Mentor sabio',
  },
  {
    id: 'antagonista-despiadado',
    name: 'Antagonista despiadado',
    category: 'ANTAGONIST',
    subtype: 'villain_archetype',
    role_in_story: ['antagonist'],
    logline_usage: 'Oponente principal que busca destruir al protagonista',
    dramatic_function: 'Crear conflicto y tension narrativa',
    arc_phase_affinity: ['inciting_incident', 'rising_action', 'climax'],
    scene_type_affinity: ['confrontacion', 'persecucion', 'traicion'],
    primary_genres: ['accion', 'thriller'],
    secondary_genres: ['drama', 'ciencia_ficcion'],
    tone_seriousness: 9,
    tone_darkness: 8,
    tone_stylization: 4,
    emotional_core: 'Odio y ambicion',
    moral_axis: 'Destruccion vs Creacion',
    character_change_potential: 3,
    narrative_scale: 'global',
    conflict_type: ['fisico', 'moral'],
    stakes_level: 'extremo',
    default_periods: ['contemporaneo', 'futuro'],
    default_settings: ['ciudad', 'base_secreta'],
    period_flexibility: 6,
    worldbuilding_requirement: 8,
    sensitivity_tags: ['violencia', 'muerte'],
    rating_floor: 'R',
    hays_code_relevant: true,
    professional_notes: 'Requiere desarrollo de motivaciones claras',
    script_usage_notes: 'Debe aparecer temprano para establecer amenaza',
    production_implications: 'Presupuesto alto para efectos visuales',
    tags_engine: ['villano', 'malvado', 'oponente'],
    priority_for_generation: 8,
    english_name: 'Ruthless Antagonist',
    spanish_name: 'Antagonista despiadado',
  },
  {
    id: 'llamada-aventura',
    name: 'Llamada a la aventura',
    category: 'PLOT_POINT',
    subtype: 'narrative_event',
    role_in_story: [],
    logline_usage: 'Evento que incita al protagonista a comenzar su viaje',
    dramatic_function: 'Iniciar el viaje del heroe',
    arc_phase_affinity: ['inciting_incident'],
    scene_type_affinity: ['descubrimiento', 'invitation', 'crisis'],
    primary_genres: ['aventura', 'fantasia'],
    secondary_genres: ['drama', 'ciencia_ficcion'],
    tone_seriousness: 6,
    tone_darkness: 4,
    tone_stylization: 5,
    emotional_core: 'Excitacion y miedo',
    moral_axis: 'Aceptacion vs Rechazo',
    character_change_potential: 7,
    narrative_scale: 'personal',
    conflict_type: ['interno'],
    stakes_level: 'medio',
    default_periods: ['any'],
    default_settings: ['any'],
    period_flexibility: 9,
    worldbuilding_requirement: 5,
    sensitivity_tags: [],
    rating_floor: 'PG',
    hays_code_relevant: false,
    professional_notes: 'Momento clave en la estructura narrativa',
    script_usage_notes: 'Debe ser memorable y emocionalmente impactante',
    production_implications: 'Puede requerir efectos especiales',
    tags_engine: ['inicio', 'llamada', 'catalizador'],
    priority_for_generation: 10,
    english_name: 'Call to Adventure',
    spanish_name: 'Llamada a la aventura',
  },
  {
    id: 'prueba-iniciatica',
    name: 'Prueba iniciática',
    category: 'CHALLENGE',
    subtype: 'test',
    role_in_story: [],
    logline_usage: 'Desafio que el protagonista debe superar para demostrar su valor',
    dramatic_function: 'Desarrollar habilidades y confianza del protagonista',
    arc_phase_affinity: ['rising_action'],
    scene_type_affinity: ['prueba', 'entrenamiento', 'superacion'],
    primary_genres: ['fantasia', 'aventura'],
    secondary_genres: ['accion', 'drama'],
    tone_seriousness: 7,
    tone_darkness: 5,
    tone_stylization: 3,
    emotional_core: 'Determinacion y crecimiento',
    moral_axis: 'Perseverancia vs Rendicion',
    character_change_potential: 8,
    narrative_scale: 'personal',
    conflict_type: ['fisico', 'interpersonal'],
    stakes_level: 'alto',
    default_periods: ['any'],
    default_settings: ['bosque', 'montaña', 'templo'],
    period_flexibility: 8,
    worldbuilding_requirement: 7,
    sensitivity_tags: [],
    rating_floor: 'PG-13',
    hays_code_relevant: false,
    professional_notes: 'Puede ser fisica, mental o emocional',
    script_usage_notes: 'Importante para el desarrollo del personaje',
    production_implications: 'Puede requerir locaciones especiales',
    tags_engine: ['prueba', 'desafio', 'crecimiento'],
    priority_for_generation: 8,
    english_name: 'Initiation Test',
    spanish_name: 'Prueba iniciática',
  },
];