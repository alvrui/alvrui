// Pantalla: Detalle de Evento
use egui::Ui;
use crate::AppState;

pub fn dibujar(ui: &mut Ui, state: &AppState, evento_id: &str) {
    let game_state = state.game_state.lock().unwrap();

    // Buscar el evento por ID
    let eventos = game_state.generar_eventos_jornada();
    let evento = eventos.iter().find(|e| e.id == evento_id);

    if let Some(evento) = evento {
        // Título y descripción
        ui.heading(&evento.familia);
        ui.separator();
        ui.label(&evento.texto);

        // Opciones
        ui.separator();
        ui.label("Opciones:");
        for opcion in &evento.opciones {
            if ui.button(&opcion.texto).clicked() {
                // Resolver el evento (por implementar)
                // game_state.resolver_evento(&evento.id, &opcion.id);
            }
        }
    } else {
        ui.label("Evento no encontrado.");
    }
}
