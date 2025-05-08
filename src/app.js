import express from "express"
import accountRoutes from "./routes/account.routes.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1", accountRoutes)

export default app
