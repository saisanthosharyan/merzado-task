import mongoose, { Document, Schema } from "mongoose";

export type RFQStatus = "OPEN" | "CLOSED" | "EXPIRED";

export interface IRFQ extends Document {
  buyerId: mongoose.Types.ObjectId;
  productName: string;
  description: string;
  quantity: number;
  deliveryLocation: string;
  deadline: Date;
  status: RFQStatus;
  createdAt: Date;
  updatedAt: Date;
}

const rfqSchema = new Schema<IRFQ>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    deliveryLocation: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 300,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "EXPIRED"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  },
);

const RFQ = mongoose.model<IRFQ>("RFQ", rfqSchema);

export default RFQ;