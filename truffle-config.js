// const HDWalletProvider = require('@truffle/hdwallet-provider');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    develop: {
      port: 9545
    }
  },
  
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};
