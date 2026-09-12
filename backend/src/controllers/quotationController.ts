import { Response } from "express";
import mongoose from "mongoose";
import Quotation from "../models/Quotation.js";
import RFQ from "../models/RFQ.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { createQuotationSchema } from "../utils/validation.js";

export const createQuotation = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const result = createQuotationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const {
      rfqId,
      quotedPrice,
      estimatedDeliveryTime,
      message,
    } = result.data;

    if (!mongoose.isValidObjectId(rfqId)) {
      res.status(400).json({
        success: false,
        message: "Invalid RFQ ID",
      });
      return;
    }

    const rfq = await RFQ.findById(rfqId);

    if (!rfq) {
      res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
      return;
    }

    if (rfq.status !== "OPEN") {
      res.status(400).json({
        success: false,
        message: "This RFQ is not open for quotations",
      });
      return;
    }

    if (rfq.deadline <= new Date()) {
      rfq.status = "EXPIRED";
      await rfq.save();

      res.status(400).json({
        success: false,
        message: "The RFQ deadline has passed",
      });
      return;
    }

    const existingQuotation = await Quotation.findOne({
      rfqId,
      supplierId: req.userId,
    });

    if (existingQuotation) {
      res.status(409).json({
        success: false,
        message:
          "You have already submitted a quotation for this RFQ",
      });
      return;
    }

    try {
      const quotation = await Quotation.create({
        rfqId,
        supplierId: req.userId,
        quotedPrice,
        estimatedDeliveryTime,
        message,
      });

      res.status(201).json({
        success: true,
        message: "Quotation submitted successfully",
        data: quotation,
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        res.status(409).json({
          success: false,
          message:
            "You have already submitted a quotation for this RFQ",
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    console.error("Create quotation error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyQuotations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const quotations = await Quotation.find({
      supplierId: req.userId,
    })
      .populate(
        "rfqId",
        "productName description quantity deliveryLocation deadline status",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    console.error("Get my quotations error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};