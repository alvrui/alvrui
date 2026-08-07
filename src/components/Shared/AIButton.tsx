import React from 'react';

interface AIButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
}

const AIButton: React.FC<AIButtonProps> = ({
  onClick,
  loading,
  disabled,
  className = '',
  title = 'Generar con IA'
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200
        rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors
        text-sm font-medium flex items-center space-x-1
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={title}
    >
      <span>{loading ? '...' : '🤖'}</span>
      <span>IA</span>
    </button>
  );
};

export default AIButton;