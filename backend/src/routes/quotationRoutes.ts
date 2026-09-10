import { Router } from "express";
import {
  createQuotation,
  getMyQuotations,
} from "../controllers/quotationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("SUPPLIER"),
  createQuotation,
);
router.get(
  "/my",
  authorizeRoles("SUPPLIER"),
  getMyQuotations,
);

export default router;