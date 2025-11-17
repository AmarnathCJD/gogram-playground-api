// AES-256 GCM encryption for WebSocket messages
// Matches server-side encryption in main.go

const ENCRYPTION_KEY = "1234567890abcdef1234567890abcdef"; // Must match Go server

// Convert string to Uint8Array
function str2buf(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

// Convert Uint8Array to string
function buf2str(buf) {
    const decoder = new TextDecoder();
    return decoder.decode(buf);
}

// Convert Uint8Array to base64 (handles binary data correctly)
function buf2base64(buf) {
    const bytes = new Uint8Array(buf);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

// Convert base64 to Uint8Array (handles binary data correctly)
function base642buf(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

// Import encryption key directly (matching Go's direct key usage)
async function importKey() {
    return await crypto.subtle.importKey(
        'raw',
        str2buf(ENCRYPTION_KEY),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt plaintext using AES-256 GCM
async function encrypt(plaintext) {
    const key = await importKey();
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: nonce
        },
        key,
        str2buf(plaintext)
    );
    
    // Combine nonce + ciphertext
    const combined = new Uint8Array(nonce.length + ciphertext.byteLength);
    combined.set(nonce);
    combined.set(new Uint8Array(ciphertext), nonce.length);
    
    return buf2base64(combined);
}

// Decrypt ciphertext using AES-256 GCM
async function decrypt(ciphertextBase64) {
    const key = await importKey();
    const combined = base642buf(ciphertextBase64);
    
    // Extract nonce and ciphertext (nonce is first 12 bytes for GCM)
    const nonceSize = 12;
    const nonce = combined.slice(0, nonceSize);
    const ciphertext = combined.slice(nonceSize);
    
    const plaintext = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: nonce
        },
        key,
        ciphertext
    );
    
    return buf2str(plaintext);
}

// Export functions
window.JxDBCrypto = {
    encrypt,
    decrypt
};
