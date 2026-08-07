import { StoryElement, FiltroStoryElement } from '../types';

export function filtrarStoryElements(
  elements: StoryElement[],
  filtros: FiltroStoryElement
): StoryElement[] {
  return elements.filter((element) => {
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      const coincideNombre = element.name.toLowerCase().includes(busquedaLower);
      const coincideDescripcion = element.logline_usage.toLowerCase().includes(busquedaLower);
      const coincideTags = element.tags_engine.some(tag => tag.toLowerCase().includes(busquedaLower));
      const coincideGeneros = [...element.primary_genres, ...element.secondary_genres].some(g => g.toLowerCase().includes(busquedaLower));
      if (!coincideNombre && !coincideDescripcion && !coincideTags && !coincideGeneros) {
        return false;
      }
    }

    if (filtros.category && filtros.category.length > 0 && !filtros.category.includes(element.category)) {
      return false;
    }

    if (filtros.subtype && filtros.subtype.length > 0 && !filtros.subtype.includes(element.subtype)) {
      return false;
    }

    if (filtros.role_in_story && filtros.role_in_story.length > 0) {
      const tieneRol = element.role_in_story.some(rol => filtros.role_in_story!.includes(rol));
      if (!tieneRol) return false;
    }

    if (filtros.arc_phase_affinity && filtros.arc_phase_affinity.length > 0) {
      const tieneFase = element.arc_phase_affinity.some(fase => filtros.arc_phase_affinity!.includes(fase));
      if (!tieneFase) return false;
    }

    if (filtros.primary_genres && filtros.primary_genres.length > 0) {
      const tieneGenero = element.primary_genres.some(g => filtros.primary_genres!.includes(g));
      if (!tieneGenero) return false;
    }

    if (filtros.secondary_genres && filtros.secondary_genres.length > 0) {
      const tieneGenero = element.secondary_genres.some(g => filtros.secondary_genres!.includes(g));
      if (!tieneGenero) return false;
    }

    if (filtros.conflict_type && filtros.conflict_type.length > 0) {
      const tieneConflicto = element.conflict_type.some(c => filtros.conflict_type!.includes(c));
      if (!tieneConflicto) return false;
    }

    if (filtros.narrative_scale && filtros.narrative_scale.length > 0 && !filtros.narrative_scale.includes(element.narrative_scale)) {
      return false;
    }

    if (filtros.stakes_level && filtros.stakes_level.length > 0 && !filtros.stakes_level.includes(element.stakes_level)) {
      return false;
    }

    if (filtros.default_periods && filtros.default_periods.length > 0) {
      const tienePeriodo = element.default_periods.some(p => filtros.default_periods!.includes(p));
      if (!tienePeriodo) return false;
    }

    if (filtros.default_settings && filtros.default_settings.length > 0) {
      const tieneEntorno = element.default_settings.some(s => filtros.default_settings!.includes(s));
      if (!tieneEntorno) return false;
    }

    if (filtros.tone_seriousness) {
      const [min, max] = filtros.tone_seriousness;
      if (element.tone_seriousness < min || element.tone_seriousness > max) return false;
    }

    if (filtros.tone_darkness) {
      const [min, max] = filtros.tone_darkness;
      if (element.tone_darkness < min || element.tone_darkness > max) return false;
    }

    return true;
  });
}

export function obtenerOpcionesFiltro(elements: StoryElement[]) {
  const categories = [...new Set(elements.map(e => e.category))].sort();
  const subtypes = [...new Set(elements.map(e => e.subtype))].sort();
  const roles = [...new Set(elements.flatMap(e => e.role_in_story))].sort();
  const arc_phases = [...new Set(elements.flatMap(e => e.arc_phase_affinity))].sort();
  const primary_genres = [...new Set(elements.flatMap(e => e.primary_genres))].sort();
  const secondary_genres = [...new Set(elements.flatMap(e => e.secondary_genres))].sort();
  const conflict_types = [...new Set(elements.flatMap(e => e.conflict_type))].sort();
  const narrative_scales = [...new Set(elements.map(e => e.narrative_scale))].sort();
  const stakes_levels = [...new Set(elements.map(e => e.stakes_level))].sort();
  const periods = [...new Set(elements.flatMap(e => e.default_periods))].sort();
  const settings = [...new Set(elements.flatMap(e => e.default_settings))].sort();

  return {
    categories,
    subtypes,
    roles,
    arc_phases,
    primary_genres,
    secondary_genres,
    conflict_types,
    narrative_scales,
    stakes_levels,
    periods,
    settings,
  };
}