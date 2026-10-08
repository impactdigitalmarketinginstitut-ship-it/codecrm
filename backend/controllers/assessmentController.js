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
import { sendAssessmentMail } from "../utils/sendAssessmentMail.js";

export const createAssessmentLead = async (req, res) => {
  try {
    // ==========================================================
    // GET WEBSITE LEAD DATA
    // ==========================================================

    const {
      fullName,
      phone,
      source_page,
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Full Name and Phone are required.",
      });
    }

    // ==========================================================
    // FIND BRAND
    // ==========================================================

    const brand = await Brand.findOne({
      name: "Impact Digital Marketing",
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    // ==========================================================
    // FIND COURSE
    // ==========================================================

    const course = await Course.findOne({
      name: "Digital Marketing",
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // ==========================================================
    // CHECK EXISTING LEAD
    // ==========================================================

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

    // ==========================================================
    // CREATE NEW LEAD
    // ==========================================================

    lead = new Lead({
      name: fullName,

      phone_primary: phone,

      brand:
        process.env.IMPACT_BRAND_ID,

      course_interest:
        process.env.IMPACT_DIGITAL_MARKETING_COURSE_ID,

      source: "Website",

      // ========================================================
      // DYNAMIC WEBSITE SOURCE PAGE
      // ========================================================
      // Examples:
      // /
      // /services
      // /contact
      // /assessment
      // ========================================================

      source_page:
        typeof source_page === "string"
          ? source_page.trim()
          : "",

      status: "new",

      intent_level: "medium",

      notes: "Assessment Started",
    });

    // ==========================================================
    // DETECT INTENT
    // ==========================================================

    lead.intent_level =
      detectIntent(
        "Assessment Started"
      );

    // ==========================================================
    // CALCULATE PRIORITY
    // ==========================================================

    lead.priority_score =
      calcPriority({
        sourceScore: 2,
        courseDemand: 2,
        attemptSuccess: 0,
        isHot: false,
        freshnessScore: 3,
        demoBooked: false,
      });

    // ==========================================================
    // SAVE LEAD
    // ==========================================================

    const saved =
      await lead.save();

    // ==========================================================
    // POPULATE LEAD
    // ==========================================================

    const populatedLead =
      await Lead.findById(
        saved._id
      )
        .populate(
          "brand",
          "name"
        )
        .populate(
          "course_interest",
          "name"
        )
        .lean();

    // ==========================================================
    // CSV BACKUP
    // ==========================================================

    const csvPath =
      upsertLeadToMonthlyCsv(
        populatedLead
      );

    enqueueFileUpload(
      csvPath
    );

    // ==========================================================
    // AUDIT LOG
    // ==========================================================

    await AuditLog.create({
      action:
        "assessment_lead_created",

      entity: "Lead",

      entityId:
        saved._id,

      details: {
        source:
          "Website Assessment",

        source_page:
          typeof source_page ===
          "string"
            ? source_page.trim()
            : "",
      },
    });

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(201).json({
      success: true,
      leadId: saved._id,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export const updateAssessmentReport = async (
  req,
  res
) => {
  try {
    const {
      leadId,
    } = req.params;

    const {
      assessment,
    } = req.body;

    // ==========================================================
    // FIND LEAD
    // ==========================================================

    const lead =
      await Lead.findById(
        leadId
      );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message:
          "Lead not found.",
      });
    }

    // ==========================================================
    // GENERATE REPORT
    // ==========================================================

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
  ?.map(
    (s) => `• ${s}`
  )
  .join("\n")}

Recommended Careers :
${assessment.recommendedCareers
  ?.map(
    (c) => `• ${c}`
  )
  .join("\n")}

------------------------------------------

Question Responses

${
  assessment.questionAnswers ||
  "Not Available"
}

==================================================
Generated From :
assessment.impactdigitalmarketinginstitute.in
==================================================
`;

    // ==========================================================
    // UPDATE LEAD
    // ==========================================================

    lead.notes = report;

    lead.intent_level =
      "high";

    lead.is_hot = true;

    lead.status = "new";

    lead.priority_score =
      calcPriority({
        sourceScore: 5,
        courseDemand: 4,
        attemptSuccess: 1,
        isHot: true,
        freshnessScore: 5,
        demoBooked: false,
      });

    // ==========================================================
    // SAVE UPDATED LEAD
    // ==========================================================

    const saved =
      await lead.save();

    // ==========================================================
    // SEND ASSESSMENT EMAIL
    // ==========================================================

    sendAssessmentMail({
      studentName:
        lead.name,

      phone:
        lead.phone_primary,

      score:
        assessment.score,

      careerFit:
        assessment.careerFit,
    }).catch(console.error);

    // ==========================================================
    // POPULATE LEAD
    // ==========================================================

    const populatedLead =
      await Lead.findById(
        saved._id
      )
        .populate(
          "brand",
          "name"
        )
        .populate(
          "course_interest",
          "name"
        )
        .lean();

    // ==========================================================
    // CSV BACKUP
    // ==========================================================

    const csvPath =
      upsertLeadToMonthlyCsv(
        populatedLead
      );

    enqueueFileUpload(
      csvPath
    );

    // ==========================================================
    // AUDIT LOG
    // ==========================================================

    await AuditLog.create({
      action:
        "assessment_completed",

      entity: "Lead",

      entityId:
        saved._id,

      details: {
        score:
          assessment.score,

        source_page:
          lead.source_page ||
          "",
      },
    });

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.json({
      success: true,
      message:
        "Assessment Report Saved Successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};
