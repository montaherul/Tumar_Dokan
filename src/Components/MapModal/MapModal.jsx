import React from 'react';

const MapModal = ({ mapUrl, onClose }) => {
  if (!mapUrl) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-border">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-background">
          <h2 className="text-lg font-semibold text-foreground">Customer Location</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
            aria-label="Close map"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map Iframe */}
        <div className="flex-grow">
          <iframe
            src={mapUrl}
            title="Customer Address Map"
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default MapModal;