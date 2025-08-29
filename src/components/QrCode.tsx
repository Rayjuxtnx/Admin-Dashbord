"use client";

import QRCode from "react-qr-code";

interface QrCodeProps {
  url: string;
}

const QrCode = ({ url }: QrCodeProps) => {
    if(!url) return null;
    
    return (
        <div style={{ background: 'white', padding: '16px' }}>
            <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={url}
                viewBox={`0 0 256 256`}
            />
        </div>
    );
};

export default QrCode;