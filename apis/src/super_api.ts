import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import EthCrypto from 'eth-crypto';
import { compressAndEncode } from './utils/compressor';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/superapi', async (req: Request, res: Response) => {
  const { address, userPublicKey, receiverPublicKey, apiEndpoint } = req.body;
  console.log(address, userPublicKey, receiverPublicKey, apiEndpoint);

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
    console.log(compressedData);

    // Respond with the doubly-encrypted data
    res.json({ data: compressedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.get('/superapi', async (req, res) => {
  const address = req.query.address;
  const userPublicKey = req.query.userPublicKey;
  const receiverPublicKey = req.query.receiverPublicKey;
  const apiEndpoint = req.query.apiEndpoint;
  
  console.log(address, userPublicKey, receiverPublicKey, apiEndpoint);

  try {
    // Call the appropriate API and get the data
    const response = await axios.get(`${apiEndpoint}/${address}`);
    const data = response.data;
    console.log(data);

    const encryptedDataUser = await EthCrypto.encryptWithPublicKey(
      userPublicKey as string,
      JSON.stringify(data)
    );
    const encryptedDataReceiver = await EthCrypto.encryptWithPublicKey(
      receiverPublicKey as string,
      JSON.stringify(encryptedDataUser)
    );

    // compress and encode the data
    const compressedData = await compressAndEncode(JSON.stringify(encryptedDataReceiver));
    console.log(compressedData);

    // Respond with the doubly-encrypted data
    res.json({ data: compressedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Super API server running on port ${PORT}`);
}).on('error', (err) => {
  console.log(`Error occurred while starting the Super API server: ${err}`);
});
