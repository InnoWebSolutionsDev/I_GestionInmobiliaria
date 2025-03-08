const { PaymentReceipt, Lease, Client, Property } = require('../data');

exports.createPayment = async (req, res) => {
    try {
      const {
        idClient,
        leaseId,
        paymentDate,
        amount,
        period,
        type, // "installment" o "commission"
        installmentNumber, // opcional para "installment"
        totalInstallments, // opcional para "installment"
      } = req.body;
  
      // Validación previa básica para ambos tipos
      if (!idClient || !leaseId || !paymentDate || !amount || !period || !type) {
        return res.status(400).json({ error: 'Faltan datos obligatorios.' });
      }
  
      let finalInstallmentNumber = null;
      let finalTotalInstallments = null;
  
      if (type === "installment") {
        // Si es cuota, se requiere calcular o recibir installmentNumber y totalInstallments.
        // Podés calcular el número siguiente si no lo pasás desde el front:
        const lastReceipt = await PaymentReceipt.findOne({
          where: { leaseId, type: 'installment' },
          order: [['installmentNumber', 'DESC']],
        });
        finalInstallmentNumber = lastReceipt ? lastReceipt.installmentNumber + 1 : 1;
  
        // Si totalInstallments se envía, se puede usar, o de lo contrario puede venir del contrato.
        if (totalInstallments) {
          finalTotalInstallments = totalInstallments;
        } else {
          // Aquí podrías, por ejemplo, consultar el contrato para definir la cantidad total.
          return res.status(400).json({ error: 'El total de cuotas es requerido para una cuota.' });
        }
      }
  
      // Para comisión, no se requieren installmentNumber y totalInstallments.
      const newPaymentReceipt = await PaymentReceipt.create({
        idClient,
        leaseId,
        paymentDate,
        amount,
        period,
        type,
        installmentNumber: type === "commission" ? null : finalInstallmentNumber,
        totalInstallments: type === "commission" ? null : finalTotalInstallments,
      });
  
      res.status(201).json(newPaymentReceipt);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Error al crear el pago',
        details: error.message,
      });
    }
  };

    
exports.getPaymentsByIdClient = async (req, res) => {
    try {
        const { idClient } = req.params;

        const payments = await PaymentReceipt.findAll({
            where: { idClient },
            include: [
                {
                    model: Lease,
                    include: [{ model: Property }], // Detalles de la propiedad si es necesario
                },
            ],
        });

        if (!payments.length) {
            return res.status(404).json({ error: 'No se encontraron pagos para este cliente' });
        }

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pagos', details: error.message });
    }
};
exports.getPaymentsByLeaseId = async (req, res) => {
    try {
        const { leaseId } = req.params;

        const payments = await PaymentReceipt.findAll({
            where: { leaseId },
            include: [
                { model: Client }, // Incluye información del cliente
                { model: Lease },  // Incluye información del contrato
            ],
        });

        if (!payments.length) {
            return res.status(404).json({ error: 'No se encontraron pagos para este contrato' });
        }

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pagos', details: error.message });
    }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentReceipt.findAll({
      include: [
        { model: Client }, // Información del cliente
        { 
          model: Lease,   // Información del contrato
          include: [{ model: Property }] // Opcional: Detalles de la propiedad
        },
      ],
    });

    if (!payments.length) {
      return res.status(404).json({ error: 'No se encontraron pagos' });
    }

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pagos', details: error.message });
  }
};