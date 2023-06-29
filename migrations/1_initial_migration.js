var Migrations = artifacts.require("./Migrations.sol");
var Contract = artifacts.require("./Contract.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Contract);
};
