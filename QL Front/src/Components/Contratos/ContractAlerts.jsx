import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllLeases } from "../../redux/Actions/actions";

const getUpdateAlert = (lease) => {
  const { startDate, updateFrequency, updatedAt } = lease;
  let updateIntervalMonths = 0;
  if (updateFrequency === "semestral") updateIntervalMonths = 6;
  else if (updateFrequency === "cuatrimestral") updateIntervalMonths = 4;
  else if (updateFrequency === "anual") updateIntervalMonths = 12;
  
  const baseDate = updatedAt ? new Date(updatedAt) : new Date(startDate);
  let nextUpdate = new Date(baseDate);
  while (nextUpdate <= new Date()) {
    nextUpdate.setMonth(nextUpdate.getMonth() + updateIntervalMonths);
  }
  return nextUpdate;
};

const getEndAlert = (lease) => {
  const { startDate, totalMonths } = lease;
  const start = new Date(startDate);
  // La fecha de culminación se obtiene sumando totalMonths a la fecha de inicio.
  return new Date(start.setMonth(start.getMonth() + totalMonths));
};

const getContractDetails = (lease) => {
  const nextUpdate = getUpdateAlert(lease);
  const terminationDate = getEndAlert(lease);
  return {
    leaseId: lease.id || lease.leaseId,
    startDate: new Date(lease.startDate),
    nextUpdate,
    terminationDate,
    // Agrega el nombre del tenant, o en su defecto su Id
    tenant: lease.Tenant ? lease.Tenant.name : lease.tenantId,
  };
};

const EstadoAlertasContratos = () => {
  const dispatch = useDispatch();
  const { leases, loading, error } = useSelector((state) => state);

  useEffect(() => {
    dispatch(getAllLeases());
  }, [dispatch]);

  const contractDetails = (leases || []).map((lease) =>
    getContractDetails(lease)
  );

  // Ordenar por 'nextUpdate' y luego por 'terminationDate'
  const sortedContractDetails = [...contractDetails].sort((a, b) => {
    const diffNext = a.nextUpdate.getTime() - b.nextUpdate.getTime();
    return diffNext !== 0
      ? diffNext
      : a.terminationDate.getTime() - b.terminationDate.getTime();
  });

  const formatDate = (date) => date.toLocaleDateString();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Alertas de Contratos</h1>
      {loading && <p>Cargando contratos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {sortedContractDetails.length === 0 ? (
        <p>No hay contratos para mostrar.</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4">ID Contrato</th>
              <th className="py-2 px-4">Inquilino</th>
              <th className="py-2 px-4">Fecha Inicio</th>
              <th className="py-2 px-4">Próxima Actualización</th>
              <th className="py-2 px-4">Fecha de Culminación</th>
            </tr>
          </thead>
          <tbody>
            {sortedContractDetails.map((contract) => (
              <tr key={contract.leaseId} className="text-center border-b">
                <td className="py-2 px-4">{contract.leaseId}</td>
                <td className="py-2 px-4">{contract.tenant}</td>
                <td className="py-2 px-4">{formatDate(contract.startDate)}</td>
                <td className="py-2 px-4">{formatDate(contract.nextUpdate)}</td>
                <td className="py-2 px-4">{formatDate(contract.terminationDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EstadoAlertasContratos;