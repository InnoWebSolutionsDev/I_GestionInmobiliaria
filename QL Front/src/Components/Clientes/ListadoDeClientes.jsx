import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllClients, updateClient, deleteClient } from "../../redux/Actions/actions";
import { useNavigate } from 'react-router-dom';
const ListadoDeClientes = () => {
  
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Estado global desde Redux
  const { clients, loading, error } = useSelector((state) => ({
    clients: state.clients,
    loading: state.loading,
    error: state.error,
  }));

  // Estados locales
  const [editingClientId, setEditingClientId] = useState(null);
  const [editedClient, setEditedClient] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Filtrar clientes según el término de búsqueda
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular clientes actuales según la página
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Obtener clientes al montar el componente
  useEffect(() => {
    dispatch(getAllClients());
  }, [dispatch]);

  // Manejar edición de cliente
  const handleEditClick = (client) => {
    setEditingClientId(client.idClient);
    setEditedClient(client);
  };

  // Guardar cambios de cliente
  const handleSaveClick = (idClient) => {
    dispatch(updateClient(idClient, editedClient));
    setEditingClientId(null);
    alert("Cliente actualizado correctamente");
  };

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
  };

  // Eliminar cliente
  const handleDelete = (idClient) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      dispatch(deleteClient(idClient));
      alert("Cliente eliminado correctamente");
    }
  };

  return (
    <div className="p-6 min-h-screen mt-20">
    <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        Volver
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center">Listado de Clientes</h1>

      {loading && <p className="text-center">Cargando clientes...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded w-full sm:w-1/2 block mx-auto"
      />

      {/* Tabla de clientes en contenedor responsive */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">CUIT-CUIL</th>
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Domicilio</th>
                <th className="py-3 px-4 text-left">Teléfono</th>
                <th className="py-3 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map((client) => (
                <tr key={client.idClient} className="border-b hover:bg-gray-100 transition">
                  <td className="py-3 px-4">{client.idClient}</td>
                  <td className="py-3 px-4">
                    {editingClientId === client.idClient ? (
                      <input
                        name="cuil"
                        value={editedClient.cuil || ""}
                        onChange={handleInputChange}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      client.cuil
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingClientId === client.idClient ? (
                      <input
                        name="name"
                        value={editedClient.name || ""}
                        onChange={handleInputChange}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      client.name
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingClientId === client.idClient ? (
                      <input
                        name="email"
                        value={editedClient.email || ""}
                        onChange={handleInputChange}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      client.email
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingClientId === client.idClient ? (
                      <input
                        name="direccion"
                        value={editedClient.direccion || ""}
                        onChange={handleInputChange}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      client.direccion
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingClientId === client.idClient ? (
                      <input
                        name="mobilePhone"
                        value={editedClient.mobilePhone || ""}
                        onChange={handleInputChange}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      client.mobilePhone
                    )}
                  </td>
                  <td className="py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    {editingClientId === client.idClient ? (
                      <button
                        onClick={() => handleSaveClick(client.idClient)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mb-2 sm:mb-0"
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(client)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 mb-2 sm:mb-0"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(client.idClient)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensaje si no hay clientes */}
      {!loading && filteredClients.length === 0 && (
        <p className="text-center">No se encontraron clientes.</p>
      )}

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 mx-1 rounded ${
              currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListadoDeClientes;
