import React from 'react';

// This component is completely isolated and will never re-render
const IsolatedAddressForm = ({ onSave, initialValue }) => {
  console.log('🟢 IsolatedAddressForm rendered');

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontSize: '14px',
        color: '#1976d2',
        fontWeight: 500
      }}>
        Present Address *
      </label>
      <textarea
        rows={3}
        defaultValue={initialValue}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#1976d2';
          e.target.style.boxShadow = '0 0 0 2px rgba(25, 118, 210, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#ccc';
          e.target.style.boxShadow = 'none';
          if (onSave) {
            onSave(e.target.value);
          }
        }}
      />
    </div>
  );
};

export default IsolatedAddressForm;
