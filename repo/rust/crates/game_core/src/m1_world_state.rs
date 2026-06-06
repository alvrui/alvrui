use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FaccionEstado {
    pub fac_id: String,
    pub nombre: String,
    pub tipo: String,
    pub fac_fuerza: u8,
    pub fac_cohesion_interna: u8,
    pub fac_necesidad_del_jugador: u8,
    pub fac_prioridad_politica_id: String,
    pub fac_linea_roja_activa: bool,
    pub fac_vigilancia_sobre_jugador: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EspacioEstado {
    pub esp_id: String,
    pub nombre: String,
    pub esp_tipo_interaccion_primaria: String,
    pub coste_temporal: u8,
    pub esp_nivel_riesgo: u8,
    pub esp_disponible: bool,
    pub esp_clima: String,
    pub esp_npcs_presentes: Vec<String>,
}
