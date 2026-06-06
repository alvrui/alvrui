// Módulo M4: Generador de Eventos
// Carga YAMLs de configuración y genera eventos para cada jornada.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::fs;

/// Estructura para precondiciones de eventos (mapea YAML)
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Precondicion {
    pub tipo: String,       // Ej: "protagonista", "reputacion", "medidor", "etiqueta"
    pub objetivo: String,   // Ej: "oficio", "fac_consulado", "influencia"
    pub operador: String,   // Ej: "==", ">=", "<=", ">", "<"
    pub valor: serde_json::Value,  // Puede ser int, string, bool, etc.
}

/// Estructura para efectos de opciones (mapea YAML)
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Efecto {
    pub tipo: String,       // Ej: "medidor", "reputacion", "etiqueta", "compromiso"
    pub objetivo: String,   // Ej: "recursos", "fac_liberales", "moroso"
    #[serde(default)]
    pub delta: Option<i8>,  // Para cambios numéricos (medidores, reputación)
    #[serde(default)]
    pub valor: Option<String>,  // Para asignaciones directas (ej: tema_caliente_id)
    #[serde(default)]
    pub accion: Option<String>, // Ej: "cumplir", "incumplir" (para compromisos)
}

/// Estructura para opciones de eventos (mapea YAML)
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Opcion {
    pub id: String,
    pub texto: String,
    pub coste_temporal: u8,
    pub efectos: Vec<Efecto>,
}

/// Estructura para eventos (mapea YAML de config_plantillas_evento)
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PlantillaEvento {
    pub id: String,
    pub familia: String,      // Ej: "sesion_institucional", "encuentro_urbano"
    pub tipo: String,         // Ej: "historico_fijo", "dinamico_protagonista"
    #[serde(default)]
    pub fecha: Option<String>, // Para eventos históricos fijos (ISO 8601)
    #[serde(default)]
    pub fecha_inicio: Option<String>, // Para eventos dinámicos (ISO 8601)
    #[serde(default)]
    pub fecha_fin: Option<String>,    // Para eventos dinámicos (ISO 8601)
    pub texto_base: String,
    #[serde(default)]
    pub precondiciones: Vec<Precondicion>,
    #[serde(default)]
    pub ponderacion: u8,      // 0-100 (default: 50)
    pub opciones: Vec<Opcion>,
}

/// Evento instanciado (lo que devuelve M4 al motor)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evento {
    pub id: String,
    pub familia: String,
    pub texto: String,
    pub opciones: Vec<Opcion>,
    pub coste_temporal: u8,
    pub es_fijo: bool,
    pub ponderacion: u8,
}

/// Generador de eventos (M4)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneradorEventos {
    pub plantillas: Vec<PlantillaEvento>,
    pub facciones: HashMap<String, serde_json::Value>,  // Datos de config_facciones
    pub espacios: HashMap<String, serde_json::Value>,   // Datos de config_espacios
}

impl GeneradorEventos {
    /// Crea un nuevo generador vacío
    pub fn new() -> Self {
        Self {
            plantillas: Vec::new(),
            facciones: HashMap::new(),
            espacios: HashMap::new(),
        }
    }

    /// Carga la configuración desde los YAMLs
    pub fn cargar_configuracion(&mut self, ruta_config: &Path) -> Result<(), Box<dyn std::error::Error>> {
        // Cargar plantillas de eventos
        let eventos_path = ruta_config.join("eventos/eventos_mockup.yaml");
        if eventos_path.exists() {
            let contenido = fs::read_to_string(&eventos_path)?;
            self.plantillas = serde_yaml::from_str(&contenido)?;
        }

        // Cargar facciones (opcional para M4, pero útil para precondiciones)
        let facciones_path = ruta_config.join("facciones/facciones_mockup.yaml");
        if facciones_path.exists() {
            let contenido = fs::read_to_string(&facciones_path)?;
            let facciones: Vec<serde_json::Value> = serde_yaml::from_str(&contenido)?;
            for faccion in facciones {
                if let Some(id) = faccion["id"].as_str() {
                    self.facciones.insert(id.to_string(), faccion);
                }
            }
        }

        // Cargar espacios (opcional para M4)
        let espacios_path = ruta_config.join("espacios/espacios_mockup.yaml");
        if espacios_path.exists() {
            let contenido = fs::read_to_string(&espacios_path)?;
            let espacios: Vec<serde_json::Value> = serde_yaml::from_str(&contenido)?;
            for espacio in espacios {
                if let Some(id) = espacio["id"].as_str() {
                    self.espacios.insert(id.to_string(), espacio);
                }
            }
        }

        Ok(())
    }

    /// Genera eventos para una jornada específica
    pub fn generar_eventos(
        &self,
        fecha_actual: &str,  // Ej: "1805-10-21"
        estado: &crate::game_state::GameState,  // Estado actual del juego
    ) -> Vec<Evento> {
        let mut eventos_disponibles: Vec<Evento> = Vec::new();

        // 1. Añadir eventos históricos fijos para la fecha actual
        for plantilla in &self.plantillas {
            if plantilla.tipo == "historico_fijo" {
                if let Some(fecha) = &plantilla.fecha {
                    if fecha == fecha_actual {
                        eventos_disponibles.push(self.instanciar_evento(plantilla));
                    }
                }
            }
        }

        // 2. Añadir eventos dinámicos que cumplen precondiciones y están en su rango de fechas
        for plantilla in &self.plantillas {
            if plantilla.tipo != "historico_fijo" {
                // Comprobar rango de fechas
                let en_rango_fechas = match (&plantilla.fecha_inicio, &plantilla.fecha_fin) {
                    (Some(inicio), Some(fin)) => fecha_actual >= inicio && fecha_actual <= fin,
                    (Some(inicio), None) => fecha_actual >= inicio,
                    (None, Some(fin)) => fecha_actual <= fin,
                    (None, None) => true,  // Siempre disponible
                };

                if en_rango_fechas && self.cumple_precondiciones(plantilla, estado) {
                    eventos_disponibles.push(self.instanciar_evento(plantilla));
                }
            }
        }

        // 3. Ordenar: fijos primero, luego dinámicos por ponderación (mayor primero)
        eventos_disponibles.sort_by(|a, b| {
            if a.es_fijo && !b.es_fijo {
                std::cmp::Ordering::Less
            } else if !a.es_fijo && b.es_fijo {
                std::cmp::Ordering::Greater
            } else {
                b.ponderacion.cmp(&a.ponderacion)
            }
        });

        eventos_disponibles
    }

    /// Instancia un Evento a partir de una PlantillaEvento
    fn instanciar_evento(&self, plantilla: &PlantillaEvento) -> Evento {
        Evento {
            id: plantilla.id.clone(),
            familia: plantilla.familia.clone(),
            texto: plantilla.texto_base.clone(),  // En el mockup usamos texto fijo
            opciones: plantilla.opciones.clone(),
            coste_temporal: plantilla.opciones.get(0).map_or(0, |op| op.coste_temporal),
            es_fijo: plantilla.tipo == "historico_fijo",
            ponderacion: plantilla.ponderacion,
        }
    }

    /// Comprueba si un evento cumple sus precondiciones
    fn cumple_precondiciones(&self, plantilla: &PlantillaEvento, estado: &crate::game_state::GameState) -> bool {
        for precondicion in &plantilla.precondiciones {
            match precondicion.tipo.as_str() {
                // Precondición sobre el protagonista
                "protagonista" => {
                    let valor_actual = match precondicion.objetivo.as_str() {
                        "origen" => &estado.player.profile.perfil_origen_id,
                        "clase" => &estado.player.profile.perfil_clase_social_id,
                        "oficio" => &estado.player.profile.perfil_oficio_id,
                        "adscripcion_politica" => &estado.player.profile.perfil_adscripcion_id,
                        _ => continue,  // Campo no reconocido
                    };
                    if !self.comparar_valor(valor_actual, &precondicion.operador, &precondicion.valor) {
                        return false;
                    }
                }
                // Precondición sobre reputación con una facción
                "reputacion" => {
                    if let Some(grupo_id) = precondicion.objetivo.strip_prefix("fac_") {
                        let rep_actual = estado.player.reputaciones.iter()
                            .find(|r| r.grupo_id == grupo_id)
                            .map(|r| r.valor)
                            .unwrap_or(0);
                        if !self.comparar_valor(&rep_actual, &precondicion.operador, &precondicion.valor) {
                            return false;
                        }
                    }
                }
                // Precondición sobre un medidor
                "medidor" => {
                    let medidor_id = precondicion.objetivo.as_str();
                    let valor_actual = match medidor_id {
                        "influencia" => estado.player.meters.influencia_valor,
                        "relacional" => estado.player.meters.relacional_valor,
                        "reputacion" => estado.player.meters.reputacion_valor,
                        "coherencia" => estado.player.meters.coherencia_valor,
                        "recursos" => estado.player.meters.recursos_valor,
                        "aguante" => estado.player.meters.aguante_valor,
                        _ => continue,
                    };
                    if !self.comparar_valor(&valor_actual, &precondicion.operador, &precondicion.valor) {
                        return false;
                    }
                }
                // Precondición sobre etiquetas activas
                "etiqueta" => {
                    let etiqueta = precondicion.objetivo.as_str();
                    let tiene_etiqueta = estado.memory.etiquetas_activas.contains(&etiqueta.to_string());
                    if !self.comparar_valor(&tiene_etiqueta, &precondicion.operador, &precondicion.valor) {
                        return false;
                    }
                }
                _ => return false,  // Tipo de precondición no reconocido
            }
        }
        true
    }

    /// Compara un valor con un operador y un valor objetivo
    fn comparar_valor(&self, valor_actual: &impl std::fmt::Debug, operador: &str, valor_objetivo: &serde_json::Value) -> bool {
        match operador {
            "==" => {
                if let Some(val) = valor_objetivo.as_u64() {
                    format!("{:?}", valor_actual) == val.to_string()
                } else if let Some(val) = valor_objetivo.as_str() {
                    format!("{:?}", valor_actual) == val
                } else if let Some(val) = valor_objetivo.as_bool() {
                    format!("{:?}", valor_actual).parse::<bool>().unwrap_or(false) == val
                } else {
                    false
                }
            }
            ">=" => {
                if let Some(val) = valor_objetivo.as_u64() {
                    if let Some(v) = self.any_as_u8(valor_actual) {
                        v >= val as u8
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            "<=" => {
                if let Some(val) = valor_objetivo.as_u64() {
                    if let Some(v) = self.any_as_u8(valor_actual) {
                        v <= val as u8
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            ">" => {
                if let Some(val) = valor_objetivo.as_u64() {
                    if let Some(v) = self.any_as_u8(valor_actual) {
                        v > val as u8
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            "<" => {
                if let Some(val) = valor_objetivo.as_u64() {
                    if let Some(v) = self.any_as_u8(valor_actual) {
                        v < val as u8
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            _ => false,
        }
    }

    fn any_as_u8(&self, valor: &impl std::fmt::Debug) -> Option<u8> {
        format!("{:?}", valor).parse::<u8>().ok()
    }
}
