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
  seriedad: number;
  oscuridad: number;
  estilizacion: number;
}