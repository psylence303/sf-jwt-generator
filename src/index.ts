const crypto = require('crypto');

const ENCRYPTION_METHOD = 'RSA-SHA256';
const DEFAULT_OFFSET = 86400000; // 1 day

export interface ConnectionConfig {
    clientId: string,
    offsetInMs?: number,
    privateKey: string
    url: string,
    username: string,
}

interface AlgHeader {
    alg: string
}

interface SfClaims {
    iss: string,
    sub: string,
    aud: string,
    exp: string
}

/**
 * Return a UNIX timestamp for the required JWT expiration date
 * - provided offsetInMs is added to the current date
 * @param {number} offsetInMs
 * @returns {string}
 */
function getDate(offsetInMs:number|undefined):string {
    const date = new Date();
    const offset = offsetInMs || DEFAULT_OFFSET;

    return Math.floor((date.getTime() + offset) / 1000).toString();
}

/**
 * Convert a provided entity to base64 string
 * - if it's an object, stringify first
 * - replace the special characters
 * @param {Buffer|object} entity
 * @param {boolean} stringify
 */
function toBase64(entity:Buffer):string;
function toBase64(entity:object, stringify: boolean):string;
function toBase64(entity:any, stringify = false):string {
    const str:string = stringify ? JSON.stringify(entity) : entity;

    return replaceSpecialChars(Buffer.from(str).toString('base64'));
}

/**
 * Replace the special characters in the given base64 string
 * @param {string} b64string
 * @returns {string}
 */
function replaceSpecialChars(b64string:string):string {
    return b64string.replace(/[=+/]/g, (charToBeReplaced:string):any => {
        switch (charToBeReplaced) {
            case '=':
            return '';
            case '+':
            return '-';
            case '/':
            return '_';
        }
    });
}

/**
 * Create a JWT consisting of three parts separated by a dot:
 *  - base64-encoded algorithm header
 *  - base64-encoded claims set
 *  - both parts combined together and signed with a private key provided
 * @param {AlgHeader} header
 * @param {SfClaims} claimsSet
 * @param {ConnectionConfig} config
 * @returns {string}
 */
function createJwt(header:AlgHeader, claimsSet:SfClaims, config:ConnectionConfig):string {
    const {privateKey} = config;
    const jwtB64Header = toBase64(header, true);
    const jwtB64Payload = toBase64(claimsSet, true);
    const sign = crypto.createSign(ENCRYPTION_METHOD);
    sign.update(jwtB64Header + '.' + jwtB64Payload);
    sign.end();

    return jwtB64Header + '.' + jwtB64Payload + '.' + toBase64(sign.sign(privateKey));
}

/**
 * Validate the provided configuration
 * @param {ConnectionConfig} config
 */
function validateConfig(config:ConnectionConfig) {
    const propsRequired = ['clientId', 'privateKey', 'url', 'username'];
    if (!config) throw new Error ('No configuration provided!');

    propsRequired.forEach((prop:string) => {
        if (!config.hasOwnProperty(prop)) throw new Error(`Configuration property not provided: ${prop}`);
    });
}

/**
 * Provides a JWT for the given configuration
 * @param {ConnectionConfig} config
 * @returns {string}
 */
export function generateJwt(config:ConnectionConfig):string {
    validateConfig(config);

    const algHeader:AlgHeader = {
        alg: 'RS256'
    };
    const claimsSet:SfClaims = {
        iss: config.clientId,
        sub: config.username,
        aud: config.url,
        exp: getDate(config.offsetInMs)
    };

    return createJwt(algHeader, claimsSet, config);
}
