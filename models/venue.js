"use strict";
module.exports = function(sequelize, DataTypes) {
  var Venue = sequelize.define("Venue", {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.Sets);
      }
    }
  });
  return Venue;
};