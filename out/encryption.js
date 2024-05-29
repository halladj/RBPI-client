import * as crypto from "crypto";
const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
const signingKey = privateKey.export({
    type: 'pkcs8',
    format: 'der'
}).toString('hex');
const verifyKey = publicKey.export({
    type: 'spki',
    format: 'der'
}).toString('hex');
console.log({ signingKey, verifyKey });
//let data = 'user@customer.example'
let data = '191934032196';
// Generate a signature of the data
let signature = crypto.sign(null, Buffer.from(data), privateKey);
// Encode the signature and the dataset using our signing key
let encodedSignature = signature.toString('base64');
let encodedData = Buffer.from(data).toString('base64');
// Combine the encoded data and signature to create a license key
const licenseKey = `${encodedData}.${encodedSignature}`;
console.log({ licenseKey });
// Split the license key by delimiter
//[encodedData, encodedSignature] = licenseKey.split('.')
const val = licenseKey.split('.');
encodedData = val[0];
encodedSignature = val[1];
console.log(val);
// Decode the embedded data and its signature
signature = Buffer.from(encodedSignature, 'base64');
data = Buffer.from(encodedData, 'base64').toString();
// Verify the data and its signature using our verify key
const valid = crypto.verify(null, Buffer.from(data), publicKey, signature);
console.log({ valid, data });
// => { valid: true, data: 'user@customer.example' }
