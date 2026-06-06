// Widget: Mapa de Cádiz (estático)
use egui::{Ui, ColorImage};
use egui_extras::RetainedImage;
use image::io::Reader as ImageReader;
use std::path::Path;

pub struct MapaCadiz {
    textura: Option<RetainedImage>,
}

impl MapaCadiz {
    pub fn new() -> Self {
        Self { textura: None }
    }

    // Cargar la imagen del mapa
    pub fn cargar(&mut self, ruta: &str) -> Result<(), Box<dyn std::error::Error>> {
        let img = ImageReader::open(Path::new(ruta))?.with_guessed_format()?.decode()?;
        let rgba = img.into_rgba8();
        let size = [rgba.width() as usize, rgba.height() as usize];
        let color_image = ColorImage::from_rgba_unmultiplied(size, &rgba.into_raw());
        let imagen = RetainedImage::from_color_image(ruta.to_string(), color_image);
        self.textura = Some(imagen);
        Ok(())
    }

    // Dibujar el mapa en la UI
    pub fn dibujar(&self, ui: &mut Ui) {
        if let Some(textura) = &self.textura {
            textura.show_scaled(ui, 1.0);
        } else {
            ui.label("Mapa no cargado.");
        }
    }
}
