import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPayment, getAllClients, getClientById } from "../../redux/Actions/actions";  
import EstadoContratos from "../Contratos/EstadoContratos";
import { jsPDF } from "jspdf";
import numeroALetras from "../../utils/numeroALetras";

const PaymentForm = () => {
  const dispatch = useDispatch();
  const clients = useSelector((state) => state.clients);
  const clientData = useSelector((state) => state.client);
  const paymentCreate = useSelector((state) => state.paymentCreate);
 
  
  
  // Estado local para limpiar formulario y para bloquear creación doble
  const [formData, setFormData] = useState({
    idClient: "",
    leaseId: "",
    paymentDate: "",
    amount: "",
    period: "",
    type: "installment", // o "commission"
    totalInstallments: "",
  });
  const [paymentCreated, setPaymentCreated] = useState(false);
  
  // Función para generar el PDF (puedes personalizar)
  const generateReceipt = () => {
    const payment = paymentCreate.payment;
    const selectedClient = clients.find(c => c.idClient.toString() === payment.idClient.toString());
    const amount = Number(payment.amount);
    console.log('Amount before formatting:', amount, typeof amount);
   
    const formatMoney = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });


    const montoFormateado = formatMoney.format(amount);
   const montoEnLetras = numeroALetras(amount);

   console.log('Monto en letras:', montoEnLetras); // Debug
  console.log('Monto formateado:', montoFormateado);

    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(14);
    doc.text("QUINTERO + LOBETO", 20, 20);

    doc.setFontSize(10);
    doc.text("PROPIEDADES", 34, 25);
    doc.text("de LOBETO MARIANA", 28, 30);

    doc.setFontSize(12);
    doc.text("ARQUITECTA", 34, 35);
    
    doc.setFontSize(8);
    doc.text("M.P. Nº 278", 39, 40);

    doc.setFontSize(8);
    doc.text("AVDA. CUBA Nº 50 / Tel. 3835 - 461334", 22, 45);
    doc.text("C.P. 4750 - Belén - Catamarca", 28, 50);
    doc.text("arquitectalobetomariana@yahoo.com.ar", 22, 55);
    doc.setFontSize(8);
    doc.text("IVA RESPONSABLE MONOTRIBUTO", 24, 60);
    doc.line(20, 65, 200, 65); // Agrega una línea horizontal desde x=20 hasta x=200 en y=65
    doc.line(110, 20, 110, 65);
    // Número de recibo y tipo de documento
    doc.text(`Nº ${payment.id.toString().padStart(8, '0')}`, 152, 30);
    doc.setFontSize(12);
    doc.text("RECIBO", 130, 30);
    doc.setFontSize(8);
    doc.text("DOCUMENTO NO VALIDO COMO FACTURA", 130, 35);
  
    // Fecha
    doc.text("Fecha:", 130, 45);
    doc.text(new Date(payment.paymentDate).toLocaleDateString(), 140, 45);
  
    // Datos del cliente
    doc.text("Señor(es):", 20, 75);
    doc.text(selectedClient ? selectedClient.name : "", 40, 75);
    doc.text("Tel:", 155, 75);
    doc.text(selectedClient ? selectedClient.mobilePhone : "", 165, 75);
    doc.text("Domicilio:", 20, 85);
    doc.text(selectedClient ? selectedClient.address || "" : "", 45, 85);
    doc.text("Localidad:", 20, 95);
    doc.text(selectedClient ? selectedClient.ciudad || "" : "", 45, 95);
    doc.line(65, 65, 200, 65);
  
    doc.line(20, 145, 200, 145);
    doc.text("Recibí la suma de Pesos:", 20, 120);
    doc.text(montoFormateado.replace('ARS', '$'), 60, 120);
    doc.text("En concepto de:", 20, 130);
    doc.text(`${payment.type === 'installment' ? 'Periodo' : 'Comisión'} - ${payment.period}`, 50, 130);
  
    
    doc.text("Son $:", 20, 160);
  doc.text(`${montoEnLetras} (${montoFormateado.replace('ARS', '$')})`, 30, 160);
  
    // Firma
    doc.text("Firma y aclaración", 150, 180);
    doc.line(130, 185, 200, 185);
  
    // Guardar PDF
    doc.save(`Recibo_${payment.id}.pdf`);
  };
  // Cargar todos los clientes al montar el componente
  useEffect(() => {
    dispatch(getAllClients());
  }, [dispatch]);

  // Detectar creación exitosa
  useEffect(() => {
    if (paymentCreate && paymentCreate.success) {
      console.log("paymentCreate:", paymentCreate);
      setPaymentCreated(true);
      resetForm();
    }
  }, [paymentCreate]);

  const resetForm = () => {
    setFormData({
      idClient: "",
      leaseId: "",
      paymentDate: "",
      amount: "",
      period: "",
      type: "installment",
      totalInstallments: "",
    });
  };

  // Manejo del cambio de cliente: se dispara getClientById
  const handleClientChange = (e) => {
    const idClient = e.target.value;
    setFormData({ ...formData, idClient, leaseId: "" });
    setPaymentCreated(false);
    if (idClient) {
      dispatch(getClientById(idClient));
    }
  };

  // Manejo del contrato: se actualiza el monto del alquiler
  const handleLeaseChange = (e) => {
    const leaseId = e.target.value;
    setFormData({ ...formData, leaseId });
    if (clientData) {
      const allLeases = clientData.LeasesAsTenant.concat(clientData.LeasesAsLandlord);
      const selectedLease = allLeases.find(
        (l) => (l.id || l.leaseId).toString() === leaseId
      );
      if (selectedLease) {
        setFormData((prevState) => ({
          ...prevState,
          amount: selectedLease.rentAmount,
        }));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.type === "installment" && !formData.totalInstallments) {
      alert("Debe ingresar el total de cuotas para una cuota");
      return;
    }
    console.log("Enviando los siguientes datos al back:", formData);
    dispatch(createPayment(formData));
  };

  const leases =
    clientData && clientData.LeasesAsTenant && clientData.LeasesAsLandlord
      ? clientData.LeasesAsTenant.concat(clientData.LeasesAsLandlord)
      : [];

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <EstadoContratos />
      <h2 className="text-2xl font-bold text-center mb-4">Crear Pago</h2>

      {/* Listado de clientes */}
      <div className="mb-4">
        <label className="block text-sm font-semibold">Seleccione Cliente:</label>
        <select
          name="idClient"
          value={formData.idClient}
          onChange={handleClientChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Seleccione un cliente</option>
          {clients &&
            clients.map((client) => (
              <option key={client.idClient} value={client.idClient}>
                {client.name}
              </option>
            ))}
        </select>
      </div>

      {/* Listado de contratos del cliente */}
      {clientData && clientData.LeasesAsTenant && (
        <div className="mb-4">
          <label className="block text-sm font-semibold">Seleccione Contrato:</label>
          <select
            name="leaseId"
            value={formData.leaseId}
            onChange={handleLeaseChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Seleccione un contrato</option>
            {leases.map((lease) => (
              <option
                key={lease.id || lease.leaseId}
                value={lease.id || lease.leaseId}
              >
                {lease.Property ? lease.Property.address : `Contrato ${lease.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block text-sm font-semibold">Fecha del Pago:</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Monto:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Periodo:</label>
          <input
            type="text"
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Febrero 2025"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">
            Tipo (installment o commission):
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="installment">Cuota</option>
            <option value="commission">Comisión</option>
          </select>
        </div>
        {formData.type === "installment" && (
          <div>
            <label className="block text-sm font-semibold">Total de Cuotas:</label>
            <input
              type="number"
              name="totalInstallments"
              value={formData.totalInstallments}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          disabled={paymentCreated}
        >
          Crear Pago
        </button>
      </form>

      {/* Botón para descargar PDF cuando el pago se creó */}
      {paymentCreated && (
        <button
          type="button"
          onClick={generateReceipt}
          className="mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Descargar Recibo (PDF)
        </button>
      )}
    </div>
  );
};

export default PaymentForm;