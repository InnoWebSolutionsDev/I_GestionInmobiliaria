import PropTypes from 'prop-types';
import jsPDF from 'jspdf';


const ContratoAlquiler = ({ owner, tenant, property, lease, guarantors }) => {
  const generatePdf = () => {
    const doc = new jsPDF();
    const maxWidth = 170;
    let currentY = 15;
    const bottomMargin = 20; // Define el margen inferior deseado

    // Función helper para agregar texto con salto de línea automático
    const addText = (text, y) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, 20, y);
      return y + lines.length * 7;
    };

    // Helper function to check if adding more content exceeds the bottom margin
    const isPageBreakNeeded = (contentHeight) => {
      return currentY + contentHeight + bottomMargin > doc.internal.pageSize.getHeight();
    };

    // Helper function to add a new page if needed
    const addPageIfNecessary = (contentHeight) => {
      if (isPageBreakNeeded(contentHeight)) {
        doc.addPage();
        currentY = 15; // Reset currentY to the top of the new page
      }
    };

    // Helper function to format date in Spanish
    const formatearFecha = (fecha) => {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(fecha).toLocaleDateString("es-ES", options);
    };

    // Helper function to calculate end date
    const calcularFechaFin = (fechaInicio, meses) => {
      const fecha = new Date(fechaInicio);
      fecha.setMonth(fecha.getMonth() + meses);
      return fecha;
    };

    const getUsoPropiedad = (typeProperty) => {
      const usoComercial = ["oficina", "local", "finca"];
      const usoVivienda = ["casa", "departamento", "duplex"];
      const usoTerreno = ["lote", "terreno"];

      if (usoComercial.includes(typeProperty)) return "comercial";
      if (usoVivienda.includes(typeProperty)) return "vivienda particular";
      if (usoTerreno.includes(typeProperty)) return "terreno";
      return "vivienda particular"; // default
    };

    const numeroALetras = (numero) => {
      const unidades = [
        "",
        "uno",
        "dos",
        "tres",
        "cuatro",
        "cinco",
        "seis",
        "siete",
        "ocho",
        "nueve",
      ];
      const decenas = [
        "",
        "diez",
        "veinte",
        "treinta",
        "cuarenta",
        "cincuenta",
        "sesenta",
        "setenta",
        "ochenta",
        "noventa",
      ];
      const centenas = [
        "",
        "ciento",
        "doscientos",
        "trescientos",
        "cuatrocientos",
        "quinientos",
        "seiscientos",
        "setecientos",
        "ochocientos",
        "novecientos",
      ];
      const miles = [
        "",
        "mil",
        "dos mil",
        "tres mil",
        "cuatro mil",
        "cinco mil",
        "seis mil",
        "siete mil",
        "ocho mil",
        "nueve mil",
      ];

      // Handle special cases
      if (numero === 0) return "cero";
      if (numero === 100) return "cien";
      if (numero === 1000) return "mil";

      let texto = "";

      // Handle thousands
      if (numero >= 1000) {
        const millar = Math.floor(numero / 1000);
        texto += miles[millar] + " ";
        numero %= 1000;
      }

      // Handle hundreds
      if (numero >= 100) {
        const centena = Math.floor(numero / 100);
        texto += centenas[centena] + " ";
        numero %= 100;
      }

      // Handle tens and units
      if (numero > 0) {
        if (numero < 10) {
          texto += unidades[numero];
        } else {
          const decena = Math.floor(numero / 10);
          const unidad = numero % 10;
          texto += decenas[decena];
          if (unidad > 0) {
            texto += " y " + unidades[unidad];
          }
        }
      }

      return texto.trim();
    };

    const formatearMonto = (monto) => {
      const numero = Number(monto);
      return `${numeroALetras(
        numero
      ).toUpperCase()} PESOS (${new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(numero)})`;
    };

    // Título del contrato
    doc.setFontSize(16);
    doc.text("CONTRATO DE LOCACIÓN", 105, currentY, { align: "center" });

    // Volver al tamaño de fuente normal
    doc.setFontSize(12);
    currentY += 20;

    // Encabezado con fecha
    const fechaInicio = new Date(lease.startDate).toLocaleDateString("es-AR");
    addPageIfNecessary(10); // Check if adding the date exceeds the bottom margin
    currentY = addText(
      `En Belen, Provincia de Buenos Aires, a los ${fechaInicio},`,
      currentY
    );

    // Datos de las partes
    const partesText = property.socio
      ? `Entre el Sr/Sra. ${owner.name}, CUIL ${lease.Landlord.cuil}, con domicilio en ${lease.Landlord.direccion}, 
    de la ciudad de ${tenant.ciudad}, en carácter de propietario junto con ${property.socio}, 
    en adelante denominados "LOS LOCADORES", por una parte, y por la otra el Sr/Sra ${tenant.name}, 
    CUIL ${tenant.cuil}, con domicilio en ${tenant.direccion}, ${tenant.ciudad}, ${tenant.provincia}, 
    en adelante denominado "LOCATARIO", correo electrónico ${tenant.email}, télefono ${tenant.mobilephone}, convienen en celebrar el presente contrato de locación, 
    sujeto a las siguientes cláusulas y condiciones:`
      : `Entre el Sr/Sra. ${owner.name}, CUIL ${lease.Landlord.cuil}, con domicilio en ${lease.Landlord.direccion}, 
    de la ciudad de ${tenant.ciudad}, en adelante denominado "EL LOCADOR", por una parte, y por la otra 
    el Sr/Sra ${tenant.name}, CUIL ${tenant.cuil}, con domicilio en ${tenant.direccion}, ${tenant.ciudad}, 
    ${tenant.provincia}, en adelante denominado "EL LOCATARIO", convienen en celebrar el presente contrato de locación, 
    sujeto a las siguientes cláusulas y condiciones:`;

    addPageIfNecessary(10); // Check if adding the parties text exceeds the bottom margin
    currentY = addText(partesText, currentY + 10);

    // Primera cláusula - Objeto
    const objetoText = `PRIMERA: Objeto. El locador da en locación al locatario y el locatario acepta de conformidad 
el inmueble sito en ${property.address}, ${
      property.city
    }, en adelante denominado el "INMUEBLE LOCADO" 
para ser destinado a ${getUsoPropiedad(
      property.typeProperty
    )}; no pudiéndose cambiar el destino de uso. 
Superficie cubierta: ${property.superficieCubierta}, Superficie total: ${
      property.superficieTotal
    }. 
${
  property.typeProperty !== "lote" && property.typeProperty !== "terreno"
    ? `El inmueble cuenta con ${property.rooms} ambientes y ${property.bathrooms} baños.`
    : ""
}`;

    addPageIfNecessary(10); // Check if adding the object text exceeds the bottom margin
    currentY = addText(objetoText, currentY + 10);

    // Segunda cláusula - Plazo
    const plazoText = `SEGUNDA: Manifestación. -Las personas anteriormente mencionadas manifiestan no tener capacidad restringida para este acto y convienen en celebrar el presente CONTRATO DE LOCACION DE VIVIENDA, en adelante denominado “CONTRATO”, a regirse por el Código civil y Comercial de la Nación, leyes aplicables y las cláusulas siguientes:   convienen en celebrar el presente contrato de locación, sujeto a las siguientes cláusulas y condiciones: `;

    addPageIfNecessary(10); // Check if adding the term text exceeds the bottom margin
    currentY = addText(plazoText, currentY + 10);

    // Tercera cláusula - Precio
    const precioText = `TERCERA: Descripción. El locatario declara conocer y aceptar el inmueble en el estado en que se encuentra, prestando conformidad por haberlo visitado e inspeccionado antes de ahora, la propiedad cuenta con: ${property.description} y todas las demás especificaciones contenidas en clausula anexa al presente contrato de locación. `;

    addPageIfNecessary(10); // Check if adding the price text exceeds the bottom margin
    currentY = addText(precioText, currentY + 10);

    const startDate = new Date(lease.startDate);
    const endDate = calcularFechaFin(startDate, lease.totalMonths);

    const cuartaClausulaText = `CUARTA: Plazo del contrato. El plazo de la locación será de ${numeroALetras(
      lease.totalMonths
    )} 
    (${
      lease.totalMonths
    }) meses, los mismos se computarán a partir del ${formatearFecha(
      startDate
    )}, 
    y hasta el día ${formatearFecha(
      endDate
    )}, recibiendo del locatario la tenencia del inmueble en el día de la fecha. 
    Es obligación del locatario restituir al término de la locación el inmueble desocupado y en buen estado conforme 
    a los art.1206 y 1207 del CCCN. Si ello no fuere cumplido se cobrará una multa equivalente al 0.4% diario sobre 
    el ultimo alquiler hasta la entrega efectiva del inmueble locado y en las condiciones que le fue entregado.`;

    addPageIfNecessary(10); // Check if adding the fourth clause text exceeds the bottom margin
    currentY = addText(cuartaClausulaText, currentY + 10);

    const quintaClausulaText = `QUINTA: Precio: El precio del alquiler se fija de común acuerdo entre las partes 
por la suma de ${formatearMonto(lease.rentAmount)} para el ${
      lease.updateFrequency === "semestral"
        ? "primer semestre"
        : lease.updateFrequency === "anual"
        ? "primer año"
        : "primer cuatrimestre"
    } de locación. Para los ${
      lease.updateFrequency === "semestral"
        ? "siguientes semestres"
        : lease.updateFrequency === "anual"
        ? "siguientes años"
        : "siguientes cuatrimestres"
    } el precio será actualizado conforme al Índice de precios al consumidor (IPC) que confecciona y publica 
   el Instituto Nacional de Estadísticas y Censos (INDEC). Si por una disposición legal y futura, los alquileres se vieren grabados con el pago del impuesto al valor agregado (IVA), EL LOCATARIO deberá adicionar al monto mensual a pagar en concepto de canon locativo, el porcentual correspondiente al IVA. EL LOCATARIO abonará el alquiler en efectivo en moneda de curso legal, y por adelantado del 1º al 10º del mes en el local comercial de Q+L Servicios Inmobiliarios sito en Av. Gobernador Cubas N° 50 de la ciudad de Belén, o bien en el domicilio que en un futuro designe el LOCADOR. Por el presente acto el LOCADOR comunica al LOCATARIO  que constituye a Q+L Servicios inmobiliarios, en adelante EL ADMINISTRADOR como su representante, quedando éste facultado para actuar en su nombre en cualquier cuestión que emane del presente, percibir los alquileres mensuales y extender los correspondientes recibos de pago, también para conservar y archivar los comprobantes de pago de todos los impuestos, y servicios a cargo del LOCATARIO, quien tendrá por constancia de pago el asiento de los mismos en los recibos de pago del alquiler. La falta de pago producirá un interés equivalente al 1,5% diario contado a partir del primer día del mes en mora. 
   El pago se pacta por periodo de mes entero y aunque el locatario desocupará el inmueble antes de finalizar el mes, deberá abonar íntegramente el alquiler correspondiente al mismo. `;

    addPageIfNecessary(10); // Check if adding the fifth clause text exceeds the bottom margin
    currentY = addText(quintaClausulaText, currentY + 10);

    // Sexto  Morosidad
    const sextaClausulaText = `SEXTA: Mora. -La mora del locatario en el pago del alquiler será automática y se producirá por el solo vencimiento del plazo, sin necesidad de requerimiento judicial o extrajudicial alguno, como así también respecto a todas y cada una de las obligaciones asumidas en este contrato. Sin perjuicio del derecho que tiene el locador para exigir, en caso de mora y a más del interés pactado, el inmediato desalojo del inmueble ante la falta de pago de dos períodos del alquiler convenido. Si el locatario diera motivo, por cualquier causa, a que se le iniciará juicio por desalojo, se compromete a pagar, desde la iniciación del juicio y hasta que el locador reciba las llaves del inmueble, una suma igual al doble de los alquileres que correspondan; la entrega de las llaves del inmueble, deberá justificarla el locatario por un documento emanado por el locador, no admitiéndose otro medio de prueba. `;
    addPageIfNecessary(10); // Check if adding the sixth clause text exceeds the bottom margin
    currentY = addText(sextaClausulaText, currentY + 10);

    const serviciosEImpuestos = `SEPTIMO: Servicios e impuestos. El locatario tiene a su cargo el pago en tiempo y forma del servicio de energía eléctrica y el servicio de agua potable. El locador tiene a su cargo las cargas y contribuciones que graven el inmueble (impuesto inmobiliario). Es obligación de la parte Locataria entregar mensualmente las boletas con su correspondiente comprobante de pago de las obligaciones a su cargo, o en su defecto enviarlas en formato PDF vía mail a Q+L servicios inmobiliarios `;
    addPageIfNecessary(10); // Check if adding the services and taxes text exceeds the bottom margin
    currentY = addText(serviciosEImpuestos, currentY + 10);

    const titularidadServicios = `OCTAVO: En caso de hallarse los servicios conectados, el locatario dentro de los treinta (30) días, transferirá a su nombre los servicios públicos, electricidad, servicio de tv e internet, solicitándolos a su costo y cargo. Para el caso de registrarse deuda previa a este contrato en alguno de estos servicios, el locatario podrá cancelarla y compensar lo invertido de próximos alquileres. Esta decisión deberá anticipársela por vía electrónica al locador. Al retirarse del inmueble el locatario deberá dar de baja dichos servicios. Al servicio de energía eléctrica el locatario deberá hacer cambio de titularidad. `;
    addPageIfNecessary(10); // Check if adding the ownership of services text exceeds the bottom margin
    currentY = addText(titularidadServicios, currentY + 10);

    const mejorasReformas = `NOVENO: Mejoras y reformas. El locatario no podrá hacer modificaciones de ninguna naturaleza en la propiedad, sin consentimiento previo del locador expresado por vía electrónica. De ser autorizadas las mismas quedarán en beneficio de la propiedad locada, sin que genere derecho a reclamo o Indemnización a favor del locatario. `;
    addPageIfNecessary(10); // Check if adding the improvements and reforms text exceeds the bottom margin
    currentY = addText(mejorasReformas, currentY + 10);

    const prohibiciones = `DECIMO: Prohibiciones. Queda prohibido al locatario ceder o subarrendar total o parcialmente el inmueble, sin consentimiento del locador, ya sea en forma gratuita u onerosa. Asimismo, queda estrictamente prohibido usarlo indebidamente por el locatario contrariando las leyes, la moral y las buenas costumbres, ni darle otro destino que el establecido. El locatario no puede depositar materiales o residuos inflamables, tóxicos y/o peligrosos en el inmueble lacado que pudieran atentar la seguridad de las personas, objetos, instalaciones o de la propiedad misma.  `;
    addPageIfNecessary(10); // Check if adding the prohibitions text exceeds the bottom margin
    currentY = addText(prohibiciones, currentY + 10);

    const responsabilidades = `DECIMO PRIMERO: Responsabilidades. 
    El locatario tiene a su cargo la obligación de mantener el inmueble y 
    restituirlo en el estado que lo recibió, 
    excepto por deterioros ocasionados por el mero transcurso del tiempo y 
    por el uso regular. El locador no se responsabiliza por daños, perjuicio, 
    lesiones que puedan producirse al locatario o a las personas que pudieren 
    encontrarse en el inmueble, que resulten como consecuencia de la acción u 
    omisión del Locatario y/o terceros por el uso y goce del inmueble, 
    ni como consecuencia de inundaciones, filtraciones, 
    incendios total o parcial, ruinas, desprendimientos, roturas, 
    desperfecto de cualquier tipo y/o por caso fortuito o de fuerza mayor y 
    sus consecuencias. 
    COMPENSACION: En el supuesto anterior los gastos emergentes, podrán ser compensados de pleno derecho por el Locatario con los cánones locativos, previa notificación fehaciente al locador del detalle de estos. Todo intento de compensación deberá estar avalado con la documentación respaldatoria consistente en las facturas, contratos de obra y detalles de los trabajos y gastos incurridos. `;
    addPageIfNecessary(10); // Check if adding the responsibilities text exceeds the bottom margin
    currentY = addText(responsabilidades, currentY + 10);

    const reparaciones = `DECIMO SEGUNDO: Reparaciones. El locatario notificará debidamente al Locador para que efectuase alguna reparación urgente, y en el caso de negativa o silencio de este una vez transcurridos al menos veinticuatro (24) horas corridas contadas a partir de la recepción de la notificación, el locatario puede realizarlo por si con cargo al Locador. `;
    addPageIfNecessary(10); // Check if adding the repairs text exceeds the bottom margin
    currentY = addText(reparaciones, currentY + 10);

    const finalizacion = `DECIMO TERCERO: La finalización del presente contrato, por cualquier modalidad de extinción, se formalizará a través del acta de restitución y entrega de llaves, que el locador, en este acto autoriza a la inmobiliaria que administra el cobro de alquileres, a confeccionarla y cuyo texto será enviado por la inmobiliaria al locatario 48hs de la entrega. El acta informará la fecha y hora de entrega, los nombres completos de los presentes y el carácter de su intervención; detallará el estado del inmueble.  `;
    addPageIfNecessary(10); // Check if adding the termination text exceeds the bottom margin
    currentY = addText(finalizacion, currentY + 10);

    const estadoDelBienLocado = `DECIMO CUARTO: A los efectos de la restitución del inmueble, una vez vencido el término contractual, se aclara que el LOCATARIO deberá proceder de la siguiente manera:
El inmueble deberá restituirse en el mismo buen estado de conservación e higiene en que fue entregado y según consta en el anexo Nº1.
El LOCATARIO no podrá eludir esta obligación contraída en el presente, dejando aclarado que el LOCADOR y/o sus representantes no están obligados a recibir el inmueble  si no se diera cumplimiento a lo estipulado anteriormente, haciéndose punible el  LOCATARIO de la penalidad establecida en el presente o la demora en la entrega del inmueble y a satisfacer el importe de alquiler mensual por todo el tiempo necesario que transcurra hasta que los desperfectos o deterioros sean reparados, o hasta que las deudas por servicios e impuestos sean canceladas`;
    addPageIfNecessary(10); // Check if adding the condition of the leased property text exceeds the bottom margin
    currentY = addText(estadoDelBienLocado, currentY + 10);

    // Garantes
    const guarantorsList = guarantors?.guarantors || [];
    if (guarantorsList.length > 0) {
      addPageIfNecessary(10); // Check if adding the guarantors text exceeds the bottom margin
      currentY += 10;
      doc.text("GARANTES:", 20, currentY);
      currentY += 10;

      guarantorsList.forEach((guarantor, index) => {
        const guarantorText = `${index + 1}. ${guarantor.name} - CUIL: ${
          guarantor.cuil
        }
        Domicilio: ${guarantor.address}
        Documentación presentada: ${guarantor.description}`;

        addPageIfNecessary(10); // Check if adding the guarantor text exceeds the bottom margin
        currentY = addText(guarantorText, currentY);
        currentY += 5;
      });
    }

    const fianzaText = (guarantors?.guarantors || []).map((guarantor, index) => {
      return `DECIMO QUINTO${index > 0 ? ` (${index + 1})` : ''}: Fianza. El Sr/Sra ${guarantor.name}, 
      CUIL ${guarantor.cuil}, con domicilio en ${guarantor.address}, se constituye en fiador solidario, 
      liso, llano y principal pagador de todas y cada una de las obligaciones contraídas por el LOCATARIO 
      en el presente contrato, incluyendo las derivadas del uso del inmueble, servicios, impuestos, 
      responsabilidades por daños, costas y demás accesorios legales. ${guarantor.description}. 
      El fiador renuncia expresamente a los beneficios de excusión y división, subsistiendo la fianza 
      hasta la efectiva devolución del inmueble locado.`;
    }).join('\n\n');

    addPageIfNecessary(10); // Check if adding the guarantee text exceeds the bottom margin
    currentY = addText(fianzaText, currentY + 10);

    // Mover la declaración de inventarioText antes de su uso
    const inventarioText = `INVENTARIO: ${lease.inventory}`;
    addPageIfNecessary(10); // Check if adding the inventory text exceeds the bottom margin
    currentY = addText(inventarioText, currentY + 10);

    // Firmas
     addPageIfNecessary(30); // Check if adding the signatures exceeds the bottom margin
    currentY += 20;
    doc.text("_______________________", 40, currentY);
    doc.text("_______________________", 120, currentY);
    currentY += 10;
    doc.text("Firma del LOCADOR", 40, currentY);
    doc.text("Firma del LOCATARIO", 120, currentY);

    // Guardar el PDF
    doc.save(`Contrato_${lease.id}_${fechaInicio}.pdf`);
  };

  return (
    <div className="mt-4">
      <button
        onClick={generatePdf}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generar Contrato PDF
      </button>
    </div>
  );
};

ContratoAlquiler.propTypes = {
  owner: PropTypes.shape({
    name: PropTypes.string.isRequired,
    direccion: PropTypes.string.isRequired,
    ciudad: PropTypes.string.isRequired,
    cuil: PropTypes.string.isRequired,
    socio: PropTypes.string,
    provincia: PropTypes.string.isRequired,
  }).isRequired,
  tenant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    cuil: PropTypes.string.isRequired,
    direccion: PropTypes.string.isRequired,
    ciudad: PropTypes.string.isRequired,
    mobilephone: PropTypes.string.isRequired,
  }).isRequired,
  property: PropTypes.shape({
    address: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    superficieCubierta: PropTypes.string.isRequired,
    superficieTotal: PropTypes.string.isRequired,
    rooms: PropTypes.number,
    bathrooms: PropTypes.number,
    socio: PropTypes.string,
    description: PropTypes.string.isRequired,
    typeProperty: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  lease: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    totalMonths: PropTypes.number.isRequired,
    rentAmount: PropTypes.number.isRequired,
    updateFrequency: PropTypes.string.isRequired,
    commission: PropTypes.number.isRequired,
    inventory: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    Landlord: PropTypes.shape({
      cuil: PropTypes.string.isRequired,
      direccion: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  guarantors: PropTypes.shape({
    guarantors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        cuil: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

export default ContratoAlquiler;