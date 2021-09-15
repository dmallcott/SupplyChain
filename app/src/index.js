import Web3 from "web3";
import SupplyChainArtifact from "../../build/contracts/SupplyChain.json";

const App = {
  web3: null,
  account: null,
  contract: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainArtifact.networks[networkId];
      this.contract = new web3.eth.Contract(
        SupplyChainArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      console.info("Eth network initiated correctly.");
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  showOverviews: function() {
    document.getElementById("containerFarmDetails").hidden = false;
    document.getElementById("containerProductDetails").hidden = false;
  },

  showProductOverview: function(sku, owner) {
    const skuView = document.getElementById("sku");
    skuView.innerHTML = sku;

    const ownerView = document.getElementById("owner");
    ownerView.innerHTML = owner;

    document.getElementById("containerProductOverview").hidden = false;
  },

  getProductOverview: async function () {
    const { getFarmDetails } = this.contract.methods;
    const upc = document.getElementById("inputUpc").value;
    let details = await getFarmDetails(upc).call();

    this.showProductOverview(details._sku, details.ownerID);
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.log("error!")
    document.getElementById("error").style.visibility = "visible";
  }

  App.start();
});