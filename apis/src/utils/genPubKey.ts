import EC from 'elliptic';
import dotenv from 'dotenv';
dotenv.config();

const ec = new EC.ec('secp256k1');
const privateKey = process.env.PRIVATE_KEY!;

const key = ec.keyFromPrivate(privateKey.slice(2));

const publicKey = key.getPublic().encode('hex', false);
console.log(publicKey.slice(2));


