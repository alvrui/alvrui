use crate::memory_state::MemoryState;

pub fn apply_event_cooldowns(
    memory: &mut MemoryState,
    plantilla_id: &str,
    npc_id: &str,
    espacio_id: &str,
    cooldown_plantilla: u32,
    cooldown_npc: u32,
    cooldown_espacio: u32,
) {
    memory.cooldowns_plantilla.insert(plantilla_id.to_string(), cooldown_plantilla);
    memory.cooldowns_npc.insert(npc_id.to_string(), cooldown_npc);
    memory.cooldowns_espacio.insert(espacio_id.to_string(), cooldown_espacio);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_state::MemoryState;

    #[test]
    fn test_apply_event_cooldowns_sets_new_entries() {
        let mut memory = MemoryState::new();
        apply_event_cooldowns(&mut memory, "evt_saludo", "npc_juana", "cafetin", 3, 2, 1);
        assert_eq!(memory.cooldowns_plantilla.get("evt_saludo"), Some(&3));
        assert_eq!(memory.cooldowns_npc.get("npc_juana"), Some(&2));
        assert_eq!(memory.cooldowns_espacio.get("cafetin"), Some(&1));
    }

    #[test]
    fn test_apply_event_cooldowns_overwrites_existing_values() {
        let mut memory = MemoryState::new();
        memory.cooldowns_plantilla.insert("evt_saludo".to_string(), 5);
        apply_event_cooldowns(&mut memory, "evt_saludo", "npc_juana", "cafetin", 3, 0, 0);
        assert_eq!(memory.cooldowns_plantilla.get("evt_saludo"), Some(&3));
    }

    #[test]
    fn test_apply_event_cooldowns_allows_zero_values() {
        let mut memory = MemoryState::new();
        apply_event_cooldowns(&mut memory, "evt_saludo", "npc_juana", "cafetin", 0, 0, 0);
        assert_eq!(memory.cooldowns_plantilla.get("evt_saludo"), Some(&0));
        assert_eq!(memory.cooldowns_npc.get("npc_juana"), Some(&0));
        assert_eq!(memory.cooldowns_espacio.get("cafetin"), Some(&0));
    }
}