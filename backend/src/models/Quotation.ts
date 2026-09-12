import mongoose, { Document, Schema } from "mongoose";

export interface IQuotation extends Document {
  rfqId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  quotedPrice: number;
  estimatedDeliveryTime: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const quotationSchema = new Schema<IQuotation>(
  {
    rfqId: {
      type: Schema.Types.ObjectId,
      ref: "RFQ",
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quotedPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },
    estimatedDeliveryTime: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  },
);

quotationSchema.index(
  { rfqId: 1, supplierId: 1 },
  { unique: true },
);

const Quotation = mongoose.model<IQuotation>(
  "Quotation",
  quotationSchema,
);

export default Quotation;