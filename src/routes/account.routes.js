import express from "express"
import {
  createAccount,
  getAccountsByOwner,
  getAccountsByService,
  getAccountsByServiceAndOwner,
  updateAccountCredentials,
  deleteAccount,
} from "../controllers/account.controller.js"

const router = express.Router()

router.post("/", createAccount)

router.get("/owner/:owner", getAccountsByOwner)

router.get("/service/:service", getAccountsByService)

router.get("/service/:service/owner/:owner", getAccountsByServiceAndOwner)

router.get("/owner/:owner/service/:service", getAccountsByServiceAndOwner)

router.put("/", updateAccountCredentials)

router.delete("/service/:service/owner/:owner/:accountNumber", deleteAccount)

router.delete("/owner/:owner/service/:service/:accountNumber", deleteAccount)

export default router
