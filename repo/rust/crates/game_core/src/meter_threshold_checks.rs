use crate::player_state::PlayerState;

pub fn collect_triggered_meter_thresholds(player: &PlayerState) -> Vec<String> {
    let mut triggered = Vec::new();

    check_meter_threshold(
        &mut triggered,
        player.meters.influencia_valor,
        player.meters.influencia_umbral_bajo,
        player.meters.influencia_umbral_alto,
        "influencia",
    );

    check_meter_threshold(
        &mut triggered,
        player.meters.relacional_valor,
        player.meters.relacional_umbral_bajo,
        player.meters.relacional_umbral_alto,
        "relacional",
    );

    check_meter_threshold(
        &mut triggered,
        player.meters.reputacion_valor,
        player.meters.reputacion_umbral_bajo,
        player.meters.reputacion_umbral_alto,
        "reputacion",
    );

    check_meter_threshold(
        &mut triggered,
        player.meters.coherencia_valor,
        player.meters.coherencia_umbral_bajo,
        player.meters.coherencia_umbral_alto,
        "coherencia",
    );

    check_meter_threshold(
        &mut triggered,
        player.meters.recursos_valor,
        player.meters.recursos_umbral_bajo,
        player.meters.recursos_umbral_alto,
        "recursos",
    );

    check_meter_threshold(
        &mut triggered,
        player.meters.aguante_valor,
        player.meters.aguante_umbral_bajo,
        player.meters.aguante_umbral_alto,
        "aguante",
    );

    triggered
}

fn check_meter_threshold(
    triggered: &mut Vec<String>,
    current_value: i32,
    low_threshold: i32,
    high_threshold: i32,
    meter_name: &str,
) {
    if current_value <= low_threshold {
        triggered.push(format!("{}_bajo", meter_name));
    }

    if current_value >= high_threshold {
        triggered.push(format!("{}_alto", meter_name));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::player_state::PlayerState;

    #[test]
    fn test_collect_triggered_meter_thresholds_returns_empty_when_no_meter_crosses_thresholds() {
        let mut player = PlayerState::new();
        player.meters.influencia_valor = 10;
        player.meters.influencia_umbral_bajo = 5;
        player.meters.influencia_umbral_alto = 90;
        let triggered = collect_triggered_meter_thresholds(&player);
        assert!(triggered.is_empty());
    }

    #[test]
    fn test_collect_triggered_meter_thresholds_detects_low_threshold() {
        let mut player = PlayerState::new();
        player.meters.influencia_valor = 5;
        player.meters.influencia_umbral_bajo = 5;
        let triggered = collect_triggered_meter_thresholds(&player);
        assert!(triggered.contains(&"influencia_bajo".to_string()));
    }

    #[test]
    fn test_collect_triggered_meter_thresholds_detects_high_threshold() {
        let mut player = PlayerState::new();
        player.meters.aguante_valor = 80;
        player.meters.aguante_umbral_alto = 80;
        let triggered = collect_triggered_meter_thresholds(&player);
        assert!(triggered.contains(&"aguante_alto".to_string()));
    }

    #[test]
    fn test_collect_triggered_meter_thresholds_detects_multiple_thresholds() {
        let mut player = PlayerState::new();
        player.meters.recursos_valor = 2;
        player.meters.recursos_umbral_bajo = 3;
        player.meters.coherencia_valor = 95;
        player.meters.coherencia_umbral_alto = 90;
        let triggered = collect_triggered_meter_thresholds(&player);
        assert!(triggered.contains(&"recursos_bajo".to_string()));
        assert!(triggered.contains(&"coherencia_alto".to_string()));
    }
}