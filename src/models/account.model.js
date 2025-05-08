import mongoose from "mongoose"
import { ownerList, serviceList } from "../constants.js"

const accountSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      lowercase: true,
      enum: serviceList,
    },
    owner: {
      type: String,
      required: true,
      lowercase: true,
      enum: ownerList,
    },
    accountNumber: {
      type: Number,
      default: 1,
    },
    credentials: [
      {
        field: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
)

accountSchema.index(
  { service: 1, owner: 1, accountNumber: 1 },
  { unique: true }
)

export const Account = mongoose.model("Account", accountSchema)
