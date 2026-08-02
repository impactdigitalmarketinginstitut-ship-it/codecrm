import express from "express";
import { createAssessmentLead,updateAssessmentReport } from "../controllers/assessmentController.js";
import { verifyWebsiteApiKey } from "../middleware/verifyWebsiteApiKey.js";

const router = express.Router();

router.post(
  "/website-assessment",
  verifyWebsiteApiKey,
  createAssessmentLead
);
router.put(
  "/website-assessment/:leadId",
  verifyWebsiteApiKey,
  updateAssessmentReport
);

export default router;