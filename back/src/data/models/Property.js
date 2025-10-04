const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Property",
    {
      propertyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      neighborhood: {
        type: DataTypes.STRING,
      },
      socio:{
      type: DataTypes.STRING,
      allowNull: true,
    },
      
      city: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM("venta", "alquiler"),
        allowNull: false,
      },
      typeProperty: {
        type: DataTypes.ENUM(
          "casa",
          "departamento",
          "duplex",
          "finca",
          "local",
          "oficina",
          "lote",
          "terreno"
        ),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          min: 0, // Precio no puede ser negativo
        },
      },
      rooms: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0, // Número mínimo de habitaciones
        },
      },

      comision: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          min: 0, // No puede ser menor al 0%
          max: 100, // No puede ser mayor al 100%
        },
      },

      isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Por defecto, la propiedad está disponible
      },

      description: {
        type: DataTypes.TEXT,
      },
      escritura: {
        type: DataTypes.ENUM(
          "prescripcion en tramite",
          "escritura",
          "prescripcion adjudicada",
          "posesion"
        ),
        allowNull: false,
      },

      matriculaOPadron: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },

      // Campos específicos para lotes
      frente: {
        type: DataTypes.STRING,
        allowNull: true, // Solo aplicable para lotes
      },
      
      profundidad: {
        type: DataTypes.STRING,
        allowNull: true, // Solo aplicable para lotes
      },

      // Link de Instagram para todas las propiedades
      linkInstagram: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Debe ser una URL válida"
          }
        },
      },

      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: true,
      },
      plantType: {
        type: DataTypes.STRING,
        allowNull: true, // Solo aplicable para fincas
      },
      plantQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true, // Solo aplicable para fincas
        validate: {
          min: 0, // No puede ser negativo
        },
      },
      bathrooms: {
        type: DataTypes.INTEGER,
      },
      highlights: {
        type: DataTypes.TEXT,
      },
      inventory:{
        type: DataTypes.TEXT,
        allowNull: true,
      },
      superficieCubierta:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      superficieTotal:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      
    },
    {
      freezeTableName: true,
      paranoid: true,
    }
  );
};
