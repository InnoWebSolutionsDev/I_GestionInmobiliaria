import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPayments } from '../../redux/Actions/actions';

const PaymentReport = () => {
  const dispatch = useDispatch();
  const payments = useSelector(state => state.allPayments) || [];
  const loading = useSelector(state => state.loading);
  const error = useSelector(state => state.error);

  // Filtros por fecha
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getAllPayments());
  }, [dispatch]);

  // Filtrar por rango de fecha
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    if (fromDate && paymentDate < fromDate) return false;
    if (toDate && paymentDate > toDate) return false;
    return true;
  });

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Manejo del cambio de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatMoney = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  });

  // Renderizado de botones de paginación
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`mx-1 px-3 py-1 rounded ${
            currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reporte de Pagos</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium">Fecha Desde:</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full mb-2"
        />
        <label className="block text-sm font-medium">Fecha Hasta:</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-100 rounded">
              <h2 className="text-lg font-bold">Comisión de Venta</h2>
              <p className="text-xl">
                {formatMoney.format(filteredPayments
                  .filter(p => p.type === 'commission')
                  .reduce((sum, p) => sum + Number(p.amount), 0)
                )}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded">
              <h2 className="text-lg font-bold">Comisión de Alquileres</h2>
              <p className="text-xl">
                {formatMoney.format(filteredPayments
                  .filter(p => p.type === 'installment')
                  .reduce((sum, p) => {
                    // Se calcula la comisión usando el porcentaje que viene en el contrato
                    const commissionRate = Number(p.Lease?.commission || 0);
                    const commissionAmount = Number(p.amount) * (commissionRate / 100);
                    return sum + commissionAmount;
                  }, 0)
                )}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">Fecha</th>
                  <th className="py-2 px-4 border">Monto</th>
                  <th className="py-2 px-4 border">Periodo</th>
                  <th className="py-2 px-4 border">Tipo</th>
                  <th className="py-2 px-4 border">Comisión</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map(payment => {
                  // Calculamos el monto de la comisión
                  const commissionRate = Number(payment.Lease?.commission || 0);
                  const commissionAmount = Number(payment.amount) * (commissionRate / 100);
                  return (
                    <tr key={payment.id} className="text-center">
                      <td className="py-2 px-4 border">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border">
                        {formatMoney.format(Number(payment.amount))}
                      </td>
                      <td className="py-2 px-4 border">
                        {payment.period}
                      </td>
                      <td className="py-2 px-4 border">
                        {payment.type === 'commission'
                          ? 'Comisión de Venta'
                          : 'Comisión de Alquiler'}
                      </td>
                      <td className="py-2 px-4 border">
                        {payment.type === 'installment'
                          ? formatMoney.format(commissionAmount)
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center">
            {renderPagination()}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentReport;