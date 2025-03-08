import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllProperties, updateProperty, deleteProperty } from "../../redux/Actions/actions";
import PropiedadesPDF from "../PdfTemplates/PropiedadesPdf";


const Listado = () => {
  const dispatch = useDispatch();
  const { allProperties, loading, error } = useSelector((state) => state);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 5;

  useEffect(() => {
    dispatch(getAllProperties());
  }, [dispatch]);

  // Filtrar propiedades por dirección
  const filteredProperties = allProperties.filter((property) =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear la página a 1 cuando se cambie la búsqueda
  };

  // Validar campos
  const validateField = (field, value) => {
    let error = "";
    if (field === "address" && (!value || value.length < 5)) {
      error = "La dirección debe tener al menos 5 caracteres.";
    }
    if (field === "neighborhood" && (!value || value.length < 3)) {
      error = "El barrio debe tener al menos 3 caracteres.";
    }
    if (field === "price" && (!value || isNaN(Number(value)) || Number(value) <= 0)) {
      error = "El precio debe ser un número mayor a 0.";
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
  };

  const handleEdit = (property) => {
    setEditingId(property.propertyId);
    setFormData({ ...property });
  };

  const handleSave = () => {
    const validationErrors = Object.keys(formData).reduce((acc, field) => {
      const error = validateField(field, formData[field]);
      if (error) acc[field] = error;
      return acc;
    }, {});
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    dispatch(updateProperty(formData));
    setEditingId(null);
  };

  const handleDelete = (propertyId) => {
    dispatch(deleteProperty(propertyId));
  };

  if (loading) return <div className="text-center py-4">Cargando propiedades...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4  mt-20">
      <h1 className="text-2xl font-bold mb-4">Lista de Propiedades</h1>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por dirección"
          className="border px-2 py-1"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Dirección</th>
            <th className="border px-4 py-2">Barrio</th>
            <th className="border px-4 py-2">Precio</th>
            <th className="border px-4 py-2">Clientes</th> 
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProperties.map((property) => (
            <tr key={property.propertyId} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{property.propertyId}</td>
              <td className="border px-4 py-2">
                {editingId === property.propertyId ? (
                  <>
                    <input
                      className="border px-2 py-1"
                      value={formData.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                  </>
                ) : (
                  property.address
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === property.propertyId ? (
                  <>
                    <input
                      className="border px-2 py-1"
                      value={formData.neighborhood || ""}
                      onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    />
                    {errors.neighborhood && <p className="text-red-500 text-sm">{errors.neighborhood}</p>}
                  </>
                ) : (
                  property.neighborhood
                )}
              </td>
              <td className="border px-4 py-2">
                {editingId === property.propertyId ? (
                  <>
                    <input
                      className="border px-2 py-1"
                      value={formData.price || ""}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                  </>
                ) : (
                  `$${property.price}`
                )}
              </td>
              <td className="border px-4 py-2">
          {property.Clients.length > 0 ? (
            property.Clients.map((client) => (
              <div key={client.idClient}>
                {client.name} ({client.ClientProperty.role})
              </div>
            ))
          ) : (
            <span>No asignado</span>
          )}
        </td>

              <td className="border px-4 py-2 flex gap-2">
                {editingId === property.propertyId ? (
                  <>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSave}>
                      Guardar
                    </button>
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleEdit(property)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(property.propertyId)}
                    >
                      Eliminar
                    </button>
                    <PropiedadesPDF property={property} />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          className="bg-gray-300 px-3 py-1 rounded"
          disabled={currentPage === 1}
          onClick={() => handlePageChange("prev")}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          className="bg-gray-300 px-3 py-1 rounded"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange("next")}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Listado;






