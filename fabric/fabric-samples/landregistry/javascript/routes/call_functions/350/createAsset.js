/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve("/home/dipto/fabric/fabric-samples/first-network/connection-org1.json");
//const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

async function main(assetName,uniqueCode,LocationImage,ownerNid,ownerName,uploadTime,Division, Disctrict, MaujaNo_JL, KhatianNo , PlotNo) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(ownerNid);
        if (!userExists) {
            console.log('An identity for the user '+ownerNid+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return true;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: ownerNid, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('landregistry');
        await contract.submitTransaction('createAsset', uniqueCode , ownerNid , ownerName , assetName , LocationImage ,
         uploadTime ,Division, Disctrict, MaujaNo_JL, KhatianNo , PlotNo);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

//main();
module.exports = main;


