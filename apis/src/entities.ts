import express, { Request, Response } from 'express';
import cors from 'cors';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const privateKey = process.env.PRIVATE_KEY!;
const wallet = new Wallet(privateKey);

const hospitalData = {
  // Dummy data
  '0x123': { name: 'Alice', bloodType: 'A', conditions: ['Condition1', 'Condition2'] },
  '0x456': { name: 'Bob', bloodType: 'B', conditions: ['Condition3', 'Condition4'] }
};

const bankData = {
  // Dummy data
  '0x123': { name: 'Alice', balance: 1000 },
  '0x456': { name: 'Bob', balance: 2000 }
};

const universityData = {
  // Dummy data
  '0x123': { name: 'Alice', degree: 'Computer Science', GPA: 3.8 },
  '0x456': { name: 'Bob', degree: 'Electrical Engineering', GPA: 3.9 }
};

async function handleRequest(req: Request, res: Response, dataObject: any) {
    const address = req.params.address;
    const originalData = dataObject[address];

    // Convert data to string
    const dataString = JSON.stringify(originalData);

    try {
        // Sign the data
        const signedData = await wallet.signMessage(dataString);
        res.json({
            message: dataString,
            signature: signedData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while signing the data.' });
    }
}

app.get('/hospital/:address', (req: Request, res: Response) => handleRequest(req, res, hospitalData));
app.get('/bank/:address', (req: Request, res: Response) => handleRequest(req, res, bankData));
app.get('/university/:address', (req: Request, res: Response) => handleRequest(req, res, universityData));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
}).on('error', (err) => {
  console.log(`Error occurred while starting the API server: ${err}`);
})
