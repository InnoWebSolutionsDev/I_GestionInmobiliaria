const { Client, Property, ClientProperty } = require("../data");

// POST: Crear una propiedad
exports.createProperty = async (req, res) => {
    try {
      const {
        address,
        neighborhood,
        city,
        type,
        typeProperty,
        price,
        images,
        comision,
        escritura,
        matriculaOPadron,
        frente,
        profundidad,
        linkInstagram,
        rooms, // Asegúrate de que rooms está incluido
        socio,
        inventory,
        superficieCubierta,
        superficieTotal,

      } = req.body;
  
      // Validación básica
      if (
        !address ||
        !neighborhood ||
        !city ||
        !type ||
        !typeProperty ||
        !price ||
        !images ||
        !escritura ||
        !comision
      ) {
        return res.status(400).json({
          error: "Faltan datos requeridos",
          details: "Por favor asegúrese de que todos los campos estén completos.",
        });
      }
  
      // Validación de tipo de precio
      if (isNaN(price)) {
        return res.status(400).json({
          error: "El precio debe ser un número válido",
          details: `Precio recibido: ${price}`,
        });
      }
  
      // Convertir rooms a número si está presente
      const parsedRooms = rooms ? parseInt(rooms, 10) : null;
      if (rooms && isNaN(parsedRooms)) {
        return res.status(400).json({
          error: "El campo 'rooms' debe ser un número válido",
          details: `Valor recibido para 'rooms': ${rooms}`,
        });
      }
  
      // Crear la propiedad
      const newProperty = await Property.create({
        address,
        neighborhood,
        city,
        type,
        typeProperty,
        price,
        images,
        comision,
        escritura,
        matriculaOPadron: matriculaOPadron || null,
        frente: frente || null,
        profundidad: profundidad || null,
        linkInstagram: linkInstagram || null,
        rooms: parsedRooms, // Asignar parsedRooms al modelo
        isAvailable: true, // Si isAvailable debe tener un valor por defecto
        description: req.body.description || "", // Valor por defecto para description
        planType: req.body.planType || "", // Valor por defecto para planType
        plantQuantity: req.body.plantQuantity || 0, // Valor numérico por defecto
        bathrooms: req.body.bathrooms || 0, // Valor numérico por defecto
        highlights: req.body.highlights || "", // Valor por defecto para highlights
        socio,
        inventory,
        superficieCubierta,
        superficieTotal
      });
  
      // Responder con la propiedad creada
      res.status(201).json(newProperty);
    } catch (error) {
      console.error("Error al crear propiedad:", error);
      res.status(500).json({
        error: "Error al crear la propiedad",
        details: error.message,
        stack: error.stack,
      });
    }
  };
  

// GET: Obtener todas las propiedades de un cliente
exports.getPropertiesByIdClient = async (req, res) => {
  try {
    const { idClient } = req.params;
    const client = await Client.findByPk(idClient, {
      include: Property,
    });
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json(client.Properties);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener las propiedades del cliente",
        details: error.message,
      });
  }
};

exports.getPropertiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!["venta", "alquiler"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Tipo inválido. Debe ser "venta" o "alquiler".' });
    }

    const properties = await Property.findAll({ where: { type } });
    res.status(200).json(properties);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener las propiedades por tipo",
        details: error.message,
      });
  }
};

// PUT: Actualizar una propiedad
exports.updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updated = await Property.update(req.body, { where: { propertyId } });
    if (!updated[0]) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    res.status(200).json({ message: "Propiedad actualizada" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al actualizar la propiedad",
        details: error.message,
      });
  }
};

// DELETE: Eliminar una propiedad
exports.deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const deleted = await Property.destroy({ where: { propertyId } });
    if (!deleted) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    res.status(200).json({ message: "Propiedad eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al eliminar la propiedad",
        details: error.message,
      });
  }
};

exports.getFilteredProperties = async (req, res) => {
  try {
    const {
      type,
      city,
      neighborhood,
      priceMin,
      priceMax,
      rooms,
      typeProperty,
      planType,
      plantQuantity,
      bathrooms,
      escritura,
      comision,
      isAvailable,
      page = 1, // Página por defecto
      limit = 10, // Número de resultados por página
    } = req.query;

    // Validar precios (si priceMin existe, no debe ser mayor que priceMax)
    if (priceMin && priceMax && parseFloat(priceMin) > parseFloat(priceMax)) {
      return res.status(400).json({
        error: "El precio mínimo no puede ser mayor que el precio máximo.",
      });
    }

    // Construir el objeto 'where' para la consulta
    const where = {};

    if (type) where.type = type; // Tipo de propiedad (venta, alquiler)
    if (typeProperty) where.typeProperty = typeProperty; // Tipo específico (casa, departamento, etc.)
    if (city) where.city = city;
    if (neighborhood) where.neighborhood = neighborhood;
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price[Sequelize.Op.gte] = priceMin;
      if (priceMax) where.price[Sequelize.Op.lte] = priceMax;
    }
    if (rooms) where.rooms = rooms;
    if (planType) where.planType = planType;
    if (plantQuantity) where.plantQuantity = plantQuantity;
    if (bathrooms) where.bathrooms = bathrooms;
    // Filtro por escritura
    if (escritura) where.escritura = escritura;
    // Filtro por isAvailable, convirtiendo el string a booleano
    if (typeof isAvailable !== 'undefined') {
      where.isAvailable = isAvailable === 'true';
    }
    // Si necesitás filtrar por comision, se puede agregar igualmente:
    if (comision) where.comision = comision;

    // Paginación
    const offset = (page - 1) * limit; // Calcular el offset de la página actual
    const properties = await Property.findAll({
      where,
      limit, // Limitar la cantidad de resultados por página
      offset, // Desplazamiento para la paginación
    });

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      error: "Error al filtrar las propiedades",
      details: error.message,
    });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    // Obtener todas las propiedades con los clientes relacionados y sus roles
    const properties = await Property.findAll({
      include: [
        {
          model: Client,
          through: {
            attributes: ['role'], // Incluir solo el campo de rol desde la tabla intermedia
          },
          attributes: ['idClient', 'name', 'email', 'mobilePhone'], // Campos del cliente
        },
      ],
    });

    // Responder con las propiedades obtenidas
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error al obtener propiedades con clientes:", error);
    res.status(500).json({
      error: "Error al obtener propiedades con clientes",
      details: error.message,
    });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log('Params received:', req.params);
    console.log('Buscando propiedad con ID:', propertyId);

    // Convert propertyId to integer
    const id = parseInt(propertyId);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de propiedad inválido' });
    }

    const property = await Property.findByPk(id, {
      include: [
        {
          model: Client,
          through: {
            attributes: ['role'],
          },
          attributes: ['idClient', 'name', 'email', 'mobilePhone'],
        },
      ],
    });

    if (!property) {
      console.log('Propiedad no encontrada con ID:', id);
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    console.log('Propiedad encontrada:', JSON.stringify(property, null, 2));
    res.status(200).json(property);
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({
      error: 'Error al obtener la propiedad',
      details: error.message,
      stack: error.stack
    });
  }
};