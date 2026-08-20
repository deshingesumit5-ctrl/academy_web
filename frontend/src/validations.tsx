import React from 'react';

export const MOBILE_PLACEHOLDER = 'Enter 10 digit number';

export const handleMobileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (val: string) => void
) => {
  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
  setter(digitsOnly);
};

export const validateMobile = (value: string, required: boolean = true): string => {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return required ? 'This field needs to be filled' : '';
  }
  if (trimmed.length < 10) {
    return 'Enter 10 digit number';
  }
  return '';
};

export const validateRequired = (value: any): string => {
  if (value === null || value === undefined) return 'This field needs to be filled';
  if (typeof value === 'string' && !value.trim()) return 'This field needs to be filled';
  if (typeof value === 'number' && isNaN(value)) return 'This field needs to be filled';
  return '';
};

interface FieldErrorProps {
  error?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;
  return (
    <div
      className="field-error-msg"
      style={{
        color: '#ef4444',
        fontSize: '10.5px',
        marginTop: '2px',
        fontWeight: 500,
        lineHeight: 1.2,
      }}
    >
      {error}
    </div>
  );
};
