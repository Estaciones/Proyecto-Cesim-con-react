import React, { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  helperText,
  fullWidth = false,
  disabled = false,
  required = false,
  readOnly = false,
  className = '',
  startIcon,
  endIcon,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;
  
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={`${styles.inputWrapper} ${hasError ? styles.error : ''} ${disabled ? styles.disabled : ''}`}>
        {startIcon && (
          <span className={styles.startIcon}>
            {startIcon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={styles.input}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          aria-invalid={hasError}
          aria-describedby={helperText || error ? `${inputId}-description` : undefined}
          {...props}
        />
        
        {endIcon && (
          <span className={styles.endIcon}>
            {endIcon}
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div 
          id={`${inputId}-description`}
          className={`${styles.feedback} ${hasError ? styles.errorText : styles.helperText}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;