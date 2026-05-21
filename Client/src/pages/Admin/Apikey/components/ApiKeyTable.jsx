import React from 'react';
import {
  HiOutlineClipboardCopy,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineTrash,
} from 'react-icons/hi';

const ApiKeyTable = ({
  apiKeys,
  onCopy,
  onDisable,
  onRegenerate,
  onDelete,
  actionLoadingId,
}) => {
  const formatDate = (value) => {
    if (!value) return 'Never';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleString();
  };

  const getKeyPreview = (item) => {
    return item.key_preview || item.masked_key || item.prefix || 'Hidden after creation';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3 text-left">System Name</th>
            <th className="px-4 py-3 text-left">Key</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-left">Last Used</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {apiKeys?.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3 font-medium">
                <div>
                  <div className="font-semibold text-gray-900">{item.name || item.system_name || 'Internal System'}</div>
                  {item.description && (
                    <div className="mt-1 max-w-xs truncate text-xs text-gray-500">{item.description}</div>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {getKeyPreview(item)}
                </code>
              </td>

              <td className="px-4 py-3">
                {(item.is_active ?? item.active ?? item.status === 'active') ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    Disabled
                  </span>
                )}
              </td>

              <td className="px-4 py-3">
                {formatDate(item.created_at || item.createdAt)}
              </td>

              <td className="px-4 py-3">
                {formatDate(item.last_used_at || item.lastUsedAt)}
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onCopy(item)}
                    disabled={actionLoadingId === item.id}
                    className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Copy API key"
                  >
                    <HiOutlineClipboardCopy className="text-base" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRegenerate(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Regenerate key"
                  >
                    <HiOutlineRefresh className="text-base" />
                  </button>

                  {(item.is_active ?? item.active ?? item.status === 'active') ? (
                    <button
                      type="button"
                      onClick={() => onDisable(item.id)}
                      disabled={actionLoadingId === item.id}
                      className="rounded-lg bg-yellow-100 p-2 text-yellow-700 hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Disable key"
                    >
                      <HiOutlineShieldExclamation className="text-base" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDisable(item.id)}
                      disabled
                      className="cursor-not-allowed rounded-lg bg-green-100 p-2 text-green-700 opacity-50"
                      title="Key is already disabled"
                    >
                      <HiOutlineShieldCheck className="text-base" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Delete key"
                  >
                    <HiOutlineTrash className="text-base" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApiKeyTable;
