import { Account } from "../models/account.model.js"
import asyncHandler from "../utils/asyncHandler.js"

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

  const newAccount = new Account({
    service,
    owner,
    accountNumber,
    credentials,
  })

  await newAccount.save()

  res.status(201).json(newAccount)
})

// Get all accounts for a specific user (owner)
export const getAccountsByOwner = asyncHandler(async (req, res) => {
  const { owner } = req.params

  const accounts = await Account.find({ owner })

  if (accounts.length === 0) {
    res.status(404)
    throw new Error("No accounts found for this owner.")
  }

  res.status(200).json(accounts)
})

// Get all accounts for a specific service
export const getAccountsByService = asyncHandler(async (req, res) => {
  const { service } = req.params

  const accounts = await Account.find({ service })

  if (accounts.length === 0) {
    res.status(404)
    throw new Error(`No accounts found for service: ${service}`)
  }

  res.status(200).json(accounts)
})

export const getAccountsByServiceAndOwner = asyncHandler(async (req, res) => {
  const { service, owner } = req.params

  const accounts = await Account.find({ service, owner })

  if (!accounts || accounts.length === 0) {
    res.status(404)
    throw new Error("No accounts found for this service and owner.")
  }

  res.status(200).json(accounts)
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
      if (existingCredential.value === cred.value) {
        return
      }
      existingCredential.history.push({
        oldValue: existingCredential.value,
        changedAt: new Date(),
      })

      existingCredential.value = cred.value
    } else {
      account.credentials.push({
        field: cred.field,
        value: cred.value,
        history: [],
      })
    }
  })

  await account.save()

  res.status(200).json(account)
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
