use crate::memory_state::{MemoryState, EventHistoryEntry};

pub fn register_event_in_memory(
    memory: &mut MemoryState,
    id_plantilla: &str,
    familia: &str,
    npc_id: &str,
    espacio_id: &str,
    jornada: u32,
    opcion_elegida: &str,
) {
    let entry = EventHistoryEntry {
        id_plantilla: id_plantilla.to_string(),
        familia: familia.to_string(),
        npc_id: npc_id.to_string(),
        espacio_id: espacio_id.to_string(),
        jornada,
        opcion_elegida: opcion_elegida.to_string(),
    };

    memory.historial_eventos.push(entry);

    if memory.historial_eventos.len() > 50 {
        memory.historial_eventos.remove(0);
    }

    memory.ultimo_evento_por_familia.insert(familia.to_string(), jornada);
    memory.ultimo_evento_por_npc.insert(npc_id.to_string(), jornada);
    memory.ultimo_evento_por_espacio.insert(espacio_id.to_string(), jornada);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_state::MemoryState;

    #[test]
    fn test_register_event_adds_to_history() {
        let mut memory = MemoryState::new();
        register_event_in_memory(
            &mut memory,
            "evt_saludo",
            "social",
            "npc_juana",
            "cafetin",
            3,
            "opcion_cordial"
        );
        assert_eq!(memory.historial_eventos.len(), 1);
        let entry = &memory.historial_eventos[0];
        assert_eq!(entry.id_plantilla, "evt_saludo");
        assert_eq!(entry.familia, "social");
        assert_eq!(entry.npc_id, "npc_juana");
        assert_eq!(entry.espacio_id, "cafetin");
        assert_eq!(entry.jornada, 3);
        assert_eq!(entry.opcion_elegida, "opcion_cordial");
    }

    #[test]
    fn test_register_event_updates_last_indices() {
        let mut memory = MemoryState::new();
        register_event_in_memory(
            &mut memory,
            "evt_saludo",
            "social",
            "npc_juana",
            "cafetin",
            5,
            "opcion_cordial"
        );
        assert_eq!(memory.ultimo_evento_por_familia.get("social"), Some(&5));
        assert_eq!(memory.ultimo_evento_por_npc.get("npc_juana"), Some(&5));
        assert_eq!(memory.ultimo_evento_por_espacio.get("cafetin"), Some(&5));
    }

    #[test]
    fn test_register_event_keeps_history_bounded() {
        let mut memory = MemoryState::new();
        for i in 0..60 {
            let id = format!("evt_{}", i);
            register_event_in_memory(
                &mut memory,
                &id,
                "test",
                "npc",
                "espacio",
                i,
                "op"
            );
        }
        assert!(memory.historial_eventos.len() <= 50);
        let first = &memory.historial_eventos[0];
        assert_eq!(first.id_plantilla, "evt_10");
    }
}