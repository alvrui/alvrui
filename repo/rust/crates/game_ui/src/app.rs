// Aplicación principal de egui con eframe
use egui::Context;
use eframe::App;  // Importar el trait App
use crate::screens::{estado_jornada, evento, estado_personaje};
use crate::AppState;

pub struct CadizApp {
    pub state: AppState,
    pub pantalla_actual: Pantalla,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Pantalla {
    EstadoJornada,
    Evento { evento_id: String },
    EstadoPersonaje,
}

// Implementar el trait App de eframe para CadizApp
impl App for CadizApp {
    fn update(&mut self, ctx: &Context, _frame: &mut eframe::Frame) {
        // Barra superior
        egui::TopBottomPanel::top("barra_superior").show(ctx, |ui| {
            ui.horizontal(|ui| {
                if ui.button("Estado de la Jornada").clicked() {
                    self.pantalla_actual = Pantalla::EstadoJornada;
                }
                if ui.button("Personaje").clicked() {
                    self.pantalla_actual = Pantalla::EstadoPersonaje;
                }
            });
        });

        // Contenido principal
        egui::CentralPanel::default().show(ctx, |ui| {
            match &self.pantalla_actual {
                Pantalla::EstadoJornada => {
                    estado_jornada::dibujar(ui, &self.state);
                }
                Pantalla::Evento { evento_id } => {
                    evento::dibujar(ui, &self.state, evento_id);
                }
                Pantalla::EstadoPersonaje => {
                    estado_personaje::dibujar(ui, &self.state);
                }
            }
        });
    }
}

// Constructor (fuera del impl App)
impl CadizApp {
    pub fn new(state: AppState) -> Self {
        Self {
            state,
            pantalla_actual: Pantalla::EstadoJornada,
        }
    }
}
