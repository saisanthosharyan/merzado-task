import { Router } from "express";
import {
  createRFQ,
  deleteRFQ,
  getMyRFQs,
  getRFQById,
  getRFQQuotations,
  getRFQs,
  updateRFQ,
} from "../controllers/rfqController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("BUYER"), createRFQ);
router.get("/", getRFQs);
router.get("/my", authorizeRoles("BUYER"), getMyRFQs);
router.get(
  "/:id/quotations",
  authorizeRoles("BUYER"),
  getRFQQuotations,
);
router.get("/:id", getRFQById);
router.put("/:id", authorizeRoles("BUYER"), updateRFQ);
router.delete("/:id", authorizeRoles("BUYER"), deleteRFQ);

export default router;