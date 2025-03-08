import React from 'react';
import PropTypes from 'prop-types';

const ContractUpdateStatus = ({ lease }) => {
  const { startDate, updateFrequency, updatedAt } = lease;

  // Definir la cantidad de meses según la frecuencia de actualización
  let updateIntervalMonths = 0;
  if (updateFrequency === 'semestral') updateIntervalMonths = 6;
  else if (updateFrequency === 'cuatrimestral') updateIntervalMonths = 4;
  else if (updateFrequency === 'anual') updateIntervalMonths = 12;

  // Si existe updatedAt (última actualización), se usa para calcular la siguiente actualización;
  // caso contrario, se usa la fecha de inicio.
  const baseDate = updatedAt ? new Date(updatedAt) : new Date(startDate);
  let nextUpdate = new Date(baseDate);

  // Se suma el intervalo de meses hasta obtener una fecha futura respecto a hoy
  while (nextUpdate <= new Date()) {
    nextUpdate.setMonth(nextUpdate.getMonth() + updateIntervalMonths);
  }

  // Calcular la cantidad de días restantes
  const diffTime = nextUpdate.getTime() - new Date().getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 border border-gray-300 rounded mb-4">
      <p><strong>Próxima actualización:</strong> {nextUpdate.toLocaleDateString()}</p>
      <p><strong>Días restantes:</strong> {daysRemaining}</p>
    </div>
  );
};
ContractUpdateStatus.propTypes = {
  lease: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    updateFrequency: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
  }).isRequired,
};

export default ContractUpdateStatus;
