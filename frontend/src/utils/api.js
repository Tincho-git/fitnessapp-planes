// Wrapper sencillo sobre Fetch para interceptar e inyectar el JWT automáticamente

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiFetch = async (url, options = {}) => {
  const headers = getAuthHeaders();
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const finalOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    }
  };

  const response = await fetch(`${API_URL}${url}`, finalOptions);

  if (response.status === 401 || response.status === 403) {
    console.error("No autorizado. El token podría haber expirado.");
  }

  return response;
};
