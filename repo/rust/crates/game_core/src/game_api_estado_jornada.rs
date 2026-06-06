use crate::game_state::GameState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TiempoDto {
    pub tramo_id: String,
    pub acto: u32,
    pub jornada: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MedidorResumenDto {
    pub nombre: String,
    pub valor: u8,
    pub tendencia: i8,
    pub umbral_bajo: u8,
    pub umbral_alto: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtagonistaDto {
    pub posicion_formal_id: String,
    pub visibilidad: String,
    pub medidores: Vec<MedidorResumenDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrisisActivaDto {
    pub tipo_id: String,
    pub fase: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventoDisponibleDto {
    pub evento_id: String,
    pub familia: String,
    pub resumen_id: String,
    pub coste_temporal: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstadoJornadaDto {
    pub tiempo: TiempoDto,
    pub protagonista: ProtagonistaDto,
    pub crisis_activa: Option<CrisisActivaDto>,
    pub eventos_disponibles: Vec<EventoDisponibleDto>,
    pub presupuesto_temporal: u8,
}

pub fn get_estado_jornada(game: &GameState) -> EstadoJornadaDto {
    EstadoJornadaDto {
        tiempo: TiempoDto {
            tramo_id: String::new(),
            acto: 0,
            jornada: game.world.time.jornada_absoluta as u32,
        },
        protagonista: ProtagonistaDto {
            posicion_formal_id: String::new(),
            visibilidad: String::from("desconocido"),
            medidores: vec![
                MedidorResumenDto {
                    nombre: String::from("influencia"),
                    valor: 50,
                    tendencia: 0,
                    umbral_bajo: 25,
                    umbral_alto: 75,
                },
                MedidorResumenDto {
                    nombre: String::from("relacional"),
                    valor: 50,
                    tendencia: 0,
                    umbral_bajo: 25,
                    umbral_alto: 75,
                },
                MedidorResumenDto {
                    nombre: String::from("reputacion"),
                    valor: 50,
                    tendencia: 0,
                    umbral_bajo: 25,
                    umbral_alto: 75,
                },
                MedidorResumenDto {
                    nombre: String::from("coherencia"),
                    valor: 50,
                    tendencia: 0,
                    umbral_bajo: 25,
                    umbral_alto: 75,
                },
                MedidorResumenDto {
                    nombre: String::from("recursos"),
                    valor: 50,
                    tendencia: 0,
                    umbral_bajo: 25,
                    umbral_alto: 75,
                },
                MedidorResumenDto {
                    nombre: String::from("aguante"),
                    valor: 50,
                    tendencia: 0,
                    umbral_bajo: 25,
                    umbral_alto: 75,
                },
            ],
        },
        crisis_activa: None,
        eventos_disponibles: Vec::new(),
        presupuesto_temporal: 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game_state::GameState;

    #[test]
    fn test_get_estado_jornada_maps_time_and_player() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        assert_eq!(dto.tiempo.jornada, game.world.time.jornada_absoluta as u32);
        assert_eq!(dto.protagonista.medidores.len(), 6);
    }

    #[test]
    fn test_get_estado_jornada_initial_events_list_is_empty() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        assert!(dto.eventos_disponibles.is_empty());
    }

    #[test]
    fn test_get_estado_jornada_medidor_names_are_fixed() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        let nombres: Vec<_> = dto
            .protagonista
            .medidores
            .iter()
            .map(|m| m.nombre.as_str())
            .collect();

        assert_eq!(
            nombres,
            vec![
                "influencia",
                "relacional",
                "reputacion",
                "coherencia",
                "recursos",
                "aguante"
            ]
        );
    }

    #[test]
    fn test_get_estado_jornada_stub_values_follow_contract() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);

        assert_eq!(dto.tiempo.acto, 0);
        assert!(dto.tiempo.tramo_id.is_empty());
        assert_eq!(dto.protagonista.posicion_formal_id, "");
        assert_eq!(dto.protagonista.visibilidad, "desconocido");
        assert!(dto.crisis_activa.is_none());
        assert!(dto.eventos_disponibles.is_empty());
        assert_eq!(dto.presupuesto_temporal, 0);

        for m in dto.protagonista.medidores {
            assert_eq!(m.valor, 50);
            assert_eq!(m.tendencia, 0);
            assert_eq!(m.umbral_bajo, 25);
            assert_eq!(m.umbral_alto, 75);
        }
    }
}
