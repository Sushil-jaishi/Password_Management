import crypto from "crypto"

// Generate a key and IV (use environment variables for production)
const algorithm = "aes-256-cbc"
const key = crypto
  .createHash("sha256")
  .update(String(process.env.ENCRYPTION_KEY))
  .digest("base64")
  .substring(0, 32)
const iv = crypto.randomBytes(16)

// Encrypt function
export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

// Decrypt function
export const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":")
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  )
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export const decryptCredentials = (credentials) => {
  return credentials.map((cred) => ({
    field: cred.field,
    value: decrypt(cred.value),
    history: cred.history.map((h) => ({
      oldValue: decrypt(h.oldValue),
      changedAt: h.changedAt,
    })),
  }))
}
