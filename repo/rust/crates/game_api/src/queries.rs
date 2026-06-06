use game_core::game_state::GameState;

use crate::dtos::{
    CrisisActivaDto, EstadoJornadaDto, EstadoPersonajeDto, EventoDetalleDto, MedidorResumenDto,
    ProtagonistaDto, TiempoDto,
};

pub fn get_estado_jornada(game: &GameState) -> EstadoJornadaDto {
    let crisis_activa = game.world.active_crisis.as_ref().map(|crisis| CrisisActivaDto {
        tipo_id: crisis.crisis_tipo_id.clone(),
        fase: crisis.crisis_fase.to_string(),
    });

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
                crate::dtos::MedidorResumenDto {
                    nombre: String::from("influencia"),
                    valor: game.player.meters.influencia_valor,
                    tendencia: game.player.meters.influencia_tendencia,
                    umbral_bajo: game.player.meters.influencia_umbral_bajo,
                    umbral_alto: game.player.meters.influencia_umbral_alto,
                },
                crate::dtos::MedidorResumenDto {
                    nombre: String::from("relacional"),
                    valor: game.player.meters.relacional_valor,
                    tendencia: game.player.meters.relacional_tendencia,
                    umbral_bajo: game.player.meters.relacional_umbral_bajo,
                    umbral_alto: game.player.meters.relacional_umbral_alto,
                },
                crate::dtos::MedidorResumenDto {
                    nombre: String::from("reputacion"),
                    valor: game.player.meters.reputacion_valor,
                    tendencia: game.player.meters.reputacion_tendencia,
                    umbral_bajo: game.player.meters.reputacion_umbral_bajo,
                    umbral_alto: game.player.meters.reputacion_umbral_alto,
                },
                crate::dtos::MedidorResumenDto {
                    nombre: String::from("coherencia"),
                    valor: game.player.meters.coherencia_valor,
                    tendencia: game.player.meters.coherencia_tendencia,
                    umbral_bajo: game.player.meters.coherencia_umbral_bajo,
                    umbral_alto: game.player.meters.coherencia_umbral_alto,
                },
                crate::dtos::MedidorResumenDto {
                    nombre: String::from("recursos"),
                    valor: game.player.meters.recursos_valor,
                    tendencia: game.player.meters.recursos_tendencia,
                    umbral_bajo: game.player.meters.recursos_umbral_bajo,
                    umbral_alto: game.player.meters.recursos_umbral_alto,
                },
                crate::dtos::MedidorResumenDto {
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
        crisis_activa,
        eventos_disponibles: Vec::new(),
        presupuesto_temporal: 0u8,
    }
}

pub fn get_estado_personaje(game: &GameState) -> EstadoPersonajeDto {
    let mut etiquetas_activas = game.memory.etiquetas_activas.iter().cloned().collect::<Vec<_>>();
    etiquetas_activas.sort();

    EstadoPersonajeDto {
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
    }
}
