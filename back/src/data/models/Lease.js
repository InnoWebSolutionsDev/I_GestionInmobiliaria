const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Lease",
    { 
      propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Property",
          key: "propertyId",  // O el PK que uses en el modelo Property
        },
      },
      landlordId: {
        // Propietario (landlord)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Client",
          key: "idClient",
        },
      },
      tenantId: {
        // Inquilino (tenant)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Client",
          key: "idClient",
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      rentAmount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      updateFrequency: {
        type: DataTypes.ENUM("semestral", "cuatrimestral", "anual"),
      },
      commission: {
        type: DataTypes.DECIMAL,
        validate: {
          min: 0,
          max: 100,
        },
      },
      totalMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      inventory: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "terminated"),
        allowNull: false,
        defaultValue: "active",
      },
      pdfPath: {
        type: DataTypes.STRING, // Store the file path
        allowNull: true, // The PDF is not required immediately
      },
    },
    {
      paranoid: true,
    }
  );
};