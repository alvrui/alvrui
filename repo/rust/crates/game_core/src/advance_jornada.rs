use crate::world_state::WorldState;

pub fn advance_jornada(world: &mut WorldState) {
    world.time.jornada_absoluta += 1;
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::world_state::WorldState;

    #[test]
    fn test_advance_jornada_increments_absolute_day() {
        let mut world = WorldState::new();
        assert_eq!(world.time.jornada_absoluta, 0);
        advance_jornada(&mut world);
        assert_eq!(world.time.jornada_absoluta, 1);
    }

    #[test]
    fn test_advance_jornada_is_additive() {
        let mut world = WorldState::new();
        advance_jornada(&mut world);
        advance_jornada(&mut world);
        assert_eq!(world.time.jornada_absoluta, 2);
    }
}