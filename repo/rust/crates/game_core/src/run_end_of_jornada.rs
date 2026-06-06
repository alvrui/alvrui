use crate::game_state::GameState;
use crate::advance_jornada::advance_jornada;
use crate::close_jornada::close_jornada;
use crate::meter_threshold_checks::collect_triggered_meter_thresholds;

pub fn run_end_of_jornada(game: &mut GameState) -> Vec<String> {
    advance_jornada(&mut game.world);
    close_jornada(&mut game.memory);
    collect_triggered_meter_thresholds(&game.player)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game_state::GameState;

    #[test]
    fn test_run_end_of_jornada_increments_absolute_day() {
        let mut game = GameState::new();
        assert_eq!(game.world.time.jornada_absoluta, 0);
        let _ = run_end_of_jornada(&mut game);
        assert_eq!(game.world.time.jornada_absoluta, 1);
    }

    #[test]
    fn test_run_end_of_jornada_ticks_existing_cooldowns() {
        let mut game = GameState::new();
        game.memory.cooldowns_plantilla.insert("evt_a".to_string(), 2);
        let _ = run_end_of_jornada(&mut game);
        assert_eq!(game.memory.cooldowns_plantilla.get("evt_a"), Some(&1));
    }

    #[test]
    fn test_run_end_of_jornada_returns_triggered_meter_thresholds() {
        let mut game = GameState::new();
        game.player.meters.influencia_valor = 0;
        game.player.meters.influencia_umbral_bajo = 1;
        let triggered = run_end_of_jornada(&mut game);
        assert!(triggered.contains(&"influencia_bajo".to_string()));
    }

    #[test]
    fn test_run_end_of_jornada_leaves_empty_memory_untouched() {
        let mut game = GameState::new();
        let _ = run_end_of_jornada(&mut game);
        assert!(game.memory.historial_eventos.is_empty());
    }
}