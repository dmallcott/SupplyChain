import Web3 from "web3";
import SupplyChainArtifact from "../../build/contracts/SupplyChain.json";

const App = {
  web3: null,
  account: null,
  contract: null,

  start: async function () {
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

  _stateToString: function (state) {
    switch (parseInt(state)) {
      case 0: return "Harvested";
      case 1: return "Processed";
      case 2: return "Packed";
      case 3: return "For Sale";
      case 4: return "Sold";
      case 5: return "Shipped";
      case 6: return "Received";
      case 7: return "Purchased";
      default: return "?";
    }
  },

  showProductOverview: function (sku, owner, state) {
    document.getElementById("sku").innerHTML = sku;
    document.getElementById("owner").innerHTML = owner;
    document.getElementById("state").innerHTML = this._stateToString(state);
    document.getElementById("containerProductOverview").hidden = false;
  },

  hideProductOverview: function () {
    document.getElementById("sku").innerHTML = "---";
    document.getElementById("owner").innerHTML = "---";
    document.getElementById("containerProductOverview").hidden = true;
  },

  _refreshProductView: async function () {
    const upc = this._upcFromView();
    let details = await this.contract.methods.getFarmDetails(upc).call();
    this.showProductOverview(details._sku, details.ownerID, details.itemState);
  },

  getProductOverview: async function () {
    const getFarmDetailsMethod = this.contract.methods.getFarmDetails;
    const upc = document.getElementById("inputUpc").value;
    let details = await getFarmDetailsMethod(upc).call();

    if (details._sku == 0 && details.ownerID == "0x0000000000000000000000000000000000000000") {
      this.hideProductOverview();
      this.showFarmDetails("", "", "", "", "");
    } else {
      this.showProductOverview(details._sku, details.ownerID, details.itemState);
    }
  },

  fillFarmDetails: function () {
    this.showFarmDetails(
      this.account,
      "Toat Farm",
      "Yarra Valley",
      "-38.239770",
      "144.341490"
    );
  },

  showFarmDetails: function (farmerId, farmName, farmInformation, farmLatitude, farmLongitude) {
    document.getElementById("inputFarmerId").value = farmerId;
    document.getElementById("inputFarmName").value = farmName;
    document.getElementById("inputFarmInformation").value = farmInformation;
    document.getElementById("inputFarmLatitude").value = farmLatitude;
    document.getElementById("inputFarmLongitude").value = farmLongitude;

    document.getElementById("containerFarmDetails").hidden = false;
  },

  getFarmDetails: async function () {
    const getFarmDetailsMethod = this.contract.methods.getFarmDetails;
    const upc = document.getElementById("inputUpc").value;
    let details = await getFarmDetailsMethod(upc).call();

    this.showFarmDetails(
      details.originFarmerID,
      details.originFarmName,
      details.originFarmInformation,
      details.originFarmLatitude,
      details.originFarmLongitude
    );
  },

  fillProductDetails: function () {
    this.showProductDetails(
      "Awesome product notes",
      1,
      "",
      "",
      ""
    );
  },

  _sanitiseAddress: function (address) {
    return (address == "0x0000000000000000000000000000000000000000") ? "" : address;
  },

  _upcFromView: function() {
    const upc = document.getElementById("inputUpc").value;

    if (!upc) {
      document.getElementById("upcMissingAlert").hidden = false;
      throw new Exception("Dodgy dodgy dodgy");
    }

    return upc;
  },

  showProductDetails: function (productNotes, productPrice, distributorID, retailerID, consumerID) {
    document.getElementById("inputProductNotes").value = productNotes;
    document.getElementById("inputProductPrice").value = (productPrice > 0) ? productPrice : "";
    document.getElementById("inputDistributorId").value = this._sanitiseAddress(distributorID);
    document.getElementById("inputRetailerId").value = this._sanitiseAddress(retailerID);
    document.getElementById("inputConsumerId").value = this._sanitiseAddress(consumerID);

    document.getElementById("containerProductDetails").hidden = false;
  },

  getProductDetails: async function () {
    const upc = this._upcFromView();
    let details = await this.contract.methods.getProductDetails(upc).call();

    this.showProductDetails(
      details.productNotes,
      details.productPrice,
      details.distributorID,
      details.retailerID,
      details.consumerID
    );
  },

  _harvest: async function (upc, inputFarmerId, inputFarmName, inputFarmInformation, inputFarmLatitude, inputFarmLongitude) {
    const harvestItemMethod = this.contract.methods.harvestItem;

    return await harvestItemMethod(
      upc, inputFarmerId, inputFarmName, inputFarmInformation, inputFarmLatitude,
      inputFarmLongitude, ""
    ).send({ from: this.account });
  },

  harvest: async function () {
    const upc = document.getElementById("inputUpc").value;
    const inputFarmerId = document.getElementById("inputFarmerId").value;
    const inputFarmName = document.getElementById("inputFarmName").value;
    const inputFarmInformation = document.getElementById("inputFarmInformation").value;
    const inputFarmLatitude = document.getElementById("inputFarmLatitude").value;
    const inputFarmLongitude = document.getElementById("inputFarmLongitude").value;

    if (!upc) {
      document.getElementById("upcMissingAlert").hidden = false;
      return;
    }

    if (inputFarmerId && inputFarmName && inputFarmInformation && inputFarmLatitude && inputFarmLongitude) {
      let result = await this._harvest(upc, inputFarmerId, inputFarmName, inputFarmInformation, inputFarmLatitude, inputFarmLongitude);

      document.getElementById("farmDetailsSuccess").innerHTML = "Product harvested!";
      document.getElementById("farmDetailsSuccess").hidden = false;
      document.getElementById("upcMissingAlert").hidden = true;

      this._refreshProductView();
      this._addTransactionHistory(result);
    } else {
      document.getElementById("farmDetailsAlert").innerHTML = "We're missing some farm information!";
      document.getElementById("farmDetailsAlert").hidden = false;
    }
  },

  process: async function () {
    const upc = document.getElementById("inputUpc").value;

    if (!upc) {
      document.getElementById("upcMissingAlert").hidden = false;
      return;
    }

    let result = await this.contract.methods.processItem(upc).send({ from: this.account });

    document.getElementById("farmDetailsSuccess").innerHTML = "Product processed!";
    document.getElementById("farmDetailsSuccess").hidden = false;
    this._refreshProductView();
    this._addTransactionHistory(result);
  },

  pack: async function () {
    const upc = document.getElementById("inputUpc").value;

    if (!upc) {
      document.getElementById("upcMissingAlert").hidden = false;
      return;
    }

    let result = await this.contract.methods.packItem(upc).send({ from: this.account });

    document.getElementById("farmDetailsSuccess").innerHTML = "Product packed!";
    document.getElementById("farmDetailsSuccess").hidden = false;
    this._refreshProductView();
    this._addTransactionHistory(result);
  },

  forSale: async function () {
    const upc = this._upcFromView();
    const productPrice = document.getElementById("inputProductPrice").value;
    const productNotes = document.getElementById("inputProductNotes").value;

    if (!productPrice) {
      document.getElementById("productDetailsAlert").innerHTML = "You need to set a price!";
      document.getElementById("productDetailsAlert").hidden = false;
      return;
    }

    let result = await this.contract.methods.sellItem(upc, productPrice).send({ from: this.account });

    document.getElementById("productDetailsSuccess").innerHTML = "Product on sale!";
    document.getElementById("productDetailsSuccess").hidden = false;
    this._refreshProductView();
    this._addTransactionHistory(result);
  },

  buy: async function () {
    const upc = this._upcFromView();
    const productPrice = document.getElementById("inputProductPrice").value;

    let result = await this.contract.methods.buyItem(upc).send({ from: this.account, value: this.web3.utils.toWei(productPrice) });

    document.getElementById("productDetailsSuccess").innerHTML = "Product bought!";
    document.getElementById("productDetailsSuccess").hidden = false;
    this._refreshProductView();
    this.getProductDetails();
    this._addTransactionHistory(result);
  },

  ship: async function () {
    const upc = this._upcFromView();

    let result = await this.contract.methods.shipItem(upc).send({ from: this.account });

    document.getElementById("productDetailsSuccess").innerHTML = "Product shipped!";
    document.getElementById("productDetailsSuccess").hidden = false;

    this._refreshProductView();
    this.getProductDetails();
    this._addTransactionHistory(result);
  },

  receive: async function () {
    const upc = this._upcFromView();

    let result = await this.contract.methods.receiveItem(upc).send({ from: this.account });

    document.getElementById("productDetailsSuccess").innerHTML = "Product received!";
    document.getElementById("productDetailsSuccess").hidden = false;
    
    this._refreshProductView();
    this.getProductDetails();
    this._addTransactionHistory(result);
  },

  purchase: async function () {
    const upc = this._upcFromView();

    let result = await this.contract.methods.purchaseItem(upc).send({ from: this.account });

    document.getElementById("productDetailsSuccess").innerHTML = "Product purchased!";
    document.getElementById("productDetailsSuccess").hidden = false;
    
    this._refreshProductView();
    this.getProductDetails();
    this._addTransactionHistory(result);
  },

  _addTransactionHistory: function(result) {
    // My frontend code is dodgy haha
    var ul = document.getElementById("ftc-events");
    console.log(result);
    var li = document.createElement("li");
    var body = Object.keys(result.events)[0].toString() + " - " + result.transactionHash.toString();
    li.appendChild(document.createTextNode(body));
    ul.appendChild(li);
  }
};

window.App = App;

window.addEventListener("load", async function () {
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