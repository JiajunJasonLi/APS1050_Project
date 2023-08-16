var PetShop = artifacts.require("./PetShop.sol");

module.exports = function(deployer) {
  deployer.deploy(PetShop);
};
