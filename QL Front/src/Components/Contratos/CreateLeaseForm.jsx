import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createLease,
  getPropertiesById,
  addPropertyToClientWithRole,
  getAllClients,
  createGarantorsForLease, // <-- IMPORTAMOS LA ACCIÓN
} from "../../redux/Actions/actions";
import Listado from "../Propiedades/Listado";
import Swal from "sweetalert2";
import ContratoAlquiler from "../PdfTemplates/ContratoAlquiler";

const CreateLeaseForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const property = useSelector((state) => state.property);
  const [isLoading, setIsLoading] = useState(false);
  const clients = useSelector((state) => state.clients);
  const [leaseCreated, setLeaseCreated] = useState(null);

  // Estados locales para administrar la lista de clientes filtrada
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientList, setShowClientList] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfData, setPdfData] = useState(null);

  const [formData, setFormData] = useState({
    propertyId: "",
    locador: "",
    locatario: "",
    locatarioId: "",
    startDate: "",
    rentAmount: "",
    updateFrequency: "",
    commission: "",
    totalMonths: "",
    inventory: "",
    // Campos para garantes:
    guarantor1Name: "",
    guarantor1Cuil: "",
    guarantor1Direccion: "", // <-- nuevo campo
    guarantor1Description: "",
    guarantor1CertificationEntity: "",
    guarantor2Name: "",
    guarantor2Cuil: "",
    guarantor2Direccion: "", // <-- nuevo campo
    guarantor2Description: "",
    guarantor2CertificationEntity: "",
  });

  useEffect(() => {
    dispatch(getAllClients());
  }, [dispatch]);

  // Cuando se carga la propiedad (por ID), asignamos datos predefinidos al formulario
  useEffect(() => {
    if (property) {
      const hasActiveContract = property.Leases?.some((lease) => {
        const endDate = new Date(lease.startDate);
        endDate.setMonth(endDate.getMonth() + lease.totalMonths);
        return endDate > new Date();
      });
      if (hasActiveContract) {
        Swal.fire({
          title: "Propiedad No Disponible",
          text: "Esta propiedad ya tiene un contrato activo",
          icon: "warning",
        });
        // Limpiar el formulario
        setFormData((prevData) => ({
          ...prevData,
          propertyId: "",
          locador: "",
          rentAmount: "",
          commission: "",
          inventory: "",
        }));
        return;
      }
      const owner = property.Clients?.find(
        (client) => client.ClientProperty.role === "propietario"
      );
      setFormData((prevData) => ({
        ...prevData,
        locador: owner?.name || "",
        rentAmount: property.price || "",
        commission: property.comision || "",
        inventory: property.inventory || "",
      }));
    }
  }, [property]);

  // Al ingresar el ID, se dispara la acción para obtener la propiedad
  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    // Manejo del campo propertyId
    if (name === "propertyId" && value) {
      setIsLoading(true);
      try {
        const propertyResponse = await dispatch(getPropertiesById(value));

        if (propertyResponse && !propertyResponse.isAvailable) {
          await Swal.fire({
            title: "Propiedad No Disponible",
            text: "Esta propiedad no está disponible para alquilar",
            icon: "warning",
          });

          setFormData((prevData) => ({
            ...prevData,
            propertyId: "",
            locador: "",
            rentAmount: "",
            commission: "",
            inventory: "",
          }));
        } else {
          const owner = propertyResponse.Clients?.find(
            (client) => client.ClientProperty.role === "propietario"
          );

          setFormData((prevData) => ({
            ...prevData,
            propertyId: value,
            locador: owner?.name || "",
            rentAmount: propertyResponse.price || "",
            commission: propertyResponse.comision || "",
            inventory: propertyResponse.inventory || "",
          }));
        }
      } catch (error) {
        console.error("Error al verificar la propiedad:", error);
        await Swal.fire({
          title: "Error",
          text: "Error al verificar la disponibilidad de la propiedad",
          icon: "error",
        });
        setFormData((prevData) => ({
          ...prevData,
          propertyId: "",
        }));
      } finally {
        setIsLoading(false);
      }
    }
    // Manejo del campo locatario (inquilino)
    else if (name === "locatario") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        locatarioId: "", // Limpiar el ID cuando se escribe
      }));

      // Filtrar clientes si hay más de 2 caracteres
      if (value.length > 2) {
        const filtered = clients.filter((client) =>
          client.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClients(filtered);
        setShowClientList(true);
      } else {
        setFilteredClients([]);
        setShowClientList(false);
      }
    }
    // Para otros campos
    else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validaciones iniciales
      if (!formData.propertyId || !formData.locatarioId) {
        await Swal.fire({
          title: "Error",
          text: "Se requiere seleccionar una propiedad y un inquilino",
          icon: "error",
        });
        return;
      }

      // Verificar disponibilidad de la propiedad antes de continuar
      const propertyResponse = await dispatch(
        getPropertiesById(formData.propertyId)
      );

      if (!propertyResponse || !propertyResponse.isAvailable) {
        await Swal.fire({
          title: "Propiedad No Disponible",
          text: "Esta propiedad no está disponible para alquilar",
          icon: "warning",
        });
        return;
      }

      // Validación de contrato activo
      const hasActiveContract = property.Leases?.some((lease) => {
        const endDate = new Date(lease.startDate);
        endDate.setMonth(endDate.getMonth() + lease.totalMonths);
        return endDate > new Date();
      });

      if (hasActiveContract) {
        await Swal.fire({
          title: "Error",
          text: "Esta propiedad ya no está disponible",
          icon: "error",
        });
        return;
      }

      // Validación del propietario
      const landlordId = property.Clients?.find(
        (client) => client.ClientProperty.role === "propietario"
      )?.idClient;

      if (!landlordId) {
        await Swal.fire({
          title: "Error",
          text: "No se encontró el propietario de la propiedad",
          icon: "error",
        });
        return;
      }

      // Validar garantes
      if (!formData.guarantor1Name || !formData.guarantor1Cuil) {
        await Swal.fire({
          title: "Error",
          text: "El primer garante es obligatorio",
          icon: "error",
        });
        return;
      }

      // Asignar rol de inquilino
      await dispatch(
        addPropertyToClientWithRole({
          idClient: formData.locatarioId,
          propertyId: formData.propertyId,
          role: "inquilino",
        })
      );

      // Crear contrato
      const leaseResponse = await dispatch(
        createLease({
          propertyId: parseInt(formData.propertyId),
          landlordId: parseInt(landlordId),
          tenantId: parseInt(formData.locatarioId),
          startDate: formData.startDate,
          rentAmount: parseFloat(formData.rentAmount),
          updateFrequency: formData.updateFrequency,
          commission: parseFloat(formData.commission) || 0,
          totalMonths: parseInt(formData.totalMonths),
          inventory: formData.inventory,
        })
      );

      if (!leaseResponse || !leaseResponse.id) {
        throw new Error("No se recibió respuesta válida al crear el contrato");
      }

      // Preparar y procesar datos de garantes
      const getGuarantorDescription = (type, entity) => {
        switch (type) {
          case "certificacion":
            return `Certificación de ingresos certificada por ${entity}`;
          case "recibos":
            return "Recibos de sueldo";
          case "escritura":
            return "Escritura de propiedad";
          default:
            return type;
        }
      };

      // Preparar datos de garantes
      const guarantors = [
        {
          name: formData.guarantor1Name,
          cuil: formData.guarantor1Cuil,
          address: formData.guarantor1Direccion,
          description: getGuarantorDescription(
            formData.guarantor1Description,
            formData.guarantor1CertificationEntity
          ),
        },
      ];

      if (formData.guarantor2Name && formData.guarantor2Cuil) {
        guarantors.push({
          name: formData.guarantor2Name,
          cuil: formData.guarantor2Cuil,
          address: formData.guarantor2Direccion,
          description: getGuarantorDescription(
            formData.guarantor2Description,
            formData.guarantor2CertificationEntity
          ),
        });
      }

      // Crear garantes
      const garantorsResponse = await dispatch(
        createGarantorsForLease(leaseResponse.id, guarantors)
      );

      console.log("Garantes creados:", garantorsResponse);

      // Guarda los datos necesarios para el PDF
      const pdfDataTemp = {
        owner: property.Clients?.find(
          (client) => client.ClientProperty.role === "propietario"
        ),
        tenant: selectedClient,
        property: { ...property },
        lease: { ...leaseResponse },
        guarantors: garantorsResponse,
      };

      // Actualizar estado con el contrato y sus garantes
      setLeaseCreated({
        ...leaseResponse,
        Garantors: garantorsResponse,
      });

      // Guarda los datos del PDF
      setPdfData(pdfDataTemp);

      await Swal.fire({
        title: "¡Éxito!",
        text: "Contrato creado correctamente y garantes asignados. El PDF se generará a continuación.",
        icon: "success",
      });

      // NO LIMPIAR EL FORMULARIO AQUÍ
      // La limpieza se hace después de que el PDF se haya generado o mediante un botón
    } catch (error) {
      console.error("Error detallado en handleSubmit:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });

      await Swal.fire({
        title: "Error",
        text:
          error.response?.data?.error ||
          error.message ||
          "Error al crear el contrato",
        icon: "error",
      });
    }
  };

  // Selección de un cliente de la lista filtrada, guarda el nombre y ID
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setFormData((prevData) => ({
      ...prevData,
      locatario: client.name,
      locatarioId: client.idClient,
    }));
    setShowClientList(false);
  };
  // Selección de la propiedad desde la lista (Listado)
  const handlePropertySelect = (property) => {
    if (!property.isAvailable) {
      Swal.fire({
        title: "Propiedad No Disponible",
        text: "Esta propiedad no está disponible para alquilar",
        icon: "warning",
      });
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      propertyId: property.propertyId,
      locador:
        property.Clients?.find(
          (client) => client.ClientProperty.role === "propietario"
        )?.name || "",
      rentAmount: property.price,
      commission: property.comision,
      inventory: property.inventory,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="mb-8">
        <Listado onSelectProperty={handlePropertySelect} />
      </div>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Crear Contrato de Alquiler
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Property ID */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        ID Propiedad:
                      </label>
                      <input
                        type="text"
                        name="propertyId"
                        value={formData.propertyId}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                      {isLoading && (
                        <span className="ml-2">Verificando...</span>
                      )}
                    </div>

                    {/* Dueño */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Dueño:
                      </label>
                      <input
                        type="text"
                        name="locador"
                        value={formData.locador}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                    </div>

                    {/* Inquilino */}
                    <div className="flex flex-col relative">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Inquilino:
                      </label>
                      <input
                        type="text"
                        name="locatario"
                        value={formData.locatario}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                      {showClientList && filteredClients.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                          {filteredClients.map((client) => (
                            <div
                              key={client.idClient}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleClientSelect(client)}
                            >
                              {client.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fecha de Inicio */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Inicio Contrato:
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                    </div>

                    {/* Precio */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Precio:
                      </label>
                      <input
                        type="number"
                        name="rentAmount"
                        value={formData.rentAmount}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                    </div>

                    {/* Plazo de Actualización */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Plazo de Actualización:
                      </label>
                      <select
                        name="updateFrequency"
                        value={formData.updateFrequency}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      >
                        <option value="">Seleccionar plazo</option>
                        <option value="semestral">Semestral</option>
                        <option value="cuatrimestral">Cuatrimestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>

                    {/* Comisión */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Comisión:
                      </label>
                      <input
                        type="number"
                        name="commission"
                        value={formData.commission}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                      />
                    </div>

                    {/* Meses de contrato total */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Meses de contrato total:
                      </label>
                      <input
                        type="number"
                        name="totalMonths"
                        value={formData.totalMonths}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                    </div>

                    {/* Inventario */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Inventario:
                      </label>
                      <textarea
                        name="inventory"
                        value={formData.inventory}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 h-32"
                        required
                      ></textarea>
                    </div>

                    {/* Sección para los Garantes */}
                    {/* Sección para los Garantes */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Garante 1 (Obligatorio):
                      </label>
                      <input
                        type="text"
                        name="guarantor1Name"
                        value={formData.guarantor1Name}
                        onChange={handleInputChange}
                        placeholder="Nombre del primer garante"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                      <input
                        type="text"
                        name="guarantor1Cuil"
                        value={formData.guarantor1Cuil}
                        onChange={handleInputChange}
                        placeholder="CUIL del primer garante"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                        required
                      />
                      <input
                        type="text"
                        name="guarantor1Direccion"
                        value={formData.guarantor1Direccion}
                        onChange={handleInputChange}
                        placeholder="Domicilio del primer garante"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                        required
                      />
                      <select
                        name="guarantor1Description"
                        value={formData.guarantor1Description}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                        required
                      >
                        <option value="">
                          Seleccionar tipo de documentación
                        </option>
                        <option value="recibos">Recibos de sueldo</option>
                        <option value="certificacion">
                          Certificación de ingresos
                        </option>
                        <option value="escritura">
                          Escritura de propiedad
                        </option>
                      </select>

                      {formData.guarantor1Description === "certificacion" && (
                        <input
                          type="text"
                          name="guarantor1CertificationEntity"
                          value={formData.guarantor1CertificationEntity}
                          onChange={handleInputChange}
                          placeholder="Ente certificador (ej: Consejo Prof. de Ciencias Económicas)"
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                          required
                        />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Garante 2 (Opcional):
                      </label>
                      <input
                        type="text"
                        name="guarantor2Name"
                        value={formData.guarantor2Name}
                        onChange={handleInputChange}
                        placeholder="Nombre del segundo garante"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                      />
                      <input
                        type="text"
                        name="guarantor2Cuil"
                        value={formData.guarantor2Cuil}
                        onChange={handleInputChange}
                        placeholder="CUIL del segundo garante"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                      />
                      <input
                        type="text"
                        name="guarantor2Direccion"
                        value={formData.guarantor2Direccion}
                        onChange={handleInputChange}
                        placeholder="Domicilio del segundo garante"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                      />
                      <select
                        name="guarantor2Description"
                        value={formData.guarantor2Description}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                      >
                        <option value="">
                          Seleccionar tipo de documentación
                        </option>
                        <option value="recibos">Recibos de sueldo</option>
                        <option value="certificacion">
                          Certificación de ingresos
                        </option>
                        <option value="escritura">
                          Escritura de propiedad
                        </option>
                      </select>

                      {formData.guarantor2Description === "certificacion" && (
                        <input
                          type="text"
                          name="guarantor2CertificationEntity"
                          value={formData.guarantor2CertificationEntity}
                          onChange={handleInputChange}
                          placeholder="Ente certificador (ej: Consejo Prof. de Ciencias Económicas)"
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 mt-2"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 transition-colors duration-300"
                    >
                      Crear Contrato
                    </button>
                  </div>
                  {leaseCreated && (
                    <div className="mt-6">
                      <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-md">
                        <p className="text-green-700 font-semibold">
                          ¡Contrato creado exitosamente!
                        </p>
                        <p className="text-green-600 mt-2">
                          El PDF se ha generado, puede descargarlo o continuar.
                        </p>
                      </div>

                      <ContratoAlquiler
                        owner={property.Clients?.find(
                          (client) =>
                            client.ClientProperty.role === "propietario"
                        )}
                        tenant={selectedClient}
                        property={property}
                        lease={leaseCreated}
                        guarantors={leaseCreated.Garantors}
                        onDownload={() => console.log("PDF descargado")}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          // Limpiar formulario después de descargar el PDF
                          setFormData({
                            propertyId: "",
                            locador: "",
                            locatario: "",
                            locatarioId: "",
                            startDate: "",
                            rentAmount: "",
                            updateFrequency: "",
                            commission: "",
                            totalMonths: "",
                            inventory: "",
                            guarantor1Name: "",
                            guarantor1Cuil: "",
                            guarantor1Direccion: "",
                            guarantor1Description: "",
                            guarantor1CertificationEntity: "",
                            guarantor2Name: "",
                            guarantor2Cuil: "",
                            guarantor2Direccion: "",
                            guarantor2Description: "",
                            guarantor2CertificationEntity: "",
                          });
                          setLeaseCreated(null);
                          setPdfData(null);
                          setFilteredClients([]);
                          setShowClientList(false);
                        }}
                        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Crear nuevo contrato
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLeaseForm;
