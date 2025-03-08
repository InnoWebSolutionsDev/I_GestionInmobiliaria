import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  // Obtenemos el rol del usuario desde Redux
  const role = useSelector((state) => state.adminInfo.role);

  // Si el usuario no es administrador, lo redirigimos a la página principal
  if (role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Si es administrador, muestra la ruta protegida (el panel)
  return children;
};

export default ProtectedRoute;