import DBConnection from "./db.js"
import app from "./app.js"

DBConnection()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`)
    })
  })
  .catch((error) => {
    console.error("Database connection error:", error)
  })
