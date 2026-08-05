import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAssessmentMail({
  studentName,
  phone,
  score,
  careerFit,
  leadId,
}) {
  await resend.emails.send({
    from: "Impact Assessment <noreply@impactdigitalmarketinginstitute.in>",
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🎉 New Assessment Completed - ${studentName}`,
    html: `
      <h2>New Assessment Completed</h2>

      <table cellpadding="8">
        <tr>
          <td><b>Student</b></td>
          <td>${studentName}</td>
        </tr>

        <tr>
          <td><b>Phone</b></td>
          <td>${phone}</td>
        </tr>

        <tr>
          <td><b>Score</b></td>
          <td>${score}/100</td>
        </tr>

        <tr>
          <td><b>Career Fit</b></td>
          <td>${careerFit}</td>
        </tr>
      </table>

      <p>Please login to CRM for the complete assessment report.</p>
    `,
  });
}