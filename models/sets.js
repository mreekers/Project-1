"use strict";
module.exports = function(sequelize, DataTypes) {
  var Sets = sequelize.define("Sets", {
    name: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.Venue);
      }
    }
  });
  return Sets;
};