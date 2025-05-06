import mongoose from "mongoose"

const accountSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    owner: { type: String, required: true },
    credentials: [
      {
        field: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

export const Account = mongoose.model("Account", accountSchema)
