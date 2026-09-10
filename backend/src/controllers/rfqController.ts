import { Response } from "express";
import RFQ from "../models/RFQ.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { createRFQSchema } from "../utils/validation.js";
import Quotation from "../models/Quotation.js";

export const createRFQ = async (
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

    const result = createRFQSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { productName, description, quantity, deliveryLocation, deadline } =
      result.data;

    const deadlineDate = new Date(deadline);

    if (deadlineDate <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Deadline must be in the future",
      });
      return;
    }

    const rfq = await RFQ.create({
      buyerId: req.userId,
      productName,
      description,
      quantity,
      deliveryLocation,
      deadline: deadlineDate,
      status: "OPEN",
    });

    res.status(201).json({
      success: true,
      message: "RFQ created successfully",
      data: rfq,
    });
  } catch (error) {
    console.error("Create RFQ error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRFQs = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { search, location, status } = req.query;

    const filter: Record<string, unknown> = {};

    if (search && typeof search === "string") {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location && typeof location === "string") {
      filter.deliveryLocation = {
        $regex: location,
        $options: "i",
      };
    }

    if (
      status &&
      typeof status === "string" &&
      ["OPEN", "CLOSED", "EXPIRED"].includes(status.toUpperCase())
    ) {
      filter.status = status.toUpperCase();
    }

    const rfqs = await RFQ.find(filter)
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 });

    const now = new Date();

    for (const rfq of rfqs) {
      if (rfq.status === "OPEN" && rfq.deadline <= now) {
        rfq.status = "EXPIRED";
        await rfq.save();
      }
    }

    res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    console.error("Get RFQs error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyRFQs = async (
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

    const rfqs = await RFQ.find({
      buyerId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    console.error("Get my RFQs error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRFQById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const rfq = await RFQ.findById(req.params.id).populate(
      "buyerId",
      "name email",
    );

    if (!rfq) {
      res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
      return;
    }

    if (rfq.status === "OPEN" && rfq.deadline <= new Date()) {
      rfq.status = "EXPIRED";
      await rfq.save();
    }

    res.status(200).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    console.error("Get RFQ error:", error);

    res.status(500).json({
      success: false,
      message: "Invalid RFQ ID",
    });
  }
};

export const updateRFQ = async (
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

    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
      return;
    }

    if (rfq.buyerId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: "You can only edit your own RFQs",
      });
      return;
    }

    if (rfq.status !== "OPEN") {
      res.status(400).json({
        success: false,
        message: "Only open RFQs can be edited",
      });
      return;
    }

    const result = createRFQSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const deadlineDate = new Date(result.data.deadline);

    if (deadlineDate <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Deadline must be in the future",
      });
      return;
    }

    rfq.productName = result.data.productName;
    rfq.description = result.data.description;
    rfq.quantity = result.data.quantity;
    rfq.deliveryLocation = result.data.deliveryLocation;
    rfq.deadline = deadlineDate;

    await rfq.save();

    res.status(200).json({
      success: true,
      message: "RFQ updated successfully",
      data: rfq,
    });
  } catch (error) {
    console.error("Update RFQ error:", error);

    res.status(500).json({
      success: false,
      message: "Invalid RFQ ID",
    });
  }
};

export const deleteRFQ = async (
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

    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
      return;
    }

    if (rfq.buyerId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: "You can only delete your own RFQs",
      });
      return;
    }

    await rfq.deleteOne();

    res.status(200).json({
      success: true,
      message: "RFQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete RFQ error:", error);

    res.status(500).json({
      success: false,
      message: "Invalid RFQ ID",
    });
  }
};
export const getRFQQuotations = async (
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

    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
      return;
    }

    if (rfq.buyerId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: "You can only view quotations for your own RFQs",
      });
      return;
    }

    const quotations = await Quotation.find({
      rfqId: rfq._id,
    })
      .populate("supplierId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    console.error("Get RFQ quotations error:", error);

    res.status(500).json({
      success: false,
      message: "Invalid RFQ ID",
    });
  }
};