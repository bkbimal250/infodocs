import React from 'react';
import { FaTimes } from 'react-icons/fa';

const CommonModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border">
      <div className="px-5 py-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400">
          <FaTimes />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default CommonModal;
