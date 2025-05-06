import express from "express"
import accountRoutes from "./routes/account.routes.js"

const app = express()

app.use(express.json())

app.use("/api/v1/accounts", accountRoutes)

export default app
