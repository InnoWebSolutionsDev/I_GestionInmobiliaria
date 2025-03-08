import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';

const PanelContratos = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí agregarías tu lógica de logout
    navigate('/panel'); // Redirigir al panel después del logout
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col p-4 md:p-10 lg:p-20">
      {/* Header */}
      <div className="w-full bg-gray-800 p-2 shadow-md flex justify-between items-center">
        <Link to="/panel" className="text-white text-xl font-semibold hover:underline">
          Contrato
        </Link>
        <button
          onClick={handleLogout}
          className="text-white text-xl flex items-center space-x-2 hover:underline"
        >
          <span>Salir</span>
          <IoLogOutOutline className="w-6 h-6" />
        </button>
      </div>

      {/* Centro de la pantalla */}
      <div className="flex-grow flex flex-col justify-center items-center space-y-4 p-6">
        {/* Grid responsive para los botones */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          <Link
            to="/leaseList"
            className="w-full h-48 md:h-64 bg-lime-500 hover:bg-lime-600 text-black flex justify-center items-center rounded-lg shadow-lg text-xl md:text-2xl font-semibold transition duration-300 uppercase"
          >
            Listado
          </Link>
          <Link
            to="/contratoAlquiler"
            className="w-full h-48 md:h-64 bg-lime-500 text-white flex justify-center items-center rounded-lg shadow-lg text-xl md:text-2xl font-semibold hover:bg-green-600 transition duration-300 uppercase"
          >
            Alquiler
          </Link>
          <Link
            to="/sale"
            className="w-full h-48 md:h-64 bg-lime-500 text-white flex justify-center items-center rounded-lg shadow-lg text-xl md:text-2xl font-semibold hover:bg-green-600 transition duration-300 uppercase"
          >
            Compra Venta
          </Link>
        </div>
        
        {/* Botón de Alertas en ancho completo */}
        <Link
          to="/alertas"
          className="w-full h-32 bg-yellow-500 text-white flex justify-center items-center rounded-lg shadow-lg text-xl md:text-2xl font-semibold hover:bg-yellow-600 transition duration-300 uppercase"
        >
          Alertas
        </Link>
      </div>
    </div>
  );
};

export default PanelContratos;