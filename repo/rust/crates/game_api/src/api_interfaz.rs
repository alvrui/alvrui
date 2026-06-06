use game_core::game_state::GameState;
use game_core::player_state::PlayerState;
use game_core::generador_eventos::{EventTemplate, Opcion, Consecuencia};
use crate::dtos::{EstadoJornadaDto, TiempoDto, ProtagonistaDto, EventoDetalleDto, ResolverEventoOutput, EstadoPersonajeDto, MedidorResumenDto, CrisisActivaDto};
use std::collections::HashSet;

pub fn get_estado_jornada(game: &GameState) -> EstadoJornadaDto {
    EstadoJornadaDto {
        tiempo: TiempoDto {
            tramo_id: game.world.time.tiempo_tramo.clone(),
            acto: game.world.time.acto_narrativo as i32,
            jornada: game.world.time.jornada_absoluta as i32,
        },
        protagonista: ProtagonistaDto {
            nombre: String::new(),
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
            relaciones_count: game.player.relaciones.len(),
            compromisos_count: game.player.compromisos.len(),
            etiquetas_activas: Vec::new(),
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
    // 1. Buscar la plantilla del evento
    let plantilla = match plantillas.iter().find(|t| t.id == evento_id) {
        Some(t) => t,
        None => return ResolverEventoOutput {
            deltas_aplicados: Vec::new(),
            etiquetas_nuevas: Vec::new(),
            jornada_cerrada: false,
        },
    };

    // 2. Buscar la opción elegida
    let opcion = match plantilla.opciones.iter().find(|o| o.id == opcion_id) {
        Some(o) => o,
        None => return ResolverEventoOutput {
            deltas_aplicados: Vec::new(),
            etiquetas_nuevas: Vec::new(),
            jornada_cerrada: false,
        },
    };

    // 3. Aplicar consecuencias
    let mut deltas_aplicados: Vec<String> = Vec::new();
    let mut etiquetas_nuevas: Vec<String> = Vec::new();

    for consecuencia in &opcion.consecuencias {
        match consecuencia.target.as_str() {
            // Medidores
            "med_influencia" => {
                let old_val = game.player.meters.influencia_valor;
                game.player.meters.influencia_valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                deltas_aplicados.push(format!("med_influencia: {} -> {}", old_val, game.player.meters.influencia_valor));
            }
            "med_relacional" => {
                let old_val = game.player.meters.relacional_valor;
                game.player.meters.relacional_valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                deltas_aplicados.push(format!("med_relacional: {} -> {}", old_val, game.player.meters.relacional_valor));
            }
            "med_reputacion" => {
                let old_val = game.player.meters.reputacion_valor;
                game.player.meters.reputacion_valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                deltas_aplicados.push(format!("med_reputacion: {} -> {}", old_val, game.player.meters.reputacion_valor));
            }
            "med_coherencia" => {
                let old_val = game.player.meters.coherencia_valor;
                game.player.meters.coherencia_valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                deltas_aplicados.push(format!("med_coherencia: {} -> {}", old_val, game.player.meters.coherencia_valor));
            }
            "med_recursos" => {
                let old_val = game.player.meters.recursos_valor;
                game.player.meters.recursos_valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                deltas_aplicados.push(format!("med_recursos: {} -> {}", old_val, game.player.meters.recursos_valor));
            }
            "med_aguante" => {
                let old_val = game.player.meters.aguante_valor;
                game.player.meters.aguante_valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                deltas_aplicados.push(format!("med_aguante: {} -> {}", old_val, game.player.meters.aguante_valor));
            }
            // Reputaciones
            target if target.starts_with("rep_") => {
                let grupo_id = target.to_string();
                if let Some(reputacion) = game.player.reputaciones.iter_mut().find(|r| r.grupo_id == grupo_id) {
                    let old_val = reputacion.valor;
                    reputacion.valor = (old_val as i32 + consecuencia.delta).clamp(0, 100) as u8;
                    deltas_aplicados.push(format!("rep_{}: {} -> {}", grupo_id, old_val, reputacion.valor));
                }
            }
            // Etiquetas
            target if target.starts_with("etiqueta_") => {
                let etiqueta = target.to_string();
                etiquetas_nuevas.push(etiqueta);
            }
            // Compromisos (simplificado)
            target if target.starts_with("comp_") => {
                deltas_aplicados.push(format!("compromiso: {}", target));
            }
            _ => {
                deltas_aplicados.push(format!("desconocido: {}", consecuencia.target));
            }
        }
    }

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
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use game_core::game_state::GameState;
    use game_core::player_state::PlayerState;
    use game_core::generador_eventos::{EventTemplate, Opcion, Consecuencia};

    #[test]
    fn test_get_estado_jornada_maps_time() {
        let game = GameState::new();
        let dto = get_estado_jornada(&game);
        assert_eq!(dto.tiempo.jornada, game.world.time.jornada_absoluta as i32);
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
    fn test_resolver_evento_aplica_consecuencias_a_medidores() {
        let mut game = GameState::new();
        let plantillas = vec![EventTemplate {
            id: String::from("test_event"),
            familia: String::from("A"),
            opciones: vec![Opcion {
                id: String::from("op1"),
                texto_id: String::new(),
                consecuencias: vec![Consecuencia {
                    target: String::from("med_influencia"),
                    delta: 10,
                    diferida_jornadas: 0,
                }],
            }],
            ..Default::default()
        }];

        let resultado = resolver_evento("test_event", "op1", &mut game, &plantillas);
        assert_eq!(resultado.deltas_aplicados.len(), 1);
        assert!(resultado.deltas_aplicados[0].contains("med_influencia: 0 -> 10"));
        assert_eq!(game.player.meters.influencia_valor, 10);
    }

    #[test]
    fn test_resolver_evento_activa_etiquetas() {
        let mut game = GameState::new();
        let plantillas = vec![EventTemplate {
            id: String::from("test_event"),
            familia: String::from("A"),
            opciones: vec![Opcion {
                id: String::from("op1"),
                texto_id: String::new(),
                consecuencias: vec![Consecuencia {
                    target: String::from("etiqueta_conoce_a_arguelles"),
                    delta: 0,
                    diferida_jornadas: 0,
                }],
            }],
            ..Default::default()
        }];

        let resultado = resolver_evento("test_event", "op1", &mut game, &plantillas);
        assert_eq!(resultado.etiquetas_nuevas.len(), 1);
        assert_eq!(resultado.etiquetas_nuevas[0], "etiqueta_conoce_a_arguelles");
    }

    #[test]
    fn test_get_estado_personaje_includes_all_medidores() {
        let player = PlayerState::new();
        let dto = get_estado_personaje(&player);
        assert_eq!(dto.medidores.len(), 6);
    }
}
