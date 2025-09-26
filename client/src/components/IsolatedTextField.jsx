import React from 'react';

// Isolated text field that never re-renders
const IsolatedTextField = ({ label, initialValue, onSave, required = false, type = 'text', multiline = false, rows = 1 }) => {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    ...(multiline ? { resize: 'vertical', fontFamily: 'inherit' } : {})
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#1976d2';
    e.target.style.boxShadow = '0 0 0 2px rgba(25, 118, 210, 0.2)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#ccc';
    e.target.style.boxShadow = 'none';
    if (onSave) {
      onSave(e.target.value);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label 
        htmlFor={fieldId}
        style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px',
          color: '#1976d2',
          fontWeight: 500
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={fieldId}
          rows={rows}
          defaultValue={initialValue || ''}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          defaultValue={initialValue || ''}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
        />
      )}
    </div>
  );
};

export default IsolatedTextField;
