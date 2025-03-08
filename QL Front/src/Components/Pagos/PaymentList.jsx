import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentsByLeaseId } from '../../redux/Actions/actions';

const PaymentList = () => {
  const dispatch = useDispatch();
  // Supongamos que en el state los pagos están en state.payments o en state.paymentCreate (ajusta según corresponda)
  const payments = useSelector(state => state.payments) || [];
  const loading = useSelector(state => state.loading);
  const error = useSelector(state => state.error);

  // Estado para filtro: puede ser contrato (leaseId) o nombre de tenant.
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Ejemplo: obtén los pagos para el contrato con id 1; luego se puede generalizar
    dispatch(getPaymentsByLeaseId(1));
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredPayments = payments.filter(payment =>
    payment.leaseId.toString().includes(filter) ||
    (payment.Client && payment.Client.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Listado de Pagos</h1>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filtrar por contrato o nombre del tenant"
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredPayments.length === 0 ? (
        <p>No se encontraron pagos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border">Fecha</th>
                <th className="py-2 px-4 border">Monto</th>
                <th className="py-2 px-4 border">Periodo</th>
                <th className="py-2 px-4 border">Tenant</th>
                <th className="py-2 px-4 border">Contrato</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="text-center">
                  <td className="py-2 px-4 border">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">
                    {payment.amount}
                  </td>
                  <td className="py-2 px-4 border">
                    {payment.period}
                  </td>
                  <td className="py-2 px-4 border">
                    {payment.Client ? payment.Client.name : ''}
                  </td>
                  <td className="py-2 px-4 border">
                    {payment.leaseId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
