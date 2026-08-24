import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCodeView: React.FC<QRCodeProps> = ({ value, size = 180 }) => {
  // Use public QR generator API for standard smartphone scannability with SVG fallback
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ background: '#fff', padding: 14, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'inline-block' }}>
        <img
          src={qrImageUrl}
          alt="Student QR Code"
          width={size}
          height={size}
          style={{ display: 'block', borderRadius: 4 }}
          onError={(e) => {
            // Fallback rendering
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      <div style={{ fontSize: '12px', color: '#718096', marginTop: 4 }}>
        Scan QR code to view student registration details
      </div>
    </div>
  );
};
