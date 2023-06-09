import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import EthCrypto from 'eth-crypto';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/superapi', async (req: Request, res: Response) => {
  const { address, userPublicKey, receiverPublicKey, apiEndpoint } = req.body;

  try {
    // Call the appropriate API and get the data
    const response = await axios.get(apiEndpoint, { params: { address } });
    const data = response.data;

    const encryptedDataUser = await EthCrypto.encryptWithPublicKey(
        userPublicKey,
        JSON.stringify(data)
    );
    const encryptedDataReceiver = await EthCrypto.encryptWithPublicKey(
        receiverPublicKey,
        JSON.stringify(encryptedDataUser)
    );

    // Respond with the doubly-encrypted data
    res.json({ data: JSON.stringify(encryptedDataReceiver)});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
