const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define(
        'PaymentReceipt',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            paymentDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            amount: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            period: {
                type: DataTypes.STRING, // Por ejemplo: "Marzo 2024"
                allowNull: false,
            },
            installmentNumber: {
                type: DataTypes.INTEGER, // Número de la cuota actual
                allowNull: false,
                validate: {
                    min: 1,
                },
            },
            totalInstallments: {
                type: DataTypes.INTEGER, // Total de cuotas del contrato
                allowNull: false,
                validate: {
                    min: 1,
                },
            },
            type: {
                type: DataTypes.ENUM("installment", "commission"),
                allowNull: false,
                defaultValue: "installment",
            },
            status: {
                type: DataTypes.ENUM("pending", "paid"),
                allowNull: false,
                defaultValue: "pending",
            },
        },
        {
            paranoid: true,
        }
    );
};
