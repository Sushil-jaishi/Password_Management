import { Account } from "../models/account.model.js"
import asyncHandler from "../utils/asyncHandler.js"

// Create a new account
export const createAccount = asyncHandler(async (req, res) => {
  const { service, owner, credentials } = req.body

  if (!service || !owner || !credentials || credentials.length === 0) {
    res.status(400)
    throw new Error("Service, owner, and at least one credential are required.")
  }

  const newAccount = new Account({
    service,
    owner,
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
  const { service, owner } = req.params
  const { credentials } = req.body

  if (!credentials || credentials.length === 0) {
    res.status(400)
    throw new Error("At least one credential is required.")
  }

  const account = await Account.findOne({ service, owner })

  if (!account) {
    res.status(404)
    throw new Error("Account not found.")
  }

  account.credentials = credentials
  await account.save()

  res.status(200).json(account)
})

// Delete an account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { service, owner } = req.params

  const accounts = await Account.find({ service, owner })

  if (accounts.length > 1) {
    res.status(400)
    throw new Error("Multiple accounts found. Please delete them separately.")
  }

  const deletedAccount = await Account.findOneAndDelete({ service, owner })

  if (!deletedAccount) {
    res.status(404)
    throw new Error("Account not found.")
  }

  res.status(200).json({ message: "Account deleted successfully." })
})
