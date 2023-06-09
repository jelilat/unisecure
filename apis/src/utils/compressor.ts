import zlib from 'zlib';
import { promisify } from 'util';
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export const compressAndEncode = async(input: string) => {
  const compressed = await gzip(input);
  return compressed.toString('base64');
}

export const decodeAndDecompress = async(input: string) => {
  const buffer = Buffer.from(input, 'base64');
  return (await gunzip(buffer)).toString();
}
