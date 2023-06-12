import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

type Query = {
    text: string,
    values: Array<any>
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// create a new data request
export const createDataRequest = async (userAddress: string, senderAddress: string, recipientAddress: string, data: string) => {
    const query = {
        text: 'INSERT INTO data_requests(user_address, sender_address, recipient_address, data, stage) VALUES($1, $2, $3, $4, $5)',
        values: [userAddress, senderAddress, recipientAddress, data, 2]
    };

    await runQuery(query);
};

// get all data requests for a user
export const getDataRequests = async (userAddress: string) => {
    const query = {
        text: 'SELECT * FROM data_requests WHERE user_address = $1',
        values: [userAddress]
    };

    await runQuery(query);
};

// get all data shared with a user
export const getDataSharedTo = async (userAddress: string) => {
    const query = {
        text: 'SELECT * FROM data_requests WHERE recipient_address = $1',
        values: [userAddress]
    };

    await runQuery(query);
}

// get all data shared by a user
export const getSharedData = async (userAddress: string) => {
    const query = {
        text: 'SELECT * FROM data_requests WHERE sender_address = $1',
        values: [userAddress]
    };

    await runQuery(query);
}

// update the stage of a data request
export const updateDataRequestStage = async (userAddress: string, senderAddress: string, recipientAddress: string, stage: number) => {
    const query = {
        text: 'UPDATE data_requests SET stage = $1 WHERE user_address = $2 AND sender_address = $3 AND recipient_address = $4',
        values: [stage, userAddress, senderAddress, recipientAddress]
    };

    await runQuery(query);
}

// update the data of a data request
export const updateDataRequestData = async (userAddress: string, senderAddress: string, recipientAddress: string, data: string) => {
    const query = {
        text: 'UPDATE data_requests SET data = $1 WHERE user_address = $2 AND sender_address = $3 AND recipient_address = $4',
        values: [data, userAddress, senderAddress, recipientAddress]
    };

    await runQuery(query);
}

// delete a data request
export const deleteDataRequest = async (userAddress: string, senderAddress: string, recipientAddress: string) => {
    const query = {
        text: 'DELETE FROM data_requests WHERE user_address = $1 AND sender_address = $2 AND recipient_address = $3',
        values: [userAddress, senderAddress, recipientAddress]
    };

    await runQuery(query);
}

// delete all data requests for a user
export const deleteDataRequests = async (userAddress: string) => {
    const query = {
        text: 'DELETE FROM data_requests WHERE user_address = $1',
        values: [userAddress]
    };

    await runQuery(query);
}

// run a query
export const runQuery = async (query: Query) => {
    const client = await pool.connect();
    try {
        const res = await client.query(query);
        console.log("Created data request");
        return res;
    } catch (err: any) {
        console.log(err.stack);
    } finally {
        client.release();
    }
}
