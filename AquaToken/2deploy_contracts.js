const Aqua = artifacts.require("Aqua");

module.exports = function (deployer) {
    deployer.deploy(Aqua, 1000000);
}