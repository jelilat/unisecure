import EthCrypto from 'eth-crypto';
import Web3 from 'web3';
const web3 = new Web3(process.env.SEPOLIA_RPC_URL!);
import { verifyMessage } from 'ethers';

async function doubleDecryptAndVerify(data: any, userPrivateKey: string, receiverPrivateKey: string, signerAddress: string) {
    // First decryption using your private key
    const decryptedFirst = await EthCrypto.decryptWithPrivateKey(
        userPrivateKey,
        JSON.parse(data)
    );

    // Second decryption using receiver's private key
    const decryptedSecond = await EthCrypto.decryptWithPrivateKey(
        receiverPrivateKey,
        JSON.parse(decryptedFirst)
    );

    // At this point decryptedSecond should be an object with the original data and its signature
    const decryptedData = JSON.parse(decryptedSecond);
    const signingAddress = verifyMessage(decryptedData.message, decryptedData.signature);

    if (signingAddress.toLowerCase() === signerAddress.toLowerCase()) {
        console.log('Signature is valid.');
        return decryptedData;
    } else {
        console.log('Signature is invalid.');
        return null;
    }
}

export default doubleDecryptAndVerify;