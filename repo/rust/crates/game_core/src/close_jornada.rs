use crate::memory_state::MemoryState;
use crate::cooldown_tick::tick_cooldowns;

pub fn close_jornada(memory: &mut MemoryState) {
    tick_cooldowns(memory);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_state::MemoryState;

    #[test]
    fn test_close_jornada_decrements_all_active_cooldowns() {
        let mut memory = MemoryState::new();
        memory.cooldowns_plantilla.insert("evt_1".to_string(), 2);
        memory.cooldowns_npc.insert("npc_1".to_string(), 1);
        memory.cooldowns_espacio.insert("esp_1".to_string(), 3);

        close_jornada(&mut memory);

        assert_eq!(memory.cooldowns_plantilla["evt_1"], 1);
        assert_eq!(memory.cooldowns_npc["npc_1"], 0);
        assert_eq!(memory.cooldowns_espacio["esp_1"], 2);
    }

    #[test]
    fn test_close_jornada_does_not_make_cooldowns_negative() {
        let mut memory = MemoryState::new();
        memory.cooldowns_plantilla.insert("evt_1".to_string(), 0);

        close_jornada(&mut memory);

        assert_eq!(memory.cooldowns_plantilla["evt_1"], 0);
    }

    #[test]
    fn test_close_jornada_leaves_empty_memory_untouched() {
        let mut memory = MemoryState::new();
        close_jornada(&mut memory);

        assert!(memory.cooldowns_plantilla.is_empty()
             && memory.cooldowns_npc.is_empty()
             && memory.cooldowns_espacio.is_empty());
    }
}