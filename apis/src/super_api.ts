import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import EthCrypto from 'eth-crypto';
import { compressAndEncode } from './utils/compressor';
import { createDataRequest } from './utils/db';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/superapi', async (req: Request, res: Response) => {
  const { address, senderAddress, recipientAddress, userPublicKey, receiverPublicKey, apiEndpoint } = req.body;

  try {
    // Call the appropriate API and get the data
    const response = await axios.get(apiEndpoint+`/${address}`, { params: { address } });
    const data = response.data;
    console.log(data);

    const encryptedDataUser = await EthCrypto.encryptWithPublicKey(
        userPublicKey,
        JSON.stringify(data)
    );
    const encryptedDataReceiver = await EthCrypto.encryptWithPublicKey(
        receiverPublicKey,
        JSON.stringify(encryptedDataUser)
    );

    // compress and encode the data
    const compressedData = await compressAndEncode(JSON.stringify(encryptedDataReceiver));
    await createDataRequest(address, senderAddress, recipientAddress, compressedData)

    // Respond with the doubly-encrypted data
    res.json({ data: compressedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.get('/superapi', async (req, res) => {
  const address = req.query.address as string;
  const senderAddress = req.query.senderAddress as string;
  const recipientAddress = req.query.recipientAddress as string;
  const userPublicKey = req.query.userPublicKey as string;
  const receiverPublicKey = req.query.receiverPublicKey as string;
  const apiEndpoint = req.query.apiEndpoint as string;

  try {
    // Call the appropriate API and get the data
    const response = await axios.get(`${apiEndpoint}/${address}`);
    const data = response.data;

    const encryptedDataUser = await EthCrypto.encryptWithPublicKey(
      userPublicKey as string,
      JSON.stringify(data)
    );

    let encryptedDataReceiver = encryptedDataUser
    if (senderAddress !== recipientAddress) {
      encryptedDataReceiver = await EthCrypto.encryptWithPublicKey(
        receiverPublicKey as string,
        JSON.stringify(encryptedDataUser)
      );
    }
    
    // compress and encode the data
    const compressedData = await compressAndEncode(JSON.stringify(encryptedDataReceiver));
    await createDataRequest(address, senderAddress, recipientAddress, compressedData)

    // Respond with the doubly-encrypted data
    res.json({ data: compressedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Super API server running on port ${PORT}`);
}).on('error', (err) => {
  console.log(`Error occurred while starting the API server: ${err}`);
});
