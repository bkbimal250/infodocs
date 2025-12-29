import { useState } from 'react';

/**
 * Delete Query Modal Component
 * Confirms query deletion with option for permanent delete
 */
const DeleteQueryModal = ({ query, permanent, onPermanentChange, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Query</h2>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to {permanent ? 'permanently delete' : 'delete'} query #{query.id}?
          </p>
          {!permanent && (
            <p className="text-xs text-gray-500 mb-4">
              This will soft delete the query. It can be restored later.
            </p>
          )}
          {permanent && (
            <p className="text-xs text-red-600 mb-4">
              ⚠️ Warning: This will permanently delete the query. This action cannot be undone.
            </p>
          )}
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permanent}
                onChange={(e) => onPermanentChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Permanently delete</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteQueryModal;
