use crate::game_state::GameState;
use crate::generador_eventos::{EventTemplate, generar_eventos_jornada};
use crate::meter_delta_applier::aplicar_delta;
use crate::cooldown_tick::tick_cooldowns;
use crate::close_jornada::cerrar_jornada;

pub fn ejecutar_bucle_jornada(game: &mut GameState, plantillas: &[EventTemplate]) -> Result<(), String> {
    avanzar_tiempo(game);
    comprobar_pivotes(game);
    let eventos = generar_eventos_jornada(game, plantillas)?;
    game.world.eventos_disponibles = eventos;
    aplicar_decaimientos(game);
    let _alertas = comprobar_umbrales(game);
    tick_cooldowns(game);
    cerrar_jornada(game);
    Ok(())
}

pub fn avanzar_tiempo(game: &mut GameState) {
    game.world.time.jornada_absoluta += 1;
    game.world.time.acto_narrativo = (game.world.time.jornada_absoluta / 10) as u32;
}

pub fn comprobar_pivotes(game: &mut GameState) {
    if game.world.time.jornada_absoluta == 20 {
        game.world.time.acto_narrativo = 2;
    }
    if game.world.time.jornada_absoluta == 40 {
        game.world.time.acto_narrativo = 3;
    }
}

pub fn aplicar_decaimientos(game: &mut GameState) {
    game.player.meters.influencia_valor = game.player.meters.influencia_valor.saturating_sub(1);
    game.player.meters.relacional_valor = game.player.meters.relacional_valor.saturating_sub(1);
    game.player.meters.reputacion_valor = game.player.meters.reputacion_valor.saturating_sub(1);
    game.player.meters.coherencia_valor = game.player.meters.coherencia_valor.saturating_sub(1);
    game.player.meters.recursos_valor = game.player.meters.recursos_valor.saturating_sub(1);
    game.player.meters.aguante_valor = game.player.meters.aguante_valor.saturating_sub(1);
}

pub fn comprobar_umbrales(game: &mut GameState) -> Vec<String> {
    let mut alertas = Vec::new();

    if game.player.meters.influencia_valor < game.player.meters.influencia_umbral_bajo {
        alertas.push("med_influencia bajo umbral".to_string());
    }
    if game.player.meters.relacional_valor < game.player.meters.relacional_umbral_bajo {
        alertas.push("med_relacional bajo umbral".to_string());
    }
    if game.player.meters.reputacion_valor < game.player.meters.reputacion_umbral_bajo {
        alertas.push("med_reputacion bajo umbral".to_string());
    }
    if game.player.meters.coherencia_valor < game.player.meters.coherencia_umbral_bajo {
        alertas.push("med_coherencia bajo umbral".to_string());
    }
    if game.player.meters.recursos_valor < game.player.meters.recursos_umbral_bajo {
        alertas.push("med_recursos bajo umbral".to_string());
    }
    if game.player.meters.aguante_valor < game.player.meters.aguante_umbral_bajo {
        alertas.push("med_aguante bajo umbral".to_string());
    }

    alertas
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game_state::GameState;
    use crate::generador_eventos::EventTemplate;
    use crate::player_state::{PlayerState, PlayerMeters};

    #[test]
    fn test_ejecutar_bucle_jornada_incrementa_jornada() {
        let mut game = GameState::new();
        let plantillas = vec![];
        ejecutar_bucle_jornada(&mut game, &plantillas).unwrap();
        assert_eq!(game.world.time.jornada_absoluta, 1);
    }

    #[test]
    fn test_avanzar_tiempo_incrementa_jornada() {
        let mut game = GameState::new();
        avanzar_tiempo(&mut game);
        assert_eq!(game.world.time.jornada_absoluta, 1);
    }

    #[test]
    fn test_comprobar_umbrales_detecta_medidor_bajo() {
        let mut game = GameState {
            player: PlayerState {
                meters: PlayerMeters {
                    influencia_valor: 10,
                    influencia_umbral_bajo: 20,
                    ..Default::default()
                },
                ..Default::default()
            },
            ..Default::default()
        };
        let alertas = comprobar_umbrales(&mut game);
        assert!(alertas.contains(&String::from("med_influencia bajo umbral")));
    }
}