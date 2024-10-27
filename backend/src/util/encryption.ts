import rs from 'jsrsasign'
import * as crypto from 'node:crypto'

const encryptHeader = {alg: 'HS512', typ: 'JWT'}

// Generate a unique key every time the server is started.
const ENCRYPTION_KEY = crypto.randomBytes(50).toString('hex')

export const encodeObject = (objectToCode : object) : string => {
    const encryptedObject = rs.KJUR.jws.JWS.sign(encryptHeader.alg, encryptHeader, objectToCode, ENCRYPTION_KEY)
    return encryptedObject
}

export const decodeObject = (objectToDecode : string) : object => {
    if (!rs.KJUR.jws.JWS.verify(objectToDecode, ENCRYPTION_KEY)) {
        throw new Error('Authentication key not valid')
    } 

    return rs.KJUR.jws.JWS.parse(objectToDecode).payloadObj
}