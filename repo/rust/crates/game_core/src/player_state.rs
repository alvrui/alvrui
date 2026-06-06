use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PublicVisibility {
    Desconocido,
    Emergente,
    FiguraReconocible,
    MuyExpuesto,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MoralTrajectory {
    Oportunista,
    Coherente,
    Ambiguo,
    Fiable,
    Temido,
    Imprescindible,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RelationIntensity {
    Desconocido,
    Contacto,
    Aliado,
    IntimoPolitico,
    Rival,
    Enemigo,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RelationExposure {
    Publica,
    Discreta,
    Secreta,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EmotionalState {
    Estable,
    Resentida,
    Tensa,
    Agradecida,
    Rota,
    EnRevision,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CommitmentVisibility {
    Publico,
    Privado,
    Secreto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub perfil_clase_social_id: String,
    pub perfil_origen_id: String,
    pub perfil_adscripcion_id: String,
    pub perfil_oficio_id: String,
    pub perfil_temperamento_id: String,
    pub perfil_compromiso_inicial_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionVisibility {
    pub posicion_formal_id: String,
    pub visibilidad_publica: PublicVisibility,
    pub trayectoria_moral: MoralTrajectory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerMeters {
    pub influencia_valor: u8,
    pub influencia_tendencia: i8,
    pub influencia_umbral_bajo: u8,
    pub influencia_umbral_alto: u8,

    pub relacional_valor: u8,
    pub relacional_tendencia: i8,
    pub relacional_umbral_bajo: u8,
    pub relacional_umbral_alto: u8,

    pub reputacion_valor: u8,
    pub reputacion_tendencia: i8,
    pub reputacion_umbral_bajo: u8,
    pub reputacion_umbral_alto: u8,

    pub coherencia_valor: u8,
    pub coherencia_tendencia: i8,
    pub coherencia_umbral_bajo: u8,
    pub coherencia_umbral_alto: u8,

    pub recursos_valor: u8,
    pub recursos_tendencia: i8,
    pub recursos_umbral_bajo: u8,
    pub recursos_umbral_alto: u8,

    pub aguante_valor: u8,
    pub aguante_tendencia: i8,
    pub aguante_umbral_bajo: u8,
    pub aguante_umbral_alto: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupReputation {
    pub grupo_id: String,
    pub valor: u8,
    pub tendencia: i8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NpcRelation {
    pub npc_id: String,
    pub intensidad: RelationIntensity,
    pub rel_tipo_vinculo_id: String,
    pub confianza: u8,
    pub deuda: i8,
    pub exposicion: RelationExposure,
    pub estado_emocional: EmotionalState,
    pub jornadas_sin_contacto: u32,
    pub agenda_activa: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Commitment {
    pub comp_id: String,
    pub comp_emisor_id: String,
    pub comp_receptor_id: String,
    pub comp_naturaleza_id: String,
    pub comp_visibilidad: CommitmentVisibility,
    pub comp_jornada_creacion: u32,
    pub comp_jornada_vencimiento: u32,
    pub comp_gravedad: u8,
    pub comp_presion_activa: bool,
    pub comp_renegociable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalState {
    pub personal_dependiente_en_riesgo: bool,
    pub personal_presion_economica: u8,
    pub personal_fatiga_acumulada: u32,
    pub personal_contradiccion_dominante_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerState {
    pub profile: Profile,
    pub position_visibility: PositionVisibility,
    pub meters: PlayerMeters,
    pub reputaciones: Vec<GroupReputation>,
    pub relaciones: Vec<NpcRelation>,
    pub compromisos: Vec<Commitment>,
    pub personal_state: PersonalState,
}

impl Default for Profile {
    fn default() -> Self {
        Profile {
            perfil_clase_social_id: String::new(),
            perfil_origen_id: String::new(),
            perfil_adscripcion_id: String::new(),
            perfil_oficio_id: String::new(),
            perfil_temperamento_id: String::new(),
            perfil_compromiso_inicial_id: String::new(),
        }
    }
}

impl Default for PositionVisibility {
    fn default() -> Self {
        PositionVisibility {
            posicion_formal_id: String::new(),
            visibilidad_publica: PublicVisibility::Desconocido,
            trayectoria_moral: MoralTrajectory::Ambiguo,
        }
    }
}

impl Default for PlayerMeters {
    fn default() -> Self {
        PlayerMeters {
            influencia_valor: 0,
            influencia_tendencia: 0,
            influencia_umbral_bajo: 0,
            influencia_umbral_alto: 0,

            relacional_valor: 0,
            relacional_tendencia: 0,
            relacional_umbral_bajo: 0,
            relacional_umbral_alto: 0,

            reputacion_valor: 0,
            reputacion_tendencia: 0,
            reputacion_umbral_bajo: 0,
            reputacion_umbral_alto: 0,

            coherencia_valor: 0,
            coherencia_tendencia: 0,
            coherencia_umbral_bajo: 0,
            coherencia_umbral_alto: 0,

            recursos_valor: 0,
            recursos_tendencia: 0,
            recursos_umbral_bajo: 0,
            recursos_umbral_alto: 0,

            aguante_valor: 0,
            aguante_tendencia: 0,
            aguante_umbral_bajo: 0,
            aguante_umbral_alto: 0,
        }
    }
}

impl Default for PersonalState {
    fn default() -> Self {
        PersonalState {
            personal_dependiente_en_riesgo: false,
            personal_presion_economica: 0,
            personal_fatiga_acumulada: 0,
            personal_contradiccion_dominante_id: String::new(),
        }
    }
}

impl PlayerState {
    pub fn new() -> PlayerState {
        PlayerState {
            profile: Profile::default(),
            position_visibility: PositionVisibility::default(),
            meters: PlayerMeters::default(),
            reputaciones: Vec::new(),
            relaciones: Vec::new(),
            compromisos: Vec::new(),
            personal_state: PersonalState::default(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_player_state_has_zeroed_core_meter_values() {
        let state = PlayerState::new();
        assert_eq!(state.meters.influencia_valor, 0);
        assert_eq!(state.meters.relacional_valor, 0);
        assert_eq!(state.meters.reputacion_valor, 0);
        assert_eq!(state.meters.coherencia_valor, 0);
        assert_eq!(state.meters.recursos_valor, 0);
        assert_eq!(state.meters.aguante_valor, 0);
    }

    #[test]
    fn test_new_player_state_starts_with_empty_dynamic_collections() {
        let state = PlayerState::new();
        assert!(state.reputaciones.is_empty());
        assert!(state.relaciones.is_empty());
        assert!(state.compromisos.is_empty());
    }

    #[test]
    fn test_new_player_state_has_default_visibility_state() {
        let state = PlayerState::new();
        match state.position_visibility.visibilidad_publica {
            PublicVisibility::Desconocido => {},
            _ => panic!("expected Desconocido"),
        }
    }
}