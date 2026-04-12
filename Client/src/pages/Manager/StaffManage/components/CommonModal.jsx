import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Shared Modal Wrapper for Staff Management
 */
const CommonModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-xl p-4 animate-in fade-in duration-500">
    <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden border border-white/20">
      <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-black text-gray-900 text-xl tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all text-gray-500 group">
          <FaTimes className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>
      <div className="p-8">{children}</div>
    </div>
  </div>
);

export default CommonModal;
