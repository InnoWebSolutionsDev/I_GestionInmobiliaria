import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPropertiesById, addPropertyToClientWithRole, getAllClients } from '../../redux/Actions/actions';
import Listado from '../Propiedades/Listado';
import Swal from 'sweetalert2';

const CreateSaleContractForm = () => {
  const dispatch = useDispatch();
  const property = useSelector(state => state.property); // Propiedad seleccionada
  console.log('Propiedad seleccionada:', property);
  const clients = useSelector(state => state.clients);

  // Estados locales para filtrar y seleccionar comprador
  const [showClientList, setShowClientList] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    propertyId: '',
    vendedor: '',      // Se completará automáticamente al seleccionar la propiedad
    comprador: '',     // Nombre del comprador (para filtrado y visualización)
    compradorId: '',   // ID del comprador
    salePrice: '',     // Precio de venta (puede ser modificado si es necesario)
    commission: '',    // Comisión de la venta
  });

  useEffect(() => {
    dispatch(getAllClients());
  }, [dispatch]);

  // Cuando se carga la propiedad, se asignan datos predefinidos
  useEffect(() => {
    if (property) {
      // Buscamos el cliente con rol "vendedor"
      const seller = property.Clients?.find(client => client.ClientProperty.role === 'vendedor');
      setFormData(prevData => ({
        ...prevData,
        propertyId: property.propertyId,
        vendedor: seller?.name || '',
        salePrice: property.price || '',
        commission: property.comision || '',
      }));
    }
  }, [property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // Si se ingresa manualmente el ID de propiedad, obtenemos la propiedad
    if (name === 'propertyId' && value) {
      dispatch(getPropertiesById(value));
    }

    // Filtrar compradores al escribir
    if (name === 'comprador') {
      if (value.length > 0) {
        const filtered = clients.filter(client =>
          client.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClients(filtered);
        setShowClientList(true);
      } else {
        setFilteredClients([]);
        setShowClientList(false);
      }
    }
  };

  // Selección del comprador de la lista filtrada
  const handleClientSelect = (client) => {
    setFormData(prevData => ({
      ...prevData,
      comprador: client.name,
      compradorId: client.idClient,
    }));
    setShowClientList(false);
  };

  // Selección de la propiedad desde el componente Listado
  const handlePropertySelect = (propertySelected) => {
    setFormData(prevData => ({
      ...prevData,
      propertyId: propertySelected.propertyId,
      vendedor: propertySelected.Clients?.find(client =>
        client.ClientProperty.role === 'vendedor'
      )?.name || '',
      salePrice: propertySelected.price,
      commission: propertySelected.comision,
    }));
  };

  // Al enviar el formulario, se asigna el rol "comprador" al cliente y se marca la propiedad como no disponible
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.compradorId) {
      Swal.fire({
        title: "Error",
        text: "Se requiere seleccionar una propiedad y un comprador",
        icon: "error",
      });
      return;
    }

    try {
      // Asignar rol "comprador" a la propiedad para el cliente
      const roleResponse = await dispatch(addPropertyToClientWithRole({
        idClient: formData.compradorId,
        propertyId: formData.propertyId,
        role: 'comprador'
      }));
      console.log('Role assignment response:', roleResponse);

      // Aquí podrías despachar otra acción para marcar la propiedad como no disponible, ejemplo:
      // await dispatch(markPropertyNotAvailable(formData.propertyId));

      Swal.fire({
        title: "¡Éxito!",
        text: "Rol de comprador asignado y propiedad marcada como no disponible",
        icon: "success",
      });
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Error al asignar rol",
        icon: "error",
      });
    }
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
                  Asignar Rol de Comprador
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* ID de Propiedad */}
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
                    </div>
                    {/* Vendedor (de la propiedad) */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Vendedor:
                      </label>
                      <input
                        type="text"
                        name="vendedor"
                        value={formData.vendedor}
                        readOnly
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                      />
                    </div>
                    {/* Comprador */}
                    <div className="flex flex-col relative">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Comprador:
                      </label>
                      <input
                        type="text"
                        name="comprador"
                        value={formData.comprador}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                      {showClientList && filteredClients.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                          {filteredClients.map(client => (
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
                    {/* (Opcional) Precio y Comisión pueden ser visualizados o modificados */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Precio de Venta:
                      </label>
                      <input
                        type="number"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        required
                      />
                    </div>
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
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 transition-colors duration-300"
                    >
                      Asignar Rol de Comprador
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleContractForm;