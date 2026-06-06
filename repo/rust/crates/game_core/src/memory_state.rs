use std::collections::{HashMap, HashSet};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventHistoryEntry {
    pub id_plantilla: String,
    pub familia: String,
    pub npc_id: String,
    pub espacio_id: String,
    pub jornada: u32,
    pub opcion_elegida: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MemoryState {
    pub historial_eventos: Vec<EventHistoryEntry>,
    pub cooldowns_plantilla: HashMap<String, u32>,
    pub cooldowns_npc: HashMap<String, u32>,
    pub cooldowns_espacio: HashMap<String, u32>,
    pub etiquetas_activas: HashSet<String>,
    pub ratio_eventos_negativos: f64,
    pub intensidad_dramatica_acumulada: u32,
    pub ultimo_evento_por_familia: HashMap<String, u32>,
    pub ultimo_evento_por_espacio: HashMap<String, u32>,
    pub ultimo_evento_por_faccion: HashMap<String, u32>,
    pub ultimo_evento_por_npc: HashMap<String, u32>,
}

impl MemoryState {
    pub fn new() -> MemoryState {
        MemoryState {
            historial_eventos: Vec::new(),
            cooldowns_plantilla: HashMap::new(),
            cooldowns_npc: HashMap::new(),
            cooldowns_espacio: HashMap::new(),
            etiquetas_activas: HashSet::new(),
            ratio_eventos_negativos: 0.0,
            intensidad_dramatica_acumulada: 0,
            ultimo_evento_por_familia: HashMap::new(),
            ultimo_evento_por_espacio: HashMap::new(),
            ultimo_evento_por_faccion: HashMap::new(),
            ultimo_evento_por_npc: HashMap::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_memory_state_starts_empty() {
        let state = MemoryState::new();
        assert!(state.historial_eventos.is_empty());
        assert!(state.etiquetas_activas.is_empty());
    }

    #[test]
    fn test_new_memory_state_starts_with_zero_drama_metrics() {
        let state = MemoryState::new();
        assert_eq!(state.intensidad_dramatica_acumulada, 0);
        assert_eq!(state.ratio_eventos_negativos, 0.0);
    }

    #[test]
    fn test_new_memory_state_has_separate_cooldown_maps() {
        let state = MemoryState::new();
        assert!(state.cooldowns_plantilla.is_empty());
        assert!(state.cooldowns_npc.is_empty());
        assert!(state.cooldowns_espacio.is_empty());
    }
}