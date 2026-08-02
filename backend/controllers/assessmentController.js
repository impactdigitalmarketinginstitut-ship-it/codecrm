import Lead from "../models/Lead.js";
import Brand from "../models/Brand.js";
import Course from "../models/Course.js";
import AuditLog from "../models/AuditLog.js";
import { detectIntent } from "../utils/intentDetection.js";
import { calcPriority } from "../utils/calcPriority.js";
import {
  upsertLeadToMonthlyCsv,
} from "../backup/localBackup.js";
import { enqueueFileUpload } from "../backup/driveUploader.js";
export const createAssessmentLead = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full Name and Phone are required.",
      });
    }

    const brand = await Brand.findOne({
      name: "Impact Digital Marketing",
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    const course = await Course.findOne({
      name: "Digital Marketing",
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    /* Existing Lead */

    let lead = await Lead.findOne({
      phone_primary: phone,
    });

    if (lead) {
      return res.status(200).json({
        success: true,
        existing: true,
        leadId: lead._id,
      });
    }

    lead = new Lead({
      name: fullName,
      phone_primary: phone,
      brand: process.env.IMPACT_BRAND_ID,
      course_interest: process.env.IMPACT_DIGITAL_MARKETING_COURSE_ID,
      source: "Website",
      status: "new",
      intent_level: "medium",
      notes: "Assessment Started",
    });

    lead.intent_level = detectIntent("Assessment Started");

    lead.priority_score = calcPriority({
      sourceScore: 2,
      courseDemand: 2,
      attemptSuccess: 0,
      isHot: false,
      freshnessScore: 3,
      demoBooked: false,
    });

    const saved = await lead.save();

    const populatedLead = await Lead.findById(saved._id)
      .populate("brand", "name")
      .populate("course_interest", "name")
      .lean();

    const csvPath = upsertLeadToMonthlyCsv(populatedLead);

    enqueueFileUpload(csvPath);

    await AuditLog.create({
      action: "assessment_lead_created",
      entity: "Lead",
      entityId: saved._id,
      details: {
        source: "Website Assessment",
      },
    });

    return res.status(201).json({
      success: true,
      leadId: saved._id,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ============================================================
   UPDATE REPORT
   Called after Assessment Completed
============================================================ */

export const updateAssessmentReport = async (req, res) => {
  try {
    const { leadId } = req.params;

    const { assessment } = req.body;

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    const report = `
==================================================
DIGITAL MARKETING CAREER ASSESSMENT
==================================================

Completed On :
${new Date().toLocaleString()}

Career Score :
${assessment.score}/100

Career Fit :
${assessment.careerFit}

Top Strengths :
${assessment.strengths
  ?.map((s) => `• ${s}`)
  .join("\n")}

Recommended Careers :
${assessment.recommendedCareers
  ?.map((c) => `• ${c}`)
  .join("\n")}

------------------------------------------

Question Responses

${assessment.questionAnswers || "Not Available"}

==================================================
Generated From :
assessment.impactdigitalmarketinginstitute.in
==================================================
`;

    lead.notes = report;

    lead.intent_level = "high";

    lead.is_hot = true;

    lead.status = "new";

    lead.priority_score = calcPriority({
      sourceScore: 5,
      courseDemand: 4,
      attemptSuccess: 1,
      isHot: true,
      freshnessScore: 5,
      demoBooked: false,
    });

    const saved = await lead.save();

    const populatedLead = await Lead.findById(saved._id)
      .populate("brand", "name")
      .populate("course_interest", "name")
      .lean();

    const csvPath = upsertLeadToMonthlyCsv(populatedLead);

    enqueueFileUpload(csvPath);

    await AuditLog.create({
      action: "assessment_completed",
      entity: "Lead",
      entityId: saved._id,
      details: {
        score: assessment.score,
      },
    });

    return res.json({
      success: true,
      message: "Assessment Report Saved Successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};