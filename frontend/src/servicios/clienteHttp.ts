import axios from 'axios';

// ============================================================
//  Cliente HTTP base con interceptores JWT
// ============================================================
const clienteHttp = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

clienteHttp.interceptors.request.use((config) => {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    const { token } = JSON.parse(usuario);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default clienteHttp;
