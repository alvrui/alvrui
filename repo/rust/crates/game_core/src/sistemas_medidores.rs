use crate::player_state::PlayerMeters;

#[derive(Debug, Clone)]
pub struct Interdependencia {
    pub origen: String,
    pub destino: String,
    pub tipo: String,
    pub factor: f32,
    pub descripcion: String,
}

pub fn aplicar_delta_a_medidor(medidor: &mut u8, delta: i8, umbral_bajo: u8, umbral_alto: u8) -> (u8, i8) {
    let nuevo_valor = (*medidor as i32 + delta as i32).clamp(umbral_bajo as i32, umbral_alto as i32) as u8;
    let nueva_tendencia = *medidor as i8 + delta;
    *medidor = nuevo_valor;
    (*medidor, nueva_tendencia)
}

fn apply_delta_to_meter(meters: &mut PlayerMeters, medidor_id: &str, delta: i8) {
    match medidor_id {
        "influencia" => {
            meters.influencia_valor = meters.influencia_valor.saturating_add_signed(delta);
        }
        "relacional" => {
            meters.relacional_valor = meters.relacional_valor.saturating_add_signed(delta);
        }
        "reputacion" => {
            meters.reputacion_valor = meters.reputacion_valor.saturating_add_signed(delta);
        }
        "coherencia" => {
            meters.coherencia_valor = meters.coherencia_valor.saturating_add_signed(delta);
        }
        "recursos" => {
            meters.recursos_valor = meters.recursos_valor.saturating_add_signed(delta);
        }
        "aguante" => {
            meters.aguante_valor = meters.aguante_valor.saturating_add_signed(delta);
        }
        _ => {}
    }
}

pub fn aplicar_decaimiento_pasivo(meters: &mut PlayerMeters) {
    meters.influencia_valor = meters.influencia_valor.saturating_sub(1);
    meters.relacional_valor = meters.relacional_valor.saturating_sub(1);
    meters.reputacion_valor = meters.reputacion_valor.saturating_sub(1);
    meters.coherencia_valor = meters.coherencia_valor.saturating_sub(1);
    meters.recursos_valor = meters.recursos_valor.saturating_sub(1);
    meters.aguante_valor = meters.aguante_valor.saturating_sub(1);
}

pub fn aplicar_interdependencias(meters: &mut PlayerMeters, interdependencias: &[Interdependencia]) {
    for inter in interdependencias {
        let origen_valor = match inter.origen.as_str() {
            "influencia" => meters.influencia_valor,
            "relacional" => meters.relacional_valor,
            "reputacion" => meters.reputacion_valor,
            "coherencia" => meters.coherencia_valor,
            "recursos" => meters.recursos_valor,
            "aguante" => meters.aguante_valor,
            _ => continue,
        };

        let delta = (origen_valor as f32 * inter.factor) as i8;
        if inter.tipo == "inversa" {
            apply_delta_to_meter(meters, inter.destino.as_str(), -delta);
        } else {
            apply_delta_to_meter(meters, inter.destino.as_str(), delta);
        }
    }
}

pub fn comprobar_umbrales_medidores(meters: &PlayerMeters) -> Vec<String> {
    let mut alertas = Vec::new();

    if meters.influencia_valor < meters.influencia_umbral_bajo {
        alertas.push("med_influencia bajo umbral".to_string());
    }

    if meters.relacional_valor < meters.relacional_umbral_bajo {
        alertas.push("med_relacional bajo umbral".to_string());
    }

    if meters.reputacion_valor < meters.reputacion_umbral_bajo {
        alertas.push("med_reputacion bajo umbral".to_string());
    }

    if meters.coherencia_valor < meters.coherencia_umbral_bajo {
        alertas.push("med_coherencia bajo umbral".to_string());
    }

    if meters.recursos_valor < meters.recursos_umbral_bajo {
        alertas.push("med_recursos bajo umbral".to_string());
    }

    if meters.aguante_valor < meters.aguante_umbral_bajo {
        alertas.push("med_aguante bajo umbral".to_string());
    }

    alertas
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_aplicar_delta_a_medidor_respeta_limites() {
        let mut val = 50;
        let (nuevo, _) = aplicar_delta_a_medidor(&mut val, 60, 0, 100);
        assert_eq!(nuevo, 100);
    }

    #[test]
    fn test_aplicar_delta_a_medidor_no_excede_minimo() {
        let mut val = 30;
        let (nuevo, _) = aplicar_delta_a_medidor(&mut val, -40, 0, 100);
        assert_eq!(nuevo, 0);
    }

    #[test]
    fn test_aplicar_decaimiento_pasivo_reduce_medidores() {
        let mut meters = PlayerMeters {
            influencia_valor: 50,
            influencia_tendencia: -1,
            ..Default::default()
        };
        aplicar_decaimiento_pasivo(&mut meters);
        assert_eq!(meters.influencia_valor, 49);
    }

    #[test]
    fn test_comprobar_umbrales_detecta_bajo() {
        let meters = PlayerMeters {
            influencia_valor: 10,
            influencia_umbral_bajo: 20,
            ..Default::default()
        };
        let alertas = comprobar_umbrales_medidores(&meters);
        assert!(alertas.contains(&String::from("med_influencia bajo umbral")));
    }
}