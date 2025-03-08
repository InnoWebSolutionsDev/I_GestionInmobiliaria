require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_DEPLOY
  } = require('../config/envs');
//-------------------------------- CONFIGURACION PARA TRABAJAR LOCALMENTE-----------------------------------
// const sequelize = new Sequelize(
//   `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
//   {
//     logging: false, // set to console.log to see the raw SQL queries
//     native: false,  // lets Sequelize know we can use pg-native for ~30% more speed
//     timezone: '-03:00', // Configura la zona horaria GMT-3 (Argentina)
//   }
// );
//-------------------------------------CONFIGURACION PARA EL DEPLOY---------------------------------------------------------------------
const sequelize = new Sequelize(DB_DEPLOY, {
  logging: false, 
  native: false,  
  timezone: '-03:00', 
});

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { 
  Admin, 
  Client, 
  Garantor, 
  Property, 
  Lease, 
  PaymentReceipt, 
  ClientProperty, 
  SaleContract 
} = sequelize.models;

// 1. Relaciones entre Client y Property a través de ClientProperty (many-to-many)
Client.belongsToMany(Property, { through: ClientProperty, foreignKey: 'clientId' });
Property.belongsToMany(Client, { through: ClientProperty, foreignKey: 'propertyId' });

// 2. Relaciones para Lease
// Relación con Property: Cada contrato (Lease) está asociado a una propiedad
Lease.belongsTo(Property, { foreignKey: 'propertyId' });
Property.hasOne(Lease, { foreignKey: 'propertyId' });

// Relación del contrato con el propietario (landlord)
// Se usa el alias "Landlord" para identificar al cliente que es propietario
Lease.belongsTo(Client, { as: 'Landlord', foreignKey: 'landlordId' });
Client.hasMany(Lease, { as: 'LeasesAsLandlord', foreignKey: 'landlordId' });

// Relación del contrato con el inquilino (tenant)
// Se usa el alias "Tenant" para identificar al cliente que es inquilino
Lease.belongsTo(Client, { as: 'Tenant', foreignKey: 'tenantId' });
Client.hasMany(Lease, { as: 'LeasesAsTenant', foreignKey: 'tenantId' });
// 3. Relaciones para SaleContract
// Relación SaleContract - Property (uno a uno)
SaleContract.belongsTo(Property, { foreignKey: 'propertyId' });
Property.hasOne(SaleContract, { foreignKey: 'propertyId' });

// Relación SaleContract - Client (vendedor y comprador)
SaleContract.belongsTo(Client, { as: 'Seller', foreignKey: 'sellerId' });
SaleContract.belongsTo(Client, { as: 'Buyer', foreignKey: 'buyerId' });
Client.hasMany(SaleContract, { as: 'Sales', foreignKey: 'sellerId' });
Client.hasMany(SaleContract, { as: 'Purchases', foreignKey: 'buyerId' });

// 4. Relaciones para Garantor
// Un contrato (Lease) puede tener varios avalistas (Garantor)
Lease.hasMany(Garantor, { foreignKey: 'leaseId' });
Garantor.belongsTo(Lease, { foreignKey: 'leaseId' });

// 5. Relaciones para PaymentReceipt
// Un contrato (Lease) puede tener varios recibos de pago
PaymentReceipt.belongsTo(Lease, { foreignKey: 'leaseId' });
Lease.hasMany(PaymentReceipt, { foreignKey: 'leaseId' });

// Un recibo de pago está asociado a un cliente
PaymentReceipt.belongsTo(Client, { foreignKey: 'idClient' });
Client.hasMany(PaymentReceipt, { foreignKey: 'idClient' });





//---------------------------------------------------------------------------------//
module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
