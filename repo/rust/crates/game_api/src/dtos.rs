use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TiempoDto {
    pub tramo_id: String,
    pub acto: i32,
    pub jornada: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct CrisisActivaDto {
    pub tipo_id: String,
    pub fase: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProtagonistaResumenDto {
    pub posicion_formal_id: String,
    pub visibilidad: String,
    pub medidores: MedidoresDto,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EstadoJornadaDto {
    pub tiempo: TiempoDto,
    pub protagonista: ProtagonistaDto,
    pub crisis_activa: Option<CrisisActivaDto>,
    pub eventos_disponibles: Vec<EventoDetalleDto>,
    pub presupuesto_temporal: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EstadoPersonajeDto {
    pub posicion_formal_id: String,
    pub visibilidad: String,
    pub medidores: Vec<MedidorResumenDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ResolverEventoInput {
    pub evento_id: String,
    pub opcion_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ResolverEventoOutput {
    pub deltas_aplicados: Vec<String>,
    pub etiquetas_nuevas: Vec<String>,
    pub jornada_cerrada: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct MedidorResumenDto {
    pub nombre: String,
    pub valor: u8,
    pub tendencia: i8,
    pub umbral_bajo: u8,
    pub umbral_alto: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProtagonistaDto {
    pub nombre: String,
    pub posicion_formal_id: String,
    pub visibilidad: String,
    pub medidores: Vec<MedidorResumenDto>,
    pub relaciones_count: usize,
    pub compromisos_count: usize,
    pub etiquetas_activas: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EventoDetalleDto {
    pub evento_id: String,
    pub familia: String,
    pub resumen_id: String,
    pub coste_temporal: u8,
}

pub type MedidoresDto = Vec<MedidorResumenDto>;
