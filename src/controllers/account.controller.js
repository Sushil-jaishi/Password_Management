import { Account } from "../models/account.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import { encrypt, decrypt, decryptCredentials } from "../utils/encryption.js"

// Create a new account
export const createAccount = asyncHandler(async (req, res) => {
  const { service, owner, accountNumber, credentials } = req.body

  if (!service || !owner || !credentials || credentials.length === 0) {
    res.status(400)
    throw new Error("Service, owner, and at least one credential are required.")
  }

  const existingAccount = await Account.findOne({
    service,
    owner,
    accountNumber: accountNumber || 1,
  })

  if (existingAccount) {
    res.status(400)
    throw new Error(
      `${service} account for ${owner} already exists with account number ${
        accountNumber || 1
      }.`
    )
  }

  const encryptedCredentials = credentials.map((cred) => ({
    field: cred.field,
    value: encrypt(cred.value),
    history: [],
  }))

  const newAccount = new Account({
    service,
    owner,
    accountNumber,
    credentials: encryptedCredentials,
  })

  await newAccount.save()

  const decryptedAccount = {
    ...newAccount.toObject(),
    credentials: decryptCredentials(newAccount.credentials),
  }

  res.status(201).json(decryptedAccount)
})

export const getAllAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find()

  if (accounts.length === 0) {
    res.status(404)
    throw new Error("No accounts found.")
  }

  const decryptedAccounts = accounts.map((account) => ({
    ...account.toObject(),
    credentials: decryptCredentials(account.credentials),
  }))

  res.status(200).json(decryptedAccounts)
})

// Get all accounts for a specific user (owner)
export const getAccountsByOwner = asyncHandler(async (req, res) => {
  const { owner } = req.params

  const accounts = await Account.find({ owner })

  if (accounts.length === 0) {
    res.status(404)
    throw new Error("No accounts found for this owner.")
  }

  const decryptedAccounts = accounts.map((account) => ({
    ...account.toObject(),
    credentials: decryptCredentials(account.credentials),
  }))

  res.status(200).json(decryptedAccounts)
})

// Get all accounts for a specific service
export const getAccountsByService = asyncHandler(async (req, res) => {
  const { service } = req.params

  const accounts = await Account.find({ service })

  if (accounts.length === 0) {
    res.status(404)
    throw new Error(`No accounts found for service: ${service}`)
  }

  const decryptedAccounts = accounts.map((account) => ({
    ...account.toObject(),
    credentials: decryptCredentials(account.credentials),
  }))

  res.status(200).json(decryptedAccounts)
})

export const getAccountsByServiceAndOwner = asyncHandler(async (req, res) => {
  const { service, owner } = req.params

  const accounts = await Account.find({ service, owner })

  if (!accounts || accounts.length === 0) {
    res.status(404)
    throw new Error("No accounts found for this service and owner.")
  }

  const decryptedAccounts = accounts.map((account) => ({
    ...account.toObject(),
    credentials: decryptCredentials(account.credentials),
  }))

  res.status(200).json(decryptedAccounts)
})

// Update the credentials of an account
export const updateAccountCredentials = asyncHandler(async (req, res) => {
  const { service, owner, accountNumber, credentials } = req.body

  if (!service || !owner || !accountNumber || !credentials) {
    res.status(400)
    throw new Error(
      "Service, owner, account number, and credentials are required."
    )
  }

  const account = await Account.findOne({ service, owner, accountNumber })

  if (!account) {
    res.status(404)
    throw new Error("Account not found.")
  }

  credentials.forEach((cred) => {
    const existingCredential = account.credentials.find(
      (c) => c.field === cred.field
    )

    if (existingCredential) {
      if (decrypt(existingCredential.value) === cred.value) {
        return
      }

      existingCredential.history.push({
        oldValue: existingCredential.value,
        changedAt: new Date(),
      })

      existingCredential.value = encrypt(cred.value)
    } else {
      account.credentials.push({
        field: cred.field,
        value: encrypt(cred.value),
        history: [],
      })
    }
  })

  await account.save()

  const decryptedAccount = {
    ...account.toObject(),
    credentials: decryptCredentials(account.credentials),
  }

  res.status(200).json(decryptedAccount)
})

// Delete an account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { service, owner, accountNumber } = req.params
  const { confirm } = req.body

  if (!service || !owner || !accountNumber || confirm !== true) {
    res.status(400)
    throw new Error(
      "Service, owner, account number, and confirmation are required."
    )
  }

  const account = await Account.findOne({ service, owner, accountNumber })

  if (!account) {
    res.status(404)
    throw new Error("Account not found.")
  }

  await account.deleteOne()

  res.status(200).json({ message: "Account deleted successfully." })
})
