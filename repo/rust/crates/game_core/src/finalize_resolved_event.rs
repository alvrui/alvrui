use crate::memory_state::MemoryState;
use crate::register_event_in_memory::register_event_in_memory;
use crate::apply_event_cooldowns::apply_event_cooldowns;

pub fn finalize_resolved_event(
    memory: &mut MemoryState,
    id_plantilla: &str,
    familia: &str,
    npc_id: &str,
    espacio_id: &str,
    jornada: u32,
    opcion_elegida: &str,
    cooldown_plantilla: u32,
    cooldown_npc: u32,
    cooldown_espacio: u32,
) {
    register_event_in_memory(
        memory,
        id_plantilla,
        familia,
        npc_id,
        espacio_id,
        jornada,
        opcion_elegida,
    );

    apply_event_cooldowns(
        memory,
        id_plantilla,
        npc_id,
        espacio_id,
        cooldown_plantilla,
        cooldown_npc,
        cooldown_espacio,
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_finalize_resolved_event_registers_and_sets_cooldowns() {
        let mut memory = MemoryState::new();
        finalize_resolved_event(
            &mut memory,
            "evt_saludo",
            "social",
            "npc_juana",
            "cafetin",
            3,
            "opcion_cordial",
            3,
            2,
            1,
        );

        assert_eq!(memory.historial_eventos.len(), 1);
        let entry = &memory.historial_eventos[0];
        assert_eq!(entry.id_plantilla, "evt_saludo");
        assert_eq!(entry.familia, "social");
        assert_eq!(entry.npc_id, "npc_juana");
        assert_eq!(entry.espacio_id, "cafetin");
        assert_eq!(entry.jornada, 3);
        assert_eq!(entry.opcion_elegida, "opcion_cordial");

        assert_eq!(memory.cooldowns_plantilla.get("evt_saludo"), Some(&3));
        assert_eq!(memory.cooldowns_npc.get("npc_juana"), Some(&2));
        assert_eq!(memory.cooldowns_espacio.get("cafetin"), Some(&1));
    }

    #[test]
    fn test_finalize_resolved_event_updates_last_indices_via_register() {
        let mut memory = MemoryState::new();
        finalize_resolved_event(
            &mut memory,
            "evt_saludo",
            "social",
            "npc_juana",
            "cafetin",
            5,
            "opcion_cordial",
            0,
            0,
            0,
        );

        assert_eq!(memory.ultimo_evento_por_familia.get("social"), Some(&5));
        assert_eq!(memory.ultimo_evento_por_npc.get("npc_juana"), Some(&5));
        assert_eq!(memory.ultimo_evento_por_espacio.get("cafetin"), Some(&5));
    }

    #[test]
    fn test_finalize_resolved_event_respects_history_bound() {
        let mut memory = MemoryState::new();
        for i in 0..60 {
            let id = format!("evt_{}", i);
            finalize_resolved_event(
                &mut memory,
                &id,
                "test",
                "npc",
                "espacio",
                i,
                "op",
                0,
                0,
                0,
            );
        }

        assert!(memory.historial_eventos.len() <= 50);
        let first = &memory.historial_eventos[0];
        assert_eq!(first.id_plantilla, "evt_10");
    }
}
