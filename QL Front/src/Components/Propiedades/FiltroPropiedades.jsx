import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProperties } from "../../redux/Actions/actions";

const Filtro = () => {
  const dispatch = useDispatch();
  const { allProperties, loading, error } = useSelector((state) => state);

  const [filters, setFilters] = useState({
    city: "",
    type: "",
    typeProperty: "",
    priceMin: "",
    priceMax: "",
    escritura: "",
    isAvailable: "", // Puede ser: "" (todos), "true" o "false"
  });

  useEffect(() => {
    dispatch(getAllProperties());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  let filteredProperties = allProperties.filter((property) => {
    const {
      city,
      type,
      typeProperty,
      priceMin,
      priceMax,
      escritura,
      isAvailable,
    } = filters;
    let matches = true;

    if (city) {
      matches = matches && property.city.toLowerCase().includes(city.toLowerCase());
    }
    if (type) {
      matches = matches && property.type === type;
    }
    if (typeProperty) {
      matches = matches && property.typeProperty === typeProperty;
    }
    if (priceMin) {
      matches = matches && property.price >= parseFloat(priceMin);
    }
    if (priceMax) {
      matches = matches && property.price <= parseFloat(priceMax);
    }
    if (escritura) {
      matches = matches && property.escritura && property.escritura.toLowerCase().includes(escritura.toLowerCase());
    }
    if (isAvailable) {
      matches = matches && (property.isAvailable === (isAvailable === "true"));
    }
    return matches;
  });

  // Ordenamos para que primero aparezcan las propiedades disponibles
  filteredProperties = filteredProperties.sort((a, b) => {
    // Convertir booleanos a números para que true (1) aparezca antes que false (0)
    return Number(b.isAvailable) - Number(a.isAvailable);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Todas las Propiedades</h1>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          name="city"
          placeholder="Ciudad"
          value={filters.city}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tipo</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        <select
          name="typeProperty"
          value={filters.typeProperty}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tipo de Propiedad</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="terreno">Terreno</option>
        </select>
        <input
          type="number"
          name="priceMin"
          placeholder="Precio Mínimo"
          value={filters.priceMin}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="priceMax"
          placeholder="Precio Máximo"
          value={filters.priceMax}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="escritura"
          value={filters.escritura}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Escritura</option>
          <option value="prescripcion en tramite">Prescripción en trámite</option>
          <option value="escritura">Escritura</option>
          <option value="prescripcion adjudicada">Prescripción adjudicada</option>
          <option value="posesion">Posesión</option>
        </select>
        <select
          name="isAvailable"
          value={filters.isAvailable}
          onChange={handleFilterChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Disponibilidad</option>
          <option value="true">Disponible</option>
          <option value="false">No Disponible</option>
        </select>
      </div>

      {/* Resultados */}
      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
  <div
    key={property.propertyId}
    className={`p-6 border rounded-lg shadow transition-transform hover:scale-105 ${
      property.isAvailable ? "bg-green-500" : "bg-red-600"
    }`}
  >
    <h2 className="font-bold text-xl mb-2">{property.address}</h2>
    <p className="mb-1">
      {property.city}, {property.neighborhood}
    </p>
    <p className="mb-1">Precio: ${property.price}</p>
    <p className="mb-1">Tipo: {property.type}</p>
    <p className="mb-1">Tipo de Propiedad: {property.typeProperty}</p>
    <p className="mb-1">
      Escritura: {property.escritura ? property.escritura : "N/A"}
    </p>
    <p className="mb-1">
      Disponible: {property.isAvailable ? "Sí" : "No"}
    </p>
  </div>
))}
        </div>
      )}
    </div>
  );
};

export default Filtro;