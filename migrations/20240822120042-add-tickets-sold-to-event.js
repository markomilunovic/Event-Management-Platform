module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('event', 'tickets_sold', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('event', 'tickets_sold');
  },
};
