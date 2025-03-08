const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('SaleContract', {

    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    saleDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    salePrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    commission: {
      type: DataTypes.DECIMAL,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Properties',
        key: 'propertyId',
      },
      allowNull: false,
    },
    sellerId: {
      // Vendedor de la propiedad
      type: DataTypes.INTEGER,
      references: {
        model: 'Client',
        key:'idClient',
      },
      allowNull: false,
    },
    buyerId: {
      // Comprador
      type: DataTypes.INTEGER,
      references: {
        model: 'Client',
        key:'idClient',
      },
      allowNull: false,
    },
  });
};
