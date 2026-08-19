import React from 'react';

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export const RequiredLabel: React.FC<RequiredLabelProps> = ({ children, required = true }) => {
  return (
    <label>
      {children}
      {required && <span className="required-asterisk"> *</span>}
    </label>
  );
};
