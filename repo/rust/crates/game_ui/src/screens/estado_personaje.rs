// Pantalla: Estado del Personaje
use egui::Ui;
use crate::AppState;

pub fn dibujar(ui: &mut Ui, state: &AppState) {
    let game_state = state.game_state.lock().unwrap();

    ui.heading("Estado del Personaje");
    ui.separator();

    // Perfil base
    ui.label(format!("Origen: {}", game_state.player.profile.perfil_origen_id));
    ui.label(format!("Oficio: {}", game_state.player.profile.perfil_oficio_id));
    ui.label(format!("Clase: {}", game_state.player.profile.perfil_clase_social_id));
    ui.label(format!("Adscripción: {}", game_state.player.profile.perfil_adscripcion_id));
    ui.separator();

    // Reputaciones con facciones
    ui.label("Reputaciones:");
    for reputacion in &game_state.player.reputaciones {
        ui.label(format!("- {}: {}", reputacion.grupo_id, reputacion.valor));
    }
    ui.separator();

    // Compromisos activos
    ui.label("Compromisos activos:");
    for compromiso in &game_state.player.compromisos {
        ui.label(format!("- {} ({})", compromiso.comp_id, compromiso.comp_naturaleza_id));
    }
}
