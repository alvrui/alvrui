use crate::memory_state::MemoryState;

pub fn tick_cooldowns(memory: &mut MemoryState) {
    for (_, value) in memory.cooldowns_plantilla.iter_mut() {
        if *value > 0 {
            *value -= 1;
        }
    }

    for (_, value) in memory.cooldowns_npc.iter_mut() {
        if *value > 0 {
            *value -= 1;
        }
    }

    for (_, value) in memory.cooldowns_espacio.iter_mut() {
        if *value > 0 {
            *value -= 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_state::MemoryState;

    #[test]
    fn test_tick_cooldowns_decrements_template_cooldown() {
        let mut memory = MemoryState::new();
        memory.cooldowns_plantilla.insert("evt_1".to_string(), 3);
        tick_cooldowns(&mut memory);
        assert_eq!(memory.cooldowns_plantilla.get("evt_1"), Some(&2));
    }

    #[test]
    fn test_tick_cooldowns_decrements_npc_and_space_cooldowns() {
        let mut memory = MemoryState::new();
        memory.cooldowns_npc.insert("npc_1".to_string(), 2);
        memory.cooldowns_espacio.insert("cadiz_puerto".to_string(), 1);
        tick_cooldowns(&mut memory);
        assert_eq!(memory.cooldowns_npc.get("npc_1"), Some(&1));
        assert_eq!(memory.cooldowns_espacio.get("cadiz_puerto"), Some(&0));
    }

    #[test]
    fn test_tick_cooldowns_does_not_make_values_negative() {
        let mut memory = MemoryState::new();
        memory.cooldowns_plantilla.insert("evt_1".to_string(), 0);
        tick_cooldowns(&mut memory);
        assert_eq!(memory.cooldowns_plantilla.get("evt_1"), Some(&0));
    }

    #[test]
    fn test_tick_cooldowns_leaves_empty_maps_untouched() {
        let mut memory = MemoryState::new();
        tick_cooldowns(&mut memory);
        assert!(memory.cooldowns_plantilla.is_empty());
        assert!(memory.cooldowns_npc.is_empty());
        assert!(memory.cooldowns_espacio.is_empty());
    }
}