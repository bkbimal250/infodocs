import React, { useCallback, useEffect, useMemo, useState } from 'react';

import apiKeysApi from '../../../api/Admin/apiKeysApi';
import ApiKeyEmptyState from './components/ApiKeyEmptyState';
import ApiKeyHeader from './components/ApiKeyHeader';
import ApiKeyTable from './components/ApiKeyTable';
import CreateApiKeyModal from './components/CreateApiKeyModal';

const normalizeApiKeys = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.api_keys)) return payload.api_keys;
  if (Array.isArray(payload?.keys)) return payload.keys;
  return [];
};

const getApiKeyValue = (item) => {
  if (typeof item === 'string') return item;
  return item?.plain_key || item?.api_key || item?.key || item?.token || '';
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const AdminApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const sortedApiKeys = useMemo(() => {
    return [...apiKeys].sort((a, b) => {
      return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
    });
  }, [apiKeys]);

  const fetchApiKeys = useCallback(async () => {
    try {
      setError('');
      const response = await apiKeysApi.list();
      setApiKeys(normalizeApiKeys(response.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load API keys'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const copyValue = async (value) => {
    if (!value) {
      alert('Full API key is only available immediately after creation or regeneration.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      alert('API key copied');
    } catch (err) {
      alert('Failed to copy API key');
    }
  };

  const handleCopy = async (item) => {
    await copyValue(getApiKeyValue(item));
  };

  const handleCreate = async (formData, resetForm) => {
    try {
      setSubmitting(true);
      setError('');
      const response = await apiKeysApi.create(formData);
      const createdKey = response.data?.api_key || response.data?.key || response.data;
      await fetchApiKeys();
      resetForm?.();
      setModalOpen(false);
      await copyValue(getApiKeyValue(createdKey));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create API key'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async (id) => {
    if (!window.confirm('Disable this API key? Connected internal systems using this key will stop working.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      setError('');
      await apiKeysApi.disable(id);
      await fetchApiKeys();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to disable API key'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this API key permanently? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      setError('');
      await apiKeysApi.delete(id);
      setApiKeys((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete API key'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegenerate = async (id) => {
    if (!window.confirm('Regenerate this API key? The old key will stop working immediately.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      setError('');
      const response = await apiKeysApi.regenerate(id);
      const regeneratedKey = response.data?.api_key || response.data?.key || response.data;
      await fetchApiKeys();
      await copyValue(getApiKeyValue(regeneratedKey));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to regenerate API key'));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <ApiKeyHeader onCreate={() => setModalOpen(true)} />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          Loading API keys...
        </div>
      ) : sortedApiKeys.length === 0 ? (
        <ApiKeyEmptyState />
      ) : (
        <ApiKeyTable
          apiKeys={sortedApiKeys}
          onCopy={handleCopy}
          onDisable={handleDisable}
          onRegenerate={handleRegenerate}
          onDelete={handleDelete}
          actionLoadingId={actionLoadingId}
        />
      )}

      <CreateApiKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />
    </div>
  );
};

export default AdminApiKeysPage;
