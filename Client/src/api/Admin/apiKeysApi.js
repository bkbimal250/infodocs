import apiClient from '../../utils/apiConfig';

export const apiKeysApi = {
  list: () => {
    return apiClient.get('/integrations/keys');
  },

  create: (data) => {
    return apiClient.post('/integrations/keys', data);
  },

  disable: (id) => {
    return apiClient.patch(`/integrations/keys/${id}/disable`);
  },

  delete: (id) => {
    return apiClient.delete(`/integrations/keys/${id}`);
  },

  regenerate: (id) => {
    return apiClient.post(`/integrations/keys/${id}/regenerate`);
  },
};

export default apiKeysApi;
