// Pantalla: Estado de la Jornada
use egui::Ui;
use crate::AppState;

pub fn dibujar(ui: &mut Ui, state: &AppState) {
    let game_state = state.game_state.lock().unwrap();

    // Título y fecha
    ui.heading("Cádiz, 1805: Estado de la Jornada");
    ui.separator();

    // Tiempo actual
    ui.label(format!(
        "Jornada: {}",
        game_state.world.time.jornada_absoluta
    ));

    // Medidores del protagonista (6 fijos)
    ui.separator();
    ui.label("Medidores:");
    egui::Grid::new("medidores_grid").show(ui, |ui| {
        ui.label("Influencia:");
        ui.label(game_state.player.meters.influencia_valor.to_string());
        ui.end_row();

        ui.label("Relacional:");
        ui.label(game_state.player.meters.relacional_valor.to_string());
        ui.end_row();

        ui.label("Reputación:");
        ui.label(game_state.player.meters.reputacion_valor.to_string());
        ui.end_row();

        ui.label("Coherencia:");
        ui.label(game_state.player.meters.coherencia_valor.to_string());
        ui.end_row();

        ui.label("Recursos:");
        ui.label(game_state.player.meters.recursos_valor.to_string());
        ui.end_row();

        ui.label("Aguante:");
        ui.label(game_state.player.meters.aguante_valor.to_string());
        ui.end_row();
    });

    // Eventos disponibles
    ui.separator();
    ui.label("Eventos disponibles:");
    let eventos = game_state.generar_eventos_jornada();
    for evento in eventos {
        if ui.button(&evento.familia).clicked() {
            // Navegación a implementar en el futuro
        }
        ui.label(&evento.texto);
        ui.separator();
    }

    // Mapa de Cádiz (estático)
    ui.separator();
    ui.label("Mapa de Cádiz:");
    // TODO: Cargar imagen del mapa (usando egui_extras::RetainedImage)
}
