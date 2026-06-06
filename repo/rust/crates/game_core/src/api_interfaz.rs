use crate::game_state::GameState;
use crate::player_state::PlayerState;
use crate::generador_eventos::EventTemplate;
use crate::dtos::{EstadoJornadaDto, TiempoDto, ProtagonistaDto, EventoDetalleDto, ResolverEventoOutput, EstadoPersonajeDto, MedidorDto, ReputacionDto, RelacionDto, CompromisoDto};
use serde::{Serialize, Deserialize};

pub fn get_estado_jornada(game: &GameState) -> EstadoJornadaDto {
    EstadoJornadaDto {
        tiempo: TiempoDto {
            tramo_id: game.world.time.tiempo_tramo.clone(),
            acto: game.world.time.acto_narrativo,
            jornada: game.world.time.jornada_absoluta as u32,
        },
        protagonista: ProtagonistaDto {
            posicion_formal_id: game.player.position_visibility.posicion_formal_id.clone(),
            visibilidad: format!("{:?}", game.player.position_visibility.visibilidad_publica),
            medidores: vec![
                MedidorResumenDto {
                    nombre: String::from("influencia"),
                    valor: game.player.meters.influencia_valor,
                    tendencia: game.player.meters.influencia_tendencia,
                    umbral_bajo: game.player.meters.influencia_umbral_bajo,
                    umbral_alto: game.player.meters.influencia_umbral_alto,
                },
                MedidorResumenDto {
                    nombre: String::from("relacional"),
                    valor: game.player.meters.relacional_valor,
                    tendencia: game.player.meters.relacional_tendencia,
                    umbral_bajo: game.player.meters.relacional_umbral_bajo,
                    umbral_alto: game.player.meters.relacional_umbral_alto,
                },
                MedidorResumenDto {
                    nombre: String::from("reputacion"),
                    valor: game.player.meters.reputacion_valor,
                    tendencia: game.player.meters.reputacion_tendencia,
                    umbral_bajo: game.player.meters.reputacion_umbral_bajo,
                    umbral_alto: game.player.meters.reputacion_umbral_alto,
                },
                MedidorResumenDto {
                    nombre: String::from("coherencia"),
                    valor: game.player.meters.coherencia_valor,
                    tendencia: game.player.meters.coherencia_tendencia,
                    umbral_bajo: game.player.meters.coherencia_umbral_bajo,
                    umbral_alto: game.player.meters.coherencia_umbral_alto,
                },
                MedidorResumenDto {
                    nombre: String::from("recursos"),
                    valor: game.player.meters.recursos_valor,
                    tendencia: game.player.meters.recursos_tendencia,
                    umbral_bajo: game.player.meters.recursos_umbral_bajo,
                    umbral_alto: game.player.meters.recursos_umbral_alto,
                },
                MedidorResumenDto {
                    nombre: String::from("aguante"),
                    valor: game.player.meters.aguante_valor,
                    tendencia: game.player.meters.aguante_tendencia,
                    umbral_bajo: game.player.meters.aguante_umbral_bajo,
                    umbral_alto: game.player.meters.aguante_umbral_alto,
                },
            ],
        },
        crisis_activa: game.world.active_crisis.as_ref().map(|c| CrisisActivaDto {
            tipo_id: c.crisis_tipo_id.clone(),
            fase: format!("{:?}", c.crisis_fase),
        }),
        eventos_disponibles: Vec::new(),
        presupuesto_temporal: 0,
    }
}

pub fn get_evento_detalle(
    evento_id: &str,
    plantillas: &[EventTemplate],
) -> Option<EventoDetalleDto> {
    plantillas.iter()
        .find(|t| t.id == evento_id)
        .map(|plantilla| EventoDetalleDto {
            evento_id: plantilla.id.clone(),
            familia: plantilla.familia.clone(),
            resumen_id: String::new(),
            coste_temporal: plantilla.cooldown_jornadas,
        })
}

pub fn resolver_evento(
    evento_id: &str,
    opcion_id: &str,
    game: &mut GameState,
    plantillas: &[EventTemplate],
) -> ResolverEventoOutput {
    let plantilla = plantillas.iter().find(|t| t.id == evento_id);
    if plantilla.is_none() {
        return ResolverEventoOutput {
            deltas_aplicados: Vec::new(),
            etiquetas_nuevas: Vec::new(),
            jornada_cerrada: false,
        };
    }
    let plantilla = plantilla.unwrap();

    let opcion = plantilla.opciones.iter().find(|o| o.id == opcion_id);
    if opcion.is_none() {
        return ResolverEventoOutput {
            deltas_aplicados: Vec::new(),
            etiquetas_nuevas: Vec::new(),
            jornada_cerrada: false,
        };
    }

    let deltas_aplicados = Vec::new();
    let etiquetas_nuevas = Vec::new();

    ResolverEventoOutput {
        deltas_aplicados,
        etiquetas_nuevas,
        jornada_cerrada: false,
    }
}

pub fn get_estado_personaje(player: &PlayerState) -> EstadoPersonajeDto {
    EstadoPersonajeDto {
        posicion_formal_id: player.position_visibility.posicion_formal_id.clone(),
        visibilidad: format!("{:?}", player.position_visibility.visibilidad_publica),
        medidores: vec![
            MedidorResumenDto {
                nombre: String::from("influencia"),
                valor: player.meters.influencia_valor,
                tendencia: player.meters.influencia_tendencia,
                umbral_bajo: player.meters.influencia_umbral_bajo,
                umbral_alto: player.meters.influencia_umbral_alto,
            },
            MedidorResumenDto {
                nombre: String::from("relacional"),
                valor: player.meters.relacional_valor,
                tendencia: player.meters.relacional_tendencia,
                umbral_bajo: player.meters.relacional_umbral_bajo,
                umbral_alto: player.meters.relacional_umbral_alto,
            },
            MedidorResumenDto {
                nombre: String::from("reputacion"),
                valor: player.meters.reputacion_valor,
                tendencia: player.meters.reputacion_tendencia,
                umbral_bajo: player.meters.reputacion_umbral_bajo,
                umbral_alto: player.meters.reputacion_umbral_alto,
            },
            MedidorResumenDto {
                nombre: String::from("coherencia"),
                valor: player.meters.coherencia_valor,
                tendencia: player.meters.coherencia_tendencia,
                umbral_bajo: player.meters.coherencia_umbral_bajo,
                umbral_alto: player.meters.coherencia_umbral_alto,
            },
            MedidorResumenDto {
                nombre: String::from("recursos"),
                valor: player.meters.recursos_valor,
                tendencia: player.meters.recursos_tendencia,
                umbral_bajo: player.meters.recursos_umbral_bajo,
                umbral_alto: player.meters.recursos_umbral_alto,
            },
            MedidorResumenDto {
                nombre: String::from("aguante"),
                valor: player.meters.aguante_valor,
                tendencia: player.meters.aguante_tendencia,
                umbral_bajo: player.meters.aguante_umbral_bajo,
                umbral_alto: player.meters.aguante_umbral_alto,
            },
        ],
        relaciones_count: player.relaciones.len() as usize,
        compromisos_count: player.compromisos.len() as usize,
        etiquetas_activas: Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game_state::GameState;
    use crate::player_state::PlayerState;
    use crate::generador_eventos::EventTemplate;

    #[test]
    fn test_get_estado_jornada_maps_time() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        assert_eq!(dto.tiempo.jornada, game.world.time.jornada_absoluta as u32);
    }

    #[test]
    fn test_get_estado_jornada_maps_player() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        assert_eq!(dto.protagonista.medidores.len(), 6);
    }

    #[test]
    fn test_get_estado_jornada_medidor_names_are_fixed() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        let nombres: Vec<_> = dto.protagonista.medidores.iter()
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
    fn test_get_estado_personaje_includes_all_medidores() {
        let player = PlayerState::new();
        let dto = get_estado_personaje(&player);
        assert_eq!(dto.medidores.len(), 6);
    }
}