import React from 'react';
import { EstadoUI } from '../../types';

interface NavbarProps {
  seccionActual: EstadoUI['seccion_actual'];
  onChangeSection: (seccion: EstadoUI['seccion_actual']) => void;
  tieneProyecto: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ seccionActual, onChangeSection, tieneProyecto }) => {
  const navItems = [
    { id: 'proyecto' as const, label: 'Proyecto', disabled: false },
    { id: 'personajes' as const, label: 'Personajes', disabled: !tieneProyecto },
    { id: 'narrativas' as const, label: 'Narrativas', disabled: !tieneProyecto },
    { id: 'tramas' as const, label: 'Tramas', disabled: !tieneProyecto },
    { id: 'estructura' as const, label: 'Estructura', disabled: !tieneProyecto },
    { id: 'agentes' as const, label: 'Agentes IA', disabled: false },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="guiones-container">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Guiones</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Herramienta de Construccion Narrativa</p>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeSection(item.id)}
                  disabled={item.disabled}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${seccionActual === item.id 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Asistido por IA</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="px-2 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeSection(item.id)}
              disabled={item.disabled}
              className={`
                block px-4 py-2 text-sm rounded-md w-full text-left
                ${seccionActual === item.id 
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                  : 'text-gray-600 dark:text-gray-300'}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;