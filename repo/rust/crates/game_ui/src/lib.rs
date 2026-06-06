// M7: UI Nativa con egui
// Este módulo expone el estado del motor (Nivel 1) en una interfaz gráfica (Nivel 3).

pub mod app;
pub mod screens;
pub mod widgets;

use game_core::game_state::GameState;
use std::sync::Arc;
use std::sync::Mutex;

// Estado global de la aplicación UI
pub struct AppState {
    pub game_state: Arc<Mutex<GameState>>,
    pub ruta_config: String,
}

// Inicializar la aplicación
impl AppState {
    pub fn new(game_state: GameState, ruta_config: &str) -> Self {
        Self {
            game_state: Arc::new(Mutex::new(game_state)),
            ruta_config: ruta_config.to_string(),
        }
    }

    // Cargar configuración del mockup al iniciar
    pub fn cargar_configuracion(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut game_state = self.game_state.lock().unwrap();
        // Cargar el archivo unificado config.yaml
        let config_path = std::path::Path::new(&self.ruta_config).join("config.yaml");
        game_state.cargar_configuracion_mockup(&config_path)?;
        Ok(())
    }
}
