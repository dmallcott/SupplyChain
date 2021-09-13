// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
require('truffle-test-utils').init();

var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("1", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Harvested by calling function harvestItem()
        let result = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, 
            originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: originFarmerID})

        // Verify event was emitted
        assert.web3Event(result, {
            event: 'Harvested',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getFarmData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['originFarmerID'], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(item['itemState'], 0, 'Error: Invalid item State')
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.processItem(upc, {from: originFarmerID})

        assert.web3Event(result, {
            event: 'Processed',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getFarmData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 1, 'Error: Invalid item State')
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.packItem(upc, {from: originFarmerID})

        assert.web3Event(result, {
            event: 'Packed',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getFarmData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 2, 'Error: Invalid item State')
        
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.sellItem(upc, productPrice, {from: originFarmerID})

        assert.web3Event(result, {
            event: 'ForSale',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getProductData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 3, 'Error: Invalid item State')
        assert.equal(item['productPrice'], productPrice, 'Error: Wrong price')
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.buyItem(upc, {value: productPrice, from: distributorID})

        assert.web3Event(result, {
            event: 'Sold',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getProductData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 4, 'Error: Invalid item State')
        assert.equal(item['ownerID'], distributorID, 'Error: Wrong owner')
        assert.equal(item['distributorID'], distributorID, 'Error: Wrong distributor')
        
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.shipItem(upc, {from: distributorID})

        assert.web3Event(result, {
            event: 'Shipped',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getProductData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 5, 'Error: Invalid item State')
              
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.receiveItem(upc, {from: retailerID})

        assert.web3Event(result, {
            event: 'Received',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getProductData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 6, 'Error: Invalid item State')
        assert.equal(item['ownerID'], retailerID, 'Error: Wrong owner')
        assert.equal(item['retailerID'], retailerID, 'Error: Wrong retailer')
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        let result = await supplyChain.purchaseItem(upc, {from: consumerID})

        assert.web3Event(result, {
            event: 'Purchased',
            args: { "upc": upc, "0": 1, "__length__": 1 }
        }, 'The event is emitted');
        
        let item = await supplyChain.getProductData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 7, 'Error: Invalid item State')
        assert.equal(item['ownerID'], consumerID, 'Error: Wrong owner')
        assert.equal(item['consumerID'], consumerID, 'Error: Wrong consumer')
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()
        let item = await supplyChain.getFarmData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 7, 'Error: Invalid item State')
        assert.equal(item['originFarmerID'], originFarmerID, 'Error: Wrong farmer')
        
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        // Sorry but I don't like the idea of a fetchItem() function. It's too stateful. I wanted to do a fetchItem(_upc) but ran into the Stack too Deep problem. 
        // So had to split the function into two. Any tips on avoiding that?
        
        const supplyChain = await SupplyChain.deployed()
        let item = await supplyChain.getProductData(upc)

        assert.equal(item['upc'], upc, 'Error: Invalid item SKU')
        assert.equal(item['itemState'], 7, 'Error: Invalid item State')
        assert.equal(item['distributorID'], distributorID, 'Error: Wrong distributor')
        assert.equal(item['retailerID'], retailerID, 'Error: Wrong retailer')
        assert.equal(item['consumerID'], consumerID, 'Error: Wrong consumer')
    })

});

