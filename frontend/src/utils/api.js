// Wrapper sencillo sobre Fetch para interceptar e inyectar el JWT automáticamente

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiFetch = async (url, options = {}) => {
  const finalOptions = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    }
  };

  const response = await fetch(`http://localhost:8080${url}`, finalOptions);

  if (response.status === 401 || response.status === 403) {
    console.error("No autorizado. El token podría haber expirado.");
  }

  return response;
};
