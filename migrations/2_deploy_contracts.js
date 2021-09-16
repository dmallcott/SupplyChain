const SupplyChain = artifacts.require("SupplyChain");
const FarmerRole = artifacts.require("FarmerRole");
const DistributorRole = artifacts.require("DistributorRole");
const RetailerRole = artifacts.require("RetailerRole");
const ConsumerRole = artifacts.require("ConsumerRole");


module.exports = function(deployer) {
  deployer.deploy(SupplyChain);
  deployer.deploy(FarmerRole);
  deployer.deploy(DistributorRole);
  deployer.deploy(RetailerRole);
  deployer.deploy(ConsumerRole);
};
