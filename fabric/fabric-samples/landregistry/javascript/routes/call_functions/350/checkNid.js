/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve("/home/dipto/fabric/fabric-samples/first-network/connection-org1.json");
//const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

async function main(nid) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(nid.toString());
        if (!userExists) {
            console.log('An identity for the user '+nid+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return false;
        }

        return true;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
//main();
module.exports = main;


