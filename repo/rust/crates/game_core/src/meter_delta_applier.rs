use crate::player_state::{GroupReputation, PlayerState};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MeterDelta {
    pub target: String,
    pub delta: i32,
}

pub fn apply_deltas(player: &mut PlayerState, deltas: &[MeterDelta]) {
    for delta in deltas {
        if let Some(meter_name) = delta
            .target
            .strip_prefix("med_")
            .and_then(|s| s.strip_suffix("_valor"))
        {
            apply_core_meter_delta(player, meter_name, delta.delta);
            continue;
        }

        if let Some(group_id) = delta
            .target
            .strip_prefix("rep_")
            .and_then(|s| s.strip_suffix("_valor"))
        {
            apply_reputation_delta(player, group_id, delta.delta);
        }
    }
}

fn apply_core_meter_delta(player: &mut PlayerState, meter_name: &str, delta: i32) {
    let (value_ref, tendency_ref): (&mut u8, &mut i8) = match meter_name {
        "influencia" => (
            &mut player.meters.influencia_valor,
            &mut player.meters.influencia_tendencia,
        ),
        "relacional" => (
            &mut player.meters.relacional_valor,
            &mut player.meters.relacional_tendencia,
        ),
        "reputacion" => (
            &mut player.meters.reputacion_valor,
            &mut player.meters.reputacion_tendencia,
        ),
        "coherencia" => (
            &mut player.meters.coherencia_valor,
            &mut player.meters.coherencia_tendencia,
        ),
        "recursos" => (
            &mut player.meters.recursos_valor,
            &mut player.meters.recursos_tendencia,
        ),
        "aguante" => (
            &mut player.meters.aguante_valor,
            &mut player.meters.aguante_tendencia,
        ),
        _ => return,
    };

    let old_value = *value_ref as i32;
    let new_value = (old_value + delta).clamp(0, 100);
    let effective_delta = new_value - old_value;

    *value_ref = new_value as u8;
    *tendency_ref += effective_delta as i8;
}

fn apply_reputation_delta(player: &mut PlayerState, group_id: &str, delta: i32) {
    if let Some(rep) = player
        .reputaciones
        .iter_mut()
        .find(|rep| rep.grupo_id == group_id)
    {
        let old_value = rep.valor as i32;
        let new_value = (old_value + delta).clamp(0, 100);
        let effective_delta = new_value - old_value;

        rep.valor = new_value as u8;
        rep.tendencia += effective_delta as i8;
        return;
    }

    let old_value = 0i32;
    let new_value = (old_value + delta).clamp(0, 100);
    let effective_delta = new_value - old_value;

    player.reputaciones.push(GroupReputation {
        grupo_id: group_id.to_string(),
        valor: new_value as u8,
        tendencia: effective_delta as i8,
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::player_state::PlayerState;

    #[test]
    fn test_apply_delta_to_core_meter_value() {
        let mut player = PlayerState::new();
        let deltas = vec![MeterDelta {
            target: "med_influencia_valor".to_string(),
            delta: 12,
        }];
        apply_deltas(&mut player, &deltas);
        assert_eq!(player.meters.influencia_valor, 12);
        assert_eq!(player.meters.influencia_tendencia, 12);
    }

    #[test]
    fn test_apply_delta_accumulates_core_meter_tendency() {
        let mut player = PlayerState::new();
        player.meters.influencia_tendencia = 3;
        let deltas = vec![MeterDelta {
            target: "med_influencia_valor".to_string(),
            delta: 4,
        }];
        apply_deltas(&mut player, &deltas);
        assert_eq!(player.meters.influencia_tendencia, 7);
    }

    #[test]
    fn test_apply_delta_clamps_core_meter_at_hundred_and_uses_effective_delta() {
        let mut player = PlayerState::new();
        player.meters.aguante_valor = 95;
        player.meters.aguante_tendencia = 1;
        let deltas = vec![MeterDelta {
            target: "med_aguante_valor".to_string(),
            delta: 10,
        }];
        apply_deltas(&mut player, &deltas);
        assert_eq!(player.meters.aguante_valor, 100);
        assert_eq!(player.meters.aguante_tendencia, 6);
    }

    #[test]
    fn test_apply_delta_to_group_reputation() {
        let mut player = PlayerState::new();
        player.reputaciones.push(GroupReputation {
            grupo_id: "prensa".to_string(),
            valor: 40,
            tendencia: 0,
        });
        let deltas = vec![MeterDelta {
            target: "rep_prensa_valor".to_string(),
            delta: 15,
        }];
        apply_deltas(&mut player, &deltas);
        assert_eq!(player.reputaciones[0].valor, 55);
        assert_eq!(player.reputaciones[0].tendencia, 15);
    }

    #[test]
    fn test_apply_delta_creates_group_reputation_with_effective_delta() {
        let mut player = PlayerState::new();
        let deltas = vec![MeterDelta {
            target: "rep_prensa_valor".to_string(),
            delta: -10,
        }];
        apply_deltas(&mut player, &deltas);
        assert_eq!(player.reputaciones[0].valor, 0);
        assert_eq!(player.reputaciones[0].tendencia, 0);
    }
}
