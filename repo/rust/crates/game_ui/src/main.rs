// Punto de entrada con eframe
use eframe::NativeOptions;
use game_ui::app::CadizApp;
use game_ui::AppState;
use game_core::game_state::GameState;

fn main() {
    // Configuración de la ventana
    let options = NativeOptions {
        initial_window_size: Some(egui::vec2(1024.0, 768.0)),
        resizable: true,
        ..Default::default()
    };

    // Crear el estado inicial del juego
    let game_state = GameState::new();
    let ruta_config = "/media/alvaro/service/project-stack/cadi-alfa/repo/content/cadiz/config/".to_string();
    let app_state = AppState::new(game_state, &ruta_config);

    // Cargar configuración del mockup
    if let Err(e) = app_state.cargar_configuracion() {
        eprintln!("Error al cargar la configuración: {}", e);
        return;
    }

    // Iniciar la aplicación eframe
    let _ = eframe::run_native(
        "Cádiz 1805–1816 (Mockup)",
        options,
        Box::new(|_cc| Box::new(CadizApp::new(app_state))),
    );
}
