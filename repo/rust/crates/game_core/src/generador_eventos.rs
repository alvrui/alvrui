use crate::{world_state::WorldState, player_state::PlayerState, memory_state::MemoryState};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cmp::Ordering;

// --- Estructuras de datos alineadas con la arquitectura M4 ---

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct Precondiciones {
    pub mundo: Vec<(String, String, String)>,      // (variable, operador, valor)
    pub jugador: Vec<(String, String, String)>,    // (variable, operador, valor)
    pub etiquetas_unlock: Vec<String>,             // Etiquetas booleanas de M6
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct Consecuencia {
    pub target: String,             // Ej: "med_influencia", "rep_liberales", "etiqueta_conoce_a_X"
    pub delta: i32,                 // Valor numérico (puede ser negativo)
    pub diferida_jornadas: u8,      // 0 = inmediata
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct Opcion {
    pub id: String,
    pub texto_id: String,           // Referencia a texto en Nivel 2
    pub consecuencias: Vec<Consecuencia>,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct ModificadoresPeso {
    pub por_perfil_oficio: HashMap<String, f64>,
    pub por_acto: HashMap<u32, f64>,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct EventTemplate {
    pub id: String,
    pub familia: String,             // A, B, C, D, E, F, S1, S2, S3, S4, S5
    pub funcion_principal: String,  // presion, informacion, deuda, tentacion, castigo, recompensa, color, preludio, remate
    pub peso_base: f64,
    pub precondiciones: Precondiciones,
    pub npc_pool: Vec<String>,
    pub opciones: Vec<Opcion>,
    pub modificadores_peso: ModificadoresPeso,
    pub cooldown_jornadas: u8,
    pub compatible_con_crisis: bool,
}

#[derive(Debug, Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct EventInstance {
    pub id: String,
    pub familia: String,
    pub npc_id: String,
    pub espacio_id: String,
    pub opciones_visibles: Vec<Opcion>,
    pub consecuencias: Vec<Consecuencia>,
}

// --- Funciones auxiliares ---

/// Compara dos valores (numéricos o strings) según un operador
fn comparar_valores(actual: &str, op: &str, expected: &str) -> bool {
    let actual_num = actual.parse::<i32>().ok();
    let expected_num = expected.parse::<i32>().ok();

    match (actual_num, expected_num) {
        (Some(a), Some(e)) => match op {
            "==" => a == e,
            "!=" => a != e,
            ">" => a > e,
            ">=" => a >= e,
            "<" => a < e,
            "<=" => a <= e,
            _ => false,
        },
        _ => actual == expected,
    }
}

/// Evalúa una precondición de mundo (Bloque A)
fn evaluar_precondicion_mundo(world: &WorldState, cond: &(String, String, String)) -> bool {
    let (var, op, val) = cond;
    match var.as_str() {
        "acto_narrativo" => {
            let world_val = world.time.acto_narrativo.to_string();
            comparar_valores(&world_val, op, val)
        }
        "estado_global" => {
            let world_val = format!("{:?}", world.political_climate.estado_global);
            comparar_valores(&world_val, op, val)
        }
        "polarizacion" => {
            let world_val = world.political_climate.polarizacion.to_string();
            comparar_valores(&world_val, op, val)
        }
        "tema_caliente_id" => {
            let world_val = &world.political_climate.tema_caliente_id;
            comparar_valores(world_val, op, val)
        }
        "distancia_pivote_proximo" => {
            let world_val = world.time.distancia_pivote_proximo.to_string();
            comparar_valores(&world_val, op, val)
        }
        _ => false,
    }
}

/// Evalúa una precondición de jugador (Bloque B)
fn evaluar_precondicion_jugador(player: &PlayerState, cond: &(String, String, String)) -> bool {
    let (var, op, val) = cond;
    match var.as_str() {
        // Medidores
        "med_influencia" => {
            let player_val = player.meters.influencia_valor.to_string();
            comparar_valores(&player_val, op, val)
        }
        "med_relacional" => {
            let player_val = player.meters.relacional_valor.to_string();
            comparar_valores(&player_val, op, val)
        }
        "med_reputacion" => {
            let player_val = player.meters.reputacion_valor.to_string();
            comparar_valores(&player_val, op, val)
        }
        "med_coherencia" => {
            let player_val = player.meters.coherencia_valor.to_string();
            comparar_valores(&player_val, op, val)
        }
        "med_recursos" => {
            let player_val = player.meters.recursos_valor.to_string();
            comparar_valores(&player_val, op, val)
        }
        "med_aguante" => {
            let player_val = player.meters.aguante_valor.to_string();
            comparar_valores(&player_val, op, val)
        }
        // Perfil
        "perfil_oficio_id" => {
            let player_val = &player.profile.perfil_oficio_id;
            comparar_valores(player_val, op, val)
        }
        "perfil_clase_social_id" => {
            let player_val = &player.profile.perfil_clase_social_id;
            comparar_valores(player_val, op, val)
        }
        // Relaciones
        "deuda" => {
            let max_deuda = player.relaciones.iter()
                .map(|r| r.deuda)
                .max()
                .unwrap_or(0);
            comparar_valores(&max_deuda.to_string(), op, val)
        }
        "relacion_con_npc" => {
            // Ejemplo: ("relacion_con_npc", "==", "arguelles")
            let npc_id = val;
            let tiene_relacion = player.relaciones.iter()
                .any(|r| &r.npc_id == npc_id);
            match op.as_str() {
                "==" => tiene_relacion,
                "!=" => !tiene_relacion,
                _ => false,
            }
        }
        _ => false,
    }
}

// --- Funciones principales de M4 ---

/// Filtra plantillas de eventos que cumplen las precondiciones (Paso 1)
pub fn filtrar_eventos<'a>(
    templates: &'a [EventTemplate],
    world: &'a WorldState,
    player: &'a PlayerState,
    memory: &'a MemoryState,
) -> Vec<&'a EventTemplate> {
    templates
        .iter()
        .filter(|t| {
            // Precondiciones de mundo (Bloque A)
            let mundo_ok = t.precondiciones.mundo.iter()
                .all(|cond| evaluar_precondicion_mundo(world, cond));
            
            // Precondiciones de jugador (Bloque B)
            let jugador_ok = t.precondiciones.jugador.iter()
                .all(|cond| evaluar_precondicion_jugador(player, cond));
            
            // Etiquetas de desbloqueo (Bloque C)
            let etiquetas_ok = t.precondiciones.etiquetas_unlock.iter()
                .all(|tag| memory.etiquetas_activas.contains(tag));
            
            // Cooldowns (Bloque C)
            let no_cooldown = !memory.cooldowns_plantilla.contains_key(&t.id);
            
            mundo_ok && jugador_ok && etiquetas_ok && no_cooldown
        })
        .collect()
}

/// Aplica ponderación a los eventos candidatos (Paso 2)
pub fn ponderar_eventos<'a>(
    candidatos: Vec<&'a EventTemplate>,
    world: &'a WorldState,
    player: &'a PlayerState,
    memory: &'a MemoryState,
) -> Vec<(f64, &'a EventTemplate)> {
    candidatos.into_iter().map(|template| {
        let mut peso = template.peso_base;
        
        // 1. Modificador por acto narrativo
        if let Some(mod_acto) = template.modificadores_peso.por_acto.get(&world.time.acto_narrativo) {
            peso *= mod_acto;
        }
        
        // 2. Modificador por perfil oficio
        if let Some(mod_oficio) = template.modificadores_peso.por_perfil_oficio.get(&player.profile.perfil_oficio_id) {
            peso *= mod_oficio;
        }
        
        // 3. Modificador por compromisos pendientes (Serie 4)
        let tiene_compromisos_urgentes = player.compromisos.iter()
            .any(|c| c.comp_jornada_vencimiento - world.time.jornada_absoluta <= 2);
        if tiene_compromisos_urgentes {
            peso *= 3.0;
        }
        
        // 4. Modificador por espacios descuidados
        // (Ejemplo: +1.5 si el espacio del evento no ha sido visitado en N jornadas)
        // Simplificado: aplicamos +1.5 si el espacio no está disponible hoy (no visitado recientemente)
        let espacio_descuidado = template.npc_pool.iter()
            .all(|npc_id| {
                player.relaciones.iter()
                    .find(|r| &r.npc_id == npc_id)
                    .map_or(true, |r| r.jornadas_sin_contacto > 5)
            });
        if espacio_descuidado {
            peso *= 1.5;
        }
        
        // 5. Modificador por distancia a pivote
        if world.time.distancia_pivote_proximo < 3 {
            peso *= 0.8; // Reducir peso cerca de pivotes
        }
        
        // 6. Factor de equilibrio de drama
        let ratio_negativos = memory.ratio_eventos_negativos;
        if ratio_negativos > 0.6 {
            peso *= 0.5; // Reducir peso de eventos negativos
        }
        
        (peso, template)
    }).collect()
}

/// Instancia un evento seleccionado (Paso 3)
pub fn instanciar_evento(
    plantilla: &EventTemplate,
    world: &WorldState,
    player: &PlayerState,
) -> EventInstance {
    // 1. Seleccionar NPC: priorizar por deuda o agenda activa
    let npc_id = player.relaciones.iter()
        .filter(|r| plantilla.npc_pool.contains(&r.npc_id))
        .max_by(|a, b| {
            // Prioridad: agenda_activa > deuda
            match (a.agenda_activa, b.agenda_activa) {
                (true, false) => Ordering::Greater,
                (false, true) => Ordering::Less,
                _ => a.deuda.cmp(&b.deuda),
            }
        })
        .map(|r| r.npc_id.clone())
        .or_else(|| plantilla.npc_pool.first().cloned())
        .unwrap_or_default();
    
    // 2. Seleccionar espacio: primero disponible y con NPC presente
    let espacio_id = world.spaces.iter()
        .find(|e| {
            e.esp_disponible && e.esp_npcs_presentes.contains(&npc_id)
        })
        .map(|e| e.esp_id.clone())
        .or_else(|| world.spaces.first().map(|e| e.esp_id.clone()))
        .unwrap_or_default();
    
    // 3. Filtrar opciones visibles según visibilidad del jugador
    let opciones_visibles: Vec<Opcion> = plantilla.opciones.iter()
        .filter(|_opcion| {
            // Simplificado: todas las opciones son visibles por defecto
            // En una implementación completa, se filtrarían por precondiciones de opción
            true
        })
        .cloned()
        .collect();
    
    EventInstance {
        id: plantilla.id.clone(),
        familia: plantilla.familia.clone(),
        npc_id,
        espacio_id,
        opciones_visibles,
        consecuencias: Vec::new(), // Se aplicarán al resolver el evento
    }
}

/// Genera eventos para una jornada (orquestador completo)
pub fn generar_eventos_jornada(
    world: &WorldState,
    player: &PlayerState,
    memory: &MemoryState,
    plantillas: &[EventTemplate],
    ranuras: usize,
) -> Vec<EventInstance> {
    // 1. Filtrar candidatos
    let candidatos = filtrar_eventos(plantillas, world, player, memory);
    
    // 2. Ponderar
    let mut ponderados = ponderar_eventos(candidatos, world, player, memory);
    
    // 3. Ordenar por peso descendente
    ponderados.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(Ordering::Equal));
    
    // 4. Instanciar los top N eventos
    ponderados.into_iter()
        .take(ranuras)
        .map(|(_, template)| {
            let evento = instanciar_evento(template, world, player);
            
            // 5. Registrar en memoria (M6)
            // (En una implementación completa, esto se haría fuera de esta función)
            
            evento
        })
        .collect()
}

// --- Tests ---
#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        world_state::{TimeState, PoliticalClimate, SpaceState, FactionState},
        player_state::{Profile, PositionVisibility, PlayerMeters, GroupReputation, NpcRelation, Commitment, PersonalState},
        memory_state::MemoryState,
    };

    fn create_test_world() -> WorldState {
        WorldState {
            time: TimeState {
                tiempo_tramo: String::from("1812a"),
                acto_narrativo: 2,
                jornada_absoluta: 10,
                distancia_pivote_proximo: 5,
                distancia_pivote_anterior: 2,
            },
            political_climate: PoliticalClimate {
                estado_global: crate::world_state::GlobalPoliticalState::Precrisis,
                polarizacion: 3,
                visibilidad_tablero: 4,
                tema_caliente_id: String::from("constitucion"),
            },
            factions: vec![FactionState {
                fac_id: String::from("liberales"),
                fac_fuerza: 4,
                ..Default::default()
            }],
            spaces: vec![SpaceState {
                esp_id: String::from("oratorio_san_felipe_neri"),
                esp_disponible: true,
                esp_nivel_riesgo: 2,
                esp_clima: String::from("nervioso"),
                esp_npcs_presentes: vec![String::from("arguelles")],
                esp_coste_temporal: 2,
                esp_tipo_interaccion_primaria: String::from("debate_formal"),
            }],
            active_crisis: None,
            eventos_disponibles: Vec::new(),
        }
    }

    fn create_test_player() -> PlayerState {
        PlayerState {
            profile: Profile {
                perfil_clase_social_id: String::from("hidalguia_letrada"),
                perfil_origen_id: String::from("gaditano"),
                perfil_adscripcion_id: String::from("liberal_progresista"),
                perfil_oficio_id: String::from("jurista"),
                perfil_temperamento_id: String::from("principista"),
                perfil_compromiso_inicial_id: String::from("ambicion_declarada"),
            },
            position_visibility: PositionVisibility {
                posicion_formal_id: String::from("diputado_pleno"),
                visibilidad_publica: crate::player_state::PublicVisibility::FiguraReconocible,
                trayectoria_moral: crate::player_state::MoralTrajectory::Coherente,
            },
            meters: PlayerMeters {
                influencia_valor: 60,
                influencia_tendencia: 0,
                influencia_umbral_bajo: 20,
                influencia_umbral_alto: 80,
                relacional_valor: 70,
                relacional_tendencia: 0,
                relacional_umbral_bajo: 25,
                relacional_umbral_alto: 85,
                reputacion_valor: 50,
                reputacion_tendencia: 0,
                reputacion_umbral_bajo: 20,
                reputacion_umbral_alto: 80,
                coherencia_valor: 80,
                coherencia_tendencia: 0,
                coherencia_umbral_bajo: 30,
                coherencia_umbral_alto: 90,
                recursos_valor: 40,
                recursos_tendencia: 0,
                recursos_umbral_bajo: 15,
                recursos_umbral_alto: 70,
                aguante_valor: 50,
                aguante_tendencia: 0,
                aguante_umbral_bajo: 20,
                aguante_umbral_alto: 80,
            },
            reputaciones: vec![GroupReputation {
                grupo_id: String::from("liberales"),
                valor: 80,
                tendencia: 0,
            }],
            relaciones: vec![NpcRelation {
                npc_id: String::from("arguelles"),
                intensidad: crate::player_state::RelationIntensity::Aliado,
                rel_tipo_vinculo_id: String::from("complicidad_ideologica"),
                confianza: 5,
                deuda: 2,
                exposicion: crate::player_state::RelationExposure::Publica,
                estado_emocional: crate::player_state::EmotionalState::Agradecida,
                jornadas_sin_contacto: 0,
                agenda_activa: true,
            }],
            compromisos: vec![Commitment {
                comp_id: String::from("comp_1"),
                comp_emisor_id: String::from("jugador"),
                comp_receptor_id: String::from("arguelles"),
                comp_naturaleza_id: String::from("voto"),
                comp_visibilidad: crate::player_state::CommitmentVisibility::Publico,
                comp_jornada_creacion: 5,
                comp_jornada_vencimiento: 12, // Vence en 2 jornadas (12 - 10 = 2)
                comp_gravedad: 3,
                comp_presion_activa: false,
                comp_renegociable: true,
            }],
            personal_state: PersonalState {
                personal_dependiente_en_riesgo: false,
                personal_presion_economica: 0,
                personal_fatiga_acumulada: 0,
                personal_contradiccion_dominante_id: String::new(),
            },
        }
    }

    fn create_test_memory() -> MemoryState {
        MemoryState {
            historial_eventos: Vec::new(),
            cooldowns_plantilla: std::collections::HashMap::new(),
            cooldowns_npc: std::collections::HashMap::new(),
            cooldowns_espacio: std::collections::HashMap::new(),
            etiquetas_activas: std::collections::HashSet::new(),
            ratio_eventos_negativos: 0.5,
            intensidad_dramatica_acumulada: 0,
            ultimo_evento_por_familia: std::collections::HashMap::new(),
            ultimo_evento_por_espacio: std::collections::HashMap::new(),
            ultimo_evento_por_faccion: std::collections::HashMap::new(),
            ultimo_evento_por_npc: std::collections::HashMap::new(),
        }
    }

    fn create_test_template() -> EventTemplate {
        EventTemplate {
            id: String::from("debate_constitucion"),
            familia: String::from("A"),
            funcion_principal: String::from("presion"),
            peso_base: 10.0,
            precondiciones: Precondiciones {
                mundo: vec![(
                    String::from("acto_narrativo"),
                    String::from(">="),
                    String::from("2"),
                )],
                jugador: vec![(
                    String::from("med_influencia"),
                    String::from(">="),
                    String::from("50"),
                )],
                etiquetas_unlock: vec![],
            },
            npc_pool: vec![String::from("arguelles"), String::from("gallardo")],
            opciones: vec![Opcion {
                id: String::from("apoyar"),
                texto_id: String::from("apoyar_liberales"),
                consecuencias: vec![Consecuencia {
                    target: String::from("med_influencia"),
                    delta: 10,
                    diferida_jornadas: 0,
                }],
            }],
            modificadores_peso: ModificadoresPeso {
                por_perfil_oficio: {
                    let mut map = HashMap::new();
                    map.insert(String::from("jurista"), 1.8);
                    map.insert(String::from("periodista"), 1.5);
                    map
                },
                por_acto: {
                    let mut map = HashMap::new();
                    map.insert(2, 1.2);
                    map
                },
            },
            cooldown_jornadas: 3,
            compatible_con_crisis: true,
        }
    }

    #[test]
    fn test_filtrar_eventos_excluye_no_cumplen_precondiciones() {
        let world = WorldState::default(); // acto_narrativo = 0
        let player = PlayerState::new();
        let memory = MemoryState::new();
        let plantillas = vec![create_test_template()];
        let candidatos = filtrar_eventos(&plantillas, &world, &player, &memory);
        assert!(candidatos.is_empty()); // No cumple acto_narrativo >= 2
    }

    #[test]
    fn test_filtrar_eventos_incluye_cumplen_precondiciones() {
        let world = create_test_world(); // acto_narrativo = 2
        let player = create_test_player(); // med_influencia = 60
        let memory = create_test_memory();
        let plantillas = vec![create_test_template()];
        let candidatos = filtrar_eventos(&plantillas, &world, &player, &memory);
        assert_eq!(candidatos.len(), 1);
    }

    #[test]
    fn test_ponderar_eventos_aplica_modificadores() {
        let world = create_test_world();
        let player = create_test_player();
        let memory = create_test_memory();
        let plantilla = create_test_template();
        let ponderados = ponderar_eventos(vec![&plantilla], &world, &player, &memory);
        
        // Peso base: 10.0
        // + Modificador por acto 2: 10.0 * 1.2 = 12.0
        // + Modificador por oficio jurista: 12.0 * 1.8 = 21.6
        // + Modificador por compromisos urgentes: 21.6 * 3.0 = 64.8
        assert!((ponderados[0].0 - 64.8).abs() < 0.01);
    }

    #[test]
    fn test_instanciar_evento_selecciona_npc_con_agenda_activa() {
        let world = create_test_world();
        let player = create_test_player();
        let plantilla = create_test_template();
        let evento = instanciar_evento(&plantilla, &world, &player);
        assert_eq!(evento.npc_id, "arguelles"); // Tiene agenda_activa = true
    }

    #[test]
    fn test_instanciar_evento_selecciona_espacio_disponible() {
        let world = create_test_world();
        let player = create_test_player();
        let plantilla = create_test_template();
        let evento = instanciar_evento(&plantilla, &world, &player);
        assert_eq!(evento.espacio_id, "oratorio_san_felipe_neri");
    }

    #[test]
    fn test_generar_eventos_jornada_devuelve_ranuras() {
        let world = create_test_world();
        let player = create_test_player();
        let memory = create_test_memory();
        let plantillas = vec![create_test_template(), EventTemplate {
            id: String::from("rumor_prensa"),
            ..create_test_template()
        }];
        let eventos = generar_eventos_jornada(&world, &player, &memory, &plantillas, 2);
        assert_eq!(eventos.len(), 2);
    }

    #[test]
    fn test_generar_eventos_jornada_respeta_cooldowns() {
        let world = create_test_world();
        let player = create_test_player();
        let mut memory = create_test_memory();
        
        // Añadir cooldown para la plantilla
        memory.cooldowns_plantilla.insert(String::from("debate_constitucion"), 1);
        
        let plantillas = vec![create_test_template()];
        let eventos = generar_eventos_jornada(&world, &player, &memory, &plantillas, 1);
        assert!(eventos.is_empty()); // En cooldown
    }
}
