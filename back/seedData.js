const { Property, Client, Lease, PaymentReceipt, Admin, conn: sequelize } = require('./src/data/index.js');

// Función para generar CUIL válido
function generateValidCuil(dni, type = 20) {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const prefix = type.toString().padStart(2, '0');
  const cuilBase = `${prefix}${dni.toString().padStart(8, '0')}`;
  const digits = cuilBase.split('').map(Number);

  const checksum = digits.reduce(
    (acc, digit, index) => acc + digit * weights[index],
    0
  );
  const mod11 = 11 - (checksum % 11);
  const verifier = mod11 === 11 ? 0 : mod11 === 10 ? 9 : mod11;

  return `${prefix}-${dni.toString().padStart(8, '0')}-${verifier}`;
}

const seedData = async () => {
  try {
    console.log('🌱 Iniciando carga de datos de prueba...');

    // Verificar si ya existen datos
    const existingProperties = await Property.count();
    const existingClients = await Client.count();
    
    if (existingProperties > 0 || existingClients > 0) {
      console.log('⚠️  Ya existen datos en la base de datos.');
      console.log(`Propiedades: ${existingProperties}, Clientes: ${existingClients}`);
      console.log('¿Deseas continuar? Esto agregará más datos de prueba.');
    }

    // Crear Admin de prueba
    const adminData = {
      username: 'admin',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
      role: 'admin'
    };

    const [admin, adminCreated] = await Admin.findOrCreate({
      where: { username: adminData.username },
      defaults: adminData
    });

    if (adminCreated) {
      console.log('✅ Admin creado:', admin.username);
    } else {
      console.log('ℹ️  Admin ya existe:', admin.username);
    }

    // Crear clientes de prueba con CUILs válidos generados
    const clientsData = [
      {
        cuil: generateValidCuil(12345678, 20),
        name: 'Juan Carlos Pérez',
        email: 'juan.perez@email.com',
        direccion: 'Av. Libertador 1234, CABA',
        ciudad: 'CABA',
        provincia: 'Buenos Aires',
        mobilePhone: '1123456789'
      },
      {
        cuil: generateValidCuil(87654321, 27),
        name: 'María Elena Rodríguez',
        email: 'maria.rodriguez@email.com',
        direccion: 'Calle San Martín 567, Rosario',
        ciudad: 'Rosario',
        provincia: 'Santa Fe',
        mobilePhone: '3419876543'
      },
      {
        cuil: generateValidCuil(11223344, 23),
        name: 'Carlos Alberto Fernández',
        email: 'carlos.fernandez@email.com',
        direccion: 'Belgrano 890, Córdoba',
        ciudad: 'Córdoba',
        provincia: 'Córdoba',
        mobilePhone: '3514567890'
      },
      {
        cuil: generateValidCuil(55667788, 27),
        name: 'Ana Sofía González',
        email: 'ana.gonzalez@email.com',
        direccion: 'Mitre 345, La Plata',
        ciudad: 'La Plata',
        provincia: 'Buenos Aires',
        mobilePhone: '2212345678'
      },
      {
        cuil: generateValidCuil(99887766, 20),
        name: 'Roberto Daniel López',
        email: 'roberto.lopez@email.com',
        direccion: 'Rivadavia 1122, Mendoza',
        ciudad: 'Mendoza',
        provincia: 'Mendoza',
        mobilePhone: '2613456789'
      }
    ];

    const clients = [];
    for (const clientData of clientsData) {
      const [client, created] = await Client.findOrCreate({
        where: { cuil: clientData.cuil },
        defaults: clientData
      });
      clients.push(client);
      if (created) {
        console.log('✅ Cliente creado:', client.name);
      } else {
        console.log('ℹ️  Cliente ya existe:', client.name);
      }
    }

    // Crear propiedades de prueba
    const propertiesData = [
      {
        address: 'Av. Corrientes 1234, CABA',
        neighborhood: 'San Nicolás',
        socio: 'Inmobiliaria Central',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'alquiler',
        typeProperty: 'departamento',
        price: 85000,
        rooms: 2,
        comision: 10, // Porcentaje, no monto
        description: 'Moderno departamento de 2 ambientes en pleno microcentro. Ideal para profesionales.',
        escritura: 'escritura',
        isAvailable: true,
        bathrooms: 1,
        highlights: 'Ubicación céntrica, transporte público',
        superficieCubierta: '45',
        superficieTotal: '45'
      },
      {
        address: 'Calle Florida 567, CABA',
        neighborhood: 'Retiro',
        socio: 'Propiedades Premium',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'alquiler',
        typeProperty: 'departamento',
        price: 120000,
        rooms: 3,
        comision: 8,
        description: 'Elegante departamento de 3 ambientes con balcón y vista a la ciudad.',
        escritura: 'escritura',
        isAvailable: true,
        bathrooms: 2,
        highlights: 'Balcón, vista panorámica, amenities',
        superficieCubierta: '65',
        superficieTotal: '65'
      },
      {
        address: 'San Martín 890, Palermo',
        neighborhood: 'Palermo Hollywood',
        socio: 'Urbana Propiedades',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'alquiler',
        typeProperty: 'casa',
        price: 180000,
        rooms: 4,
        comision: 12,
        description: 'Casa moderna de 4 ambientes con patio y parrilla en Palermo Hollywood.',
        escritura: 'escritura',
        isAvailable: true,
        bathrooms: 2,
        highlights: 'Patio, parrilla, zona trendy',
        superficieCubierta: '100',
        superficieTotal: '120'
      },
      {
        address: 'Belgrano 1122, Villa Crespo',
        neighborhood: 'Villa Crespo',
        socio: 'Inversiones del Sur',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'venta',
        typeProperty: 'departamento',
        price: 95000000,
        rooms: 2,
        comision: 3,
        description: 'Departamento en venta, ideal para inversión. Muy buena ubicación.',
        escritura: 'escritura',
        isAvailable: true,
        bathrooms: 1,
        highlights: 'Ideal inversión, bien ubicado',
        superficieCubierta: '55',
        superficieTotal: '55'
      },
      {
        address: 'Av. Santa Fe 2345, Recoleta',
        neighborhood: 'Recoleta',
        socio: 'Elite Properties',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'venta',
        typeProperty: 'departamento',
        price: 150000000,
        rooms: 3,
        comision: 3,
        description: 'Exclusivo departamento en Recoleta con amenities y cochera.',
        escritura: 'escritura',
        isAvailable: true,
        bathrooms: 2,
        highlights: 'Amenities, cochera, zona premium',
        superficieCubierta: '85',
        superficieTotal: '85'
      },
      {
        address: 'Libertad 678, San Telmo',
        neighborhood: 'San Telmo',
        socio: 'Histórica Inmobiliaria',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'alquiler',
        typeProperty: 'departamento',
        price: 95000,
        rooms: 1,
        comision: 10,
        description: 'Loft tipo industrial en el corazón de San Telmo.',
        escritura: 'escritura',
        isAvailable: false, // Ocupada
        bathrooms: 1,
        highlights: 'Estilo industrial, zona histórica',
        superficieCubierta: '40',
        superficieTotal: '40'
      },
      {
        address: 'Tucumán 1567, Once',
        neighborhood: 'Once',
        socio: 'Comercial Propiedades',
        city: 'Ciudad Autónoma de Buenos Aires',
        type: 'alquiler',
        typeProperty: 'local',
        price: 200000,
        rooms: 0,
        comision: 10,
        description: 'Local comercial en zona de alto tránsito peatonal.',
        escritura: 'escritura',
        isAvailable: true,
        bathrooms: 1,
        highlights: 'Alto tránsito, zona comercial',
        superficieCubierta: '80',
        superficieTotal: '80'
      },
      {
        address: 'Maipú 3456, Rosario',
        neighborhood: 'Centro',
        socio: 'Rosario Properties',
        city: 'Rosario',
        type: 'venta',
        typeProperty: 'casa',
        price: 75000000,
        rooms: 5,
        comision: 3,
        description: 'Casa familiar de 5 ambientes con jardín y garage doble.',
        escritura: 'escritura',
        isAvailable: false, // Vendida
        bathrooms: 3,
        highlights: 'Jardín, garage doble, familiar',
        superficieCubierta: '130',
        superficieTotal: '150'
      }
    ];

    const properties = [];
    for (const propertyData of propertiesData) {
      const [property, created] = await Property.findOrCreate({
        where: { address: propertyData.address },
        defaults: propertyData
      });
      properties.push(property);
      if (created) {
        console.log('✅ Propiedad creada:', property.address);
      } else {
        console.log('ℹ️  Propiedad ya existe:', property.address);
      }
    }

    // Crear algunos contratos de alquiler de prueba
    const leaseData = [
      {
        propertyId: properties[0].propertyId, // Av. Corrientes
        landlordId: clients[3].idClient, // Ana Sofía González (propietaria)
        tenantId: clients[0].idClient, // Juan Carlos Pérez (inquilino)
        startDate: new Date('2024-01-15'),
        rentAmount: 85000,
        updateFrequency: 'cuatrimestral',
        commission: 10,
        totalMonths: 12,
        inventory: 'Heladera, lavarropas, microondas, muebles de cocina.',
        status: 'active'
      },
      {
        propertyId: properties[1].propertyId, // Calle Florida
        landlordId: clients[4].idClient, // Roberto Daniel López (propietario)
        tenantId: clients[1].idClient, // María Elena Rodríguez (inquilina)
        startDate: new Date('2024-03-01'),
        rentAmount: 120000,
        updateFrequency: 'semestral',
        commission: 8,
        totalMonths: 12,
        inventory: 'Aire acondicionado, heladera, lavarropas, mobiliario completo.',
        status: 'active'
      },
      {
        propertyId: properties[5].propertyId, // Libertad (ya ocupada)
        landlordId: clients[0].idClient, // Juan Carlos Pérez (propietario)
        tenantId: clients[2].idClient, // Carlos Alberto Fernández (inquilino)
        startDate: new Date('2023-09-01'),
        rentAmount: 95000,
        updateFrequency: 'anual',
        commission: 12,
        totalMonths: 12,
        inventory: 'Sin mobiliario, solo electrodomésticos básicos.',
        status: 'active'
      }
    ];

    const leases = [];
    for (const lease of leaseData) {
      const [leaseRecord, created] = await Lease.findOrCreate({
        where: { 
          propertyId: lease.propertyId,
          tenantId: lease.tenantId,
          startDate: lease.startDate
        },
        defaults: lease
      });
      leases.push(leaseRecord);
      if (created) {
        console.log('✅ Contrato creado:', `Propiedad ${lease.propertyId} - Inquilino ${lease.tenantId}`);
      } else {
        console.log('ℹ️  Contrato ya existe:', `Propiedad ${lease.propertyId} - Inquilino ${lease.tenantId}`);
      }
    }

    // Crear algunos pagos de prueba
    const paymentsData = [
      {
        leaseId: leases[0].id,
        amount: 85000,
        paymentDate: new Date('2024-01-15'),
        period: 'Enero 2024',
        installmentNumber: 1,
        totalInstallments: 12,
        type: 'installment',
        status: 'paid'
      },
      {
        leaseId: leases[0].id,
        amount: 85000,
        paymentDate: new Date('2024-02-15'),
        period: 'Febrero 2024',
        installmentNumber: 2,
        totalInstallments: 12,
        type: 'installment',
        status: 'paid'
      },
      {
        leaseId: leases[1].id,
        amount: 120000,
        paymentDate: new Date('2024-03-01'),
        period: 'Marzo 2024',
        installmentNumber: 1,
        totalInstallments: 12,
        type: 'installment',
        status: 'paid'
      },
      {
        leaseId: leases[1].id,
        amount: 12000,
        paymentDate: new Date('2024-03-01'),
        period: 'Comisión Marzo 2024',
        installmentNumber: 1,
        totalInstallments: 1,
        type: 'commission',
        status: 'paid'
      },
      {
        leaseId: leases[2].id,
        amount: 95000,
        paymentDate: new Date('2024-04-01'),
        period: 'Abril 2024',
        installmentNumber: 7,
        totalInstallments: 12,
        type: 'installment',
        status: 'paid'
      }
    ];

    for (const payment of paymentsData) {
      const [paymentRecord, created] = await PaymentReceipt.findOrCreate({
        where: { 
          leaseId: payment.leaseId,
          paymentDate: payment.paymentDate,
          period: payment.period
        },
        defaults: payment
      });
      if (created) {
        console.log('✅ Pago creado:', `${payment.amount} - ${payment.period}`);
      } else {
        console.log('ℹ️  Pago ya existe:', `${payment.amount} - ${payment.period}`);
      }
    }

    console.log('\n🎉 ¡Datos de prueba cargados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`👥 Clientes: ${await Client.count()}`);
    console.log(`🏠 Propiedades: ${await Property.count()}`);
    console.log(`📋 Contratos: ${await Lease.count()}`);
    console.log(`💰 Pagos: ${await PaymentReceipt.count()}`);
    console.log(`👨‍💼 Admins: ${await Admin.count()}`);

    console.log('\n📝 Datos de login:');
    console.log('Usuario: admin');
    console.log('Contraseña: password');

  } catch (error) {
    console.error('❌ Error al cargar datos de prueba:', error);
  }
};

module.exports = seedData;

// Si se ejecuta directamente
if (require.main === module) {
  sequelize.sync({ force: false }).then(() => {
    console.log('🔄 Base de datos sincronizada');
    return seedData();
  }).then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}