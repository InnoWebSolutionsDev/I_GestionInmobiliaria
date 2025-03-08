import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllLeases } from "../../redux/Actions/actions";

const EstadoContratos = () => {
  const dispatch = useDispatch();
  const { leases, loading, error } = useSelector((state) => state);
  const [editingLeaseId, setEditingLeaseId] = useState(null);
  const [editedLease, setEditedLease] = useState({});

  useEffect(() => {
    console.log("Leases en componente:", leases);
  }, [leases]);

  useEffect(() => {
    dispatch(getAllLeases());
  }, [dispatch]);

  const handleEditClick = (lease) => {
    setEditingLeaseId(lease.leaseId || lease.id);
    setEditedLease(lease);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedLease((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = (leaseId) => {
    // Aquí podrías despachar una acción para actualizar el contrato
    console.log("Guardando contrato", leaseId, editedLease);
    // Luego de salvar, salen del modo edición:
    setEditingLeaseId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Estado de Contratos</h1>
      {loading && <p>Cargando contratos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              {/* Ahora la primera columna muestra el nombre del inquilino */}
              <th className="py-2 px-4">Inquilino</th>
              <th className="py-2 px-4">Propiedad</th>
              <th className="py-2 px-4">Propietario</th>
              <th className="py-2 px-4">ID Contrato</th>
              <th className="py-2 px-4">Fecha Inicio</th>
              <th className="py-2 px-4">Monto</th>
              <th className="py-2 px-4">Frecuencia</th>
              <th className="py-2 px-4">Meses Totales</th>
              <th className="py-2 px-4">Inventario</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leases &&
              leases.map((lease) => {
                console.log("Contrato:", lease);
      return (
                <tr
                  key={lease.leaseId || lease.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  {/* Mostrar el nombre del inquilino obtenido de Tenant */}
                  <td className="py-2 px-4">
                    {lease.Tenant ? lease.Tenant.name : lease.tenantId}
                  </td>
                  {/* Mostrar la dirección de la propiedad */}
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        name="propertyId"
                        value={editedLease.propertyId}
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : lease.Property ? (
                      lease.Property.address
                    ) : (
                      lease.propertyId
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        name="landlordId"
                        value={editedLease.landlordId}
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : lease.Landlord && lease.Landlord.name ? (
                      lease.Landlord.name
                    ) : (
                      lease.landlordId
                    )}
                  </td>
                  {/* Se añade una columna extra para mostrar el id del contrato */}
                  <td className="py-2 px-4">
                    {lease.leaseId || lease.id}
                  </td>
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        type="date"
                        name="startDate"
                        value={
                          editedLease.startDate
                            ? new Date(editedLease.startDate)
                                .toISOString()
                                .substring(0, 10)
                            : ""
                        }
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      new Date(lease.startDate).toLocaleDateString()
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        name="rentAmount"
                        value={editedLease.rentAmount}
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      lease.rentAmount
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        name="updateFrequency"
                        value={editedLease.updateFrequency}
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      lease.updateFrequency
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        name="totalMonths"
                        value={editedLease.totalMonths}
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      lease.totalMonths
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <input
                        name="inventory"
                        value={editedLease.inventory}
                        onChange={handleInputChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      lease.inventory
                    )}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    {editingLeaseId === (lease.leaseId || lease.id) ? (
                      <button
                        onClick={() =>
                          handleSaveClick(lease.leaseId || lease.id)
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(lease)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstadoContratos;