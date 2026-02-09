import * as crypto from 'crypto';

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const ENCRYPT_ALGO = 'aes-256-gcm';

export type EncryptedData = {
	encrypted: string;
	iv: string;
	authTag: string;
};

export type MasterKeyData = {
	salt: string;
	encryptedMasterKey: string;
	iv: string;
	authTag: string;
};

// Generate a random 32-byte master key
export function generateMasterKey(): Buffer {
	return crypto.randomBytes(32);
}

// Derive a key encryption key (KEK) from password using scrypt
function deriveKEK(password: string, salt: Buffer): Buffer {
	return crypto.scryptSync(password, salt, 32, SCRYPT_PARAMS);
}

// Encrypt data using AES-256-GCM
function encryptAES256GCM(data: Buffer, key: Buffer): EncryptedData {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(ENCRYPT_ALGO, key, iv);

	const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
	const authTag = cipher.getAuthTag();

	return {
		encrypted: encrypted.toString('hex'),
		iv: iv.toString('hex'),
		authTag: authTag.toString('hex'),
	};
}

// Decrypt data using AES-256-GCM
function decryptAES256GCM(encryptedData: EncryptedData, key: Buffer): Buffer {
	const decipher = crypto.createDecipheriv(ENCRYPT_ALGO, key, Buffer.from(encryptedData.iv, 'hex'));

	decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

	return Buffer.concat([
		decipher.update(Buffer.from(encryptedData.encrypted, 'hex')),
		decipher.final(),
	]);
}

// Encrypt the master key with a password-derived KEK
export function encryptMasterKey(masterKey: Buffer, password: string): MasterKeyData {
	const salt = crypto.randomBytes(32);
	const kek = deriveKEK(password, salt);
	const encrypted = encryptAES256GCM(masterKey, kek);

	return {
		salt: salt.toString('hex'),
		encryptedMasterKey: encrypted.encrypted,
		iv: encrypted.iv,
		authTag: encrypted.authTag,
	};
}

// Decrypt the master key using password
export function decryptMasterKey(data: MasterKeyData, password: string): Buffer {
	const salt = Buffer.from(data.salt, 'hex');
	const kek = deriveKEK(password, salt);

	try {
		return decryptAES256GCM(
			{
				encrypted: data.encryptedMasterKey,
				iv: data.iv,
				authTag: data.authTag,
			},
			kek,
		);
	} catch {
		throw new Error('Invalid password');
	}
}

// Encrypt a private key with the master key
export function encryptPrivateKey(privateKey: string, masterKey: Buffer): EncryptedData {
	return encryptAES256GCM(Buffer.from(privateKey, 'utf8'), masterKey);
}

// Decrypt a private key with the master key
export function decryptPrivateKey(encryptedData: EncryptedData, masterKey: Buffer): string {
	return decryptAES256GCM(encryptedData, masterKey).toString('utf8');
}
