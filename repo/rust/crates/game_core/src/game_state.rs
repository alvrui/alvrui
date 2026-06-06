use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Default)]
pub struct GameState {
    pub world: WorldState,
    pub player: PlayerState,
    pub memory: MemoryState,
}

#[derive(Debug, Default)]
pub struct WorldState {
    pub time: crate::world_state::TimeState,
    pub facciones: HashMap<String, crate::m1_world_state::FaccionEstado>,
    pub espacios: HashMap<String, crate::m1_world_state::EspacioEstado>,
    pub generador_eventos: crate::m4_generador_eventos::GeneradorEventos,
}

#[derive(Debug, Default)]
pub struct PlayerState {
    pub profile: crate::player_state::Profile,
    pub medidores: crate::player_state::PlayerMedidores,
}

#[derive(Debug, Default)]
pub struct MemoryState {
    pub cooldowns: HashMap<String, crate::m4_generador_eventos::Cooldown>,
}

impl GameState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn cargar_configuracion_mockup(&mut self, ruta_config: &Path) -> Result<(), Box<dyn std::error::Error>> {
        let contenido = std::fs::read_to_string(ruta_config)?;
        let config: serde_yaml::Value = serde_yaml::from_str(&contenido)?;

        if let Some(tiempo) = config.get("config_tiempo").and_then(|v| v.as_mapping()) {
            if let Some(tiempo_inicial) = tiempo.get("tiempo_inicial").and_then(|v| v.as_mapping()) {
                self.world.time.tramo_id = tiempo_inicial.get("tramo_id").and_then(|v| v.as_str()).unwrap_or("1805a").to_string();
                self.world.time.acto_narrativo = tiempo_inicial.get("acto").and_then(|v| v.as_u64()).map(|n| n as u32).unwrap_or(0);
                self.world.time.jornada_absoluta = tiempo_inicial.get("jornada").and_then(|v| v.as_u64()).map(|n| n as u32).unwrap_or(0);
            }
        }

        if let Some(facciones) = config.get("config_facciones") {
            let facciones_vec: Vec<crate::m1_world_state::FaccionEstado> = serde_yaml::from_value(facciones.clone())?;
            self.world.facciones = facciones_vec.into_iter().map(|f| (f.fac_id.clone(), f)).collect();
        }

        if let Some(espacios) = config.get("config_espacios") {
            let espacios_vec: Vec<crate::m1_world_state::EspacioEstado> = serde_yaml::from_value(espacios.clone())?;
            self.world.espacios = espacios_vec.into_iter().map(|e| (e.esp_id.clone(), e)).collect();
        }

        if let Some(eventos) = config.get("config_plantillas_evento") {
            self.world.generador_eventos.plantillas = serde_yaml::from_value(eventos.clone())?;
        }

        if let Some(cooldowns) = config.get("config_cooldowns") {
            self.memory.cooldowns = serde_yaml::from_value(cooldowns.clone())?;
        }

        if let Some(medidores) = config.get("config_medidores").and_then(|v| v.as_mapping()) {
            for (medidor_nombre, medidor_data) in medidores {
                if let Some(medidor_map) = medidor_data.as_mapping() {
                    let valor = medidor_map.get("valor").and_then(|v| v.as_u64()).map(|n| n as i32).unwrap_or(50);
                    let tendencia = medidor_map.get("tendencia").and_then(|v| v.as_i64()).unwrap_or(0);
                    let umbral_bajo = medidor_map.get("umbral_bajo").and_then(|v| v.as_u64()).map(|n| n as i32).unwrap_or(25);
                    let umbral_alto = medidor_map.get("umbral_alto").and_then(|v| v.as_u64()).map(|n| n as i32).unwrap_or(75);

                    match medidor_nombre.as_str().unwrap_or("") {
                        "influencia" => {
                            self.player.medidores.influencia.valor = valor;
                            self.player.medidores.influencia.tendencia = tendencia;
                            self.player.medidores.influencia.umbral_bajo = umbral_bajo;
                            self.player.medidores.influencia.umbral_alto = umbral_alto;
                        },
                        "relacional" => {
                            self.player.medidores.relacional.valor = valor;
                            self.player.medidores.relacional.tendencia = tendencia;
                            self.player.medidores.relacional.umbral_bajo = umbral_bajo;
                            self.player.medidores.relacional.umbral_alto = umbral_alto;
                        },
                        "reputacion" => {
                            self.player.medidores.reputacion.valor = valor;
                            self.player.medidores.reputacion.tendencia = tendencia;
                            self.player.medidores.reputacion.umbral_bajo = umbral_bajo;
                            self.player.medidores.reputacion.umbral_alto = umbral_alto;
                        },
                        "coherencia" => {
                            self.player.medidores.coherencia.valor = valor;
                            self.player.medidores.coherencia.tendencia = tendencia;
                            self.player.medidores.coherencia.umbral_bajo = umbral_bajo;
                            self.player.medidores.coherencia.umbral_alto = umbral_alto;
                        },
                        "recursos" => {
                            self.player.medidores.recursos.valor = valor;
                            self.player.medidores.recursos.tendencia = tendencia;
                            self.player.medidores.recursos.umbral_bajo = umbral_bajo;
                            self.player.medidores.recursos.umbral_alto = umbral_alto;
                        },
                        "aguante" => {
                            self.player.medidores.aguante.valor = valor;
                            self.player.medidores.aguante.tendencia = tendencia;
                            self.player.medidores.aguante.umbral_bajo = umbral_bajo;
                            self.player.medidores.aguante.umbral_alto = umbral_alto;
                        },
                        _ => {}
                    }
                }
            }
        }

        self.player.profile.perfil_origen_id = "gaditano".to_string();
        self.player.profile.perfil_clase_social_id = "burguesia".to_string();
        self.player.profile.perfil_oficio_id = "comerciante".to_string();
        self.player.profile.perfil_adscripcion_politica_id = "consulado".to_string();

        Ok(())
    }
}
