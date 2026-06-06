use serde::{Serialize, Deserialize};
use crate::generador_eventos::EventInstance;
use crate::m4_generador_eventos::GeneradorEventos;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum GlobalPoliticalState {
    #[default]
    NormalidadTensa,
    Precrisis,
    CrisisAbierta,
    ResacaCrisis,
    CelebracionPublica,
    RepresionLatente,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TimeState {
    pub tiempo_tramo: String,
    pub acto_narrativo: u32,
    pub jornada_absoluta: u32,
    pub distancia_pivote_proximo: i32,
    pub distancia_pivote_anterior: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PoliticalClimate {
    pub estado_global: GlobalPoliticalState,
    pub polarizacion: u8,
    pub visibilidad_tablero: u8,
    pub tema_caliente_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FactionState {
    pub fac_id: String,
    pub fac_fuerza: u8,
    pub fac_necesidad_del_jugador: u8,
    pub fac_cohesion_interna: u8,
    pub fac_prioridad_politica_id: String,
    pub fac_tolerancia_disidencia: u8,
    pub fac_linea_roja_activa: bool,
    pub fac_vigilancia_sobre_jugador: u8,
    pub fac_capacidades_presion: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SpaceState {
    pub esp_id: String,
    pub esp_disponible: bool,
    pub esp_nivel_riesgo: u8,
    pub esp_clima: String,
    pub esp_npcs_presentes: Vec<String>,
    pub esp_coste_temporal: u32,
    pub esp_tipo_interaccion_primaria: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ActiveCrisis {
    pub crisis_tipo_id: String,
    pub crisis_fase: u8,
    pub crisis_jornadas_activas: u32,
    pub crisis_tablero_permeable: bool,
    pub crisis_ventana_activa: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldState {
    pub time: TimeState,
    pub political_climate: PoliticalClimate,
    pub factions: Vec<FactionState>,
    pub spaces: Vec<SpaceState>,
    pub active_crisis: Option<ActiveCrisis>,
    pub eventos_disponibles: Vec<EventInstance>,
    pub generador_eventos: GeneradorEventos,
}

impl Default for WorldState {
    fn default() -> Self {
        WorldState {
            time: TimeState::default(),
            political_climate: PoliticalClimate::default(),
            factions: Vec::new(),
            spaces: Vec::new(),
            active_crisis: None,
            eventos_disponibles: Vec::new(),
            generador_eventos: GeneradorEventos::new(),
        }
    }
}

impl WorldState {
    pub fn new() -> WorldState {
        WorldState {
            time: TimeState {
                tiempo_tramo: String::new(),
                acto_narrativo: 0,
                jornada_absoluta: 0,
                distancia_pivote_proximo: 0,
                distancia_pivote_anterior: 0,
            },
            political_climate: PoliticalClimate {
                estado_global: GlobalPoliticalState::NormalidadTensa,
                polarizacion: 0,
                visibilidad_tablero: 0,
                tema_caliente_id: String::new(),
            },
            factions: Vec::new(),
            spaces: Vec::new(),
            active_crisis: None,
            eventos_disponibles: Vec::new(),
            generador_eventos: GeneradorEventos::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_world_state_starts_with_zero_jornada() {
        let state = WorldState::new();
        assert_eq!(state.time.jornada_absoluta, 0);
    }

    #[test]
    fn test_new_world_state_starts_without_active_crisis() {
        let state = WorldState::new();
        assert!(state.active_crisis.is_none());
    }
}
