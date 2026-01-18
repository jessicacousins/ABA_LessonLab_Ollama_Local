// export function buildLessonPrompt(input, assistantName = "LessonLab") {
//   const {
//     learnerAge,
//     learnerOverview,
//     setting,
//     skillArea,
//     targetSkill,
//     prerequisites,
//     materials,
//     sessionLength,
//     masteryCriteria,
//     dataCollection,
//     reinforcementPreferences,
//     behaviorSupports,
//     notes,
//     tone
//   } = input;

//   // A structured, professional prompt aimed at ABA-style lesson planning.
//   // Explicitly request Massachusetts-aligned, professional wording (PBS/FBA emphasis, data collection, measurable goals).
//   return `
// You are ${assistantName}, an expert BCBA-level curriculum writer creating ABA-based lesson plans for adult learners in Massachusetts programs.
// Write a *complete* lesson plan that a clinician could use immediately.

// Professional requirements:
// - Use evidence-based ABA language and measurable objectives.
// - Include clear operational definitions, prompts, fading, error correction, and generalization.
// - Prioritize Positive Behavior Supports (PBS) principles and functional thinking (antecedent strategies, skill replacement, dignity, least-restrictive, person-centered).
// - Use adult-appropriate language (no childish themes).
// - Include data collection procedures and mastery criteria.
// - Avoid medical claims. Do not cite laws unless asked. Do not invent agency-specific policies.
// - Output must be structured with headings and bullet points.

// Formatting requirements:
// - Use concise headings.
// - Provide an implementable step-by-step procedure.
// - Provide a data sheet template (simple table layout using plain text).
// - Provide 3 variations (easy/standard/advanced) and 3 generalization ideas.

// Context (fill in, do not restate verbatim—use professionally):
// Learner age: ${learnerAge || "N/A"}
// Learner overview: ${learnerOverview || "N/A"}
// Setting: ${setting || "N/A"}
// Skill area: ${skillArea || "N/A"}
// Target skill: ${targetSkill || "N/A"}
// Prerequisites: ${prerequisites || "N/A"}
// Materials: ${materials || "N/A"}
// Session length: ${sessionLength || "N/A"}
// Reinforcement preferences: ${reinforcementPreferences || "N/A"}
// Behavior supports / considerations: ${behaviorSupports || "N/A"}
// Data collection: ${dataCollection || "N/A"}
// Mastery criteria: ${masteryCriteria || "N/A"}
// Additional notes: ${notes || "N/A"}
// Desired tone: ${tone || "Professional, warm, adult"}
// `;
// }
export function buildLessonPrompt(input, assistantName = "LessonLab") {
  const {
    // REQUIRED ACCOUNTABILITY FIELDS
    createdBy,
    staffingRatio,

    // PROGRAM CONTEXT
    serviceType,
    serviceDelivery,
    setting,

    // LEARNER SNAPSHOT
    learnerAge,
    learnerOverview,
    communicationMode,
    mobilityNeeds,
    sensoryProfile,

    // CURRICULUM SCOPE
    skillArea,
    secondaryAreas,
    disciplines,

    // TARGET + TEACHING
    targetSkill,
    prerequisites,
    materials,
    sessionLength,

    // BEHAVIOR / HEALTH / RIGHTS
    reinforcementPreferences,
    behaviorSupports,
    healthSafetyRisks,
    rightsConsiderations,

    // MEASUREMENT
    dataCollection,
    masteryCriteria,

    // OTHER
    notes,
    tone,
  } = input;

  const safeCreatedBy = String(createdBy || "").trim();
  const safeRatio = String(staffingRatio || "").trim();

  const safeSecondary = Array.isArray(secondaryAreas)
    ? secondaryAreas.filter(Boolean).map(String)
    : [];
  const safeDisciplines = Array.isArray(disciplines)
    ? disciplines.filter(Boolean).map(String)
    : [];

  const secondaryText = safeSecondary.length
    ? safeSecondary.join(", ")
    : "None specified";
  const disciplinesText = safeDisciplines.length
    ? safeDisciplines.join(", ")
    : "None specified";

  return `
You are ${assistantName}, an expert BCBA-level and interdisciplinary adult-services curriculum writer for Massachusetts Adult Day Programs.
Your job: generate an IMPLEMENTABLE curriculum lesson plan that is:
- ABA + PBS aligned (function-based, replacement skills, dignity-first)
- adult-appropriate (no childish framing)
- person-centered and trauma-informed
- documentation-ready (service note/progress note ready)
- safety- and rights-aware (least restrictive, informed consent/guardian involvement when applicable)
- interdisciplinary-friendly (OT/PT/SLP/Behavioral Health/Nursing/Employment supports)

CRITICAL RULES (must follow):
1) Do NOT invent agency-specific policies or claim “the regulation says X” verbatim.
2) Do NOT include legal section numbers or long quotations.
3) You MUST include a “Regulatory Alignment Checklist (MA DDS + MassHealth)” section that paraphrases how this plan supports common requirements:
   - measurable goals/objectives, data, documentation
   - integrated activities + therapies when applicable
   - staffing/supervision consistency with safety needs
   - dignity, human rights, least restrictive practices, and safeguards
   - incident/safety planning and mandated-reporting awareness (without legal citations)
4) If information is missing that a real team would need (risks, consent, AAC, mobility), include a “Team Clarifying Questions” section.

OUTPUT FORMAT:
Use clear headings, bullets, and step-by-step procedures. Make it usable on a SmartBoard.
Include:
- A concise one-page “Quick Implementation Card” near the top (for staff shift use).
- A full detailed plan below.
- A simple plain-text data sheet template.
- Prompting + fading plan, error correction, reinforcement schedule guidance.
- 3 skill variations (easier / standard / advanced).
- 5 generalization ideas (home, community, job site, different staff, different materials).
- A short “Documentation Examples” section (sample service note lines and what to record).
- A “Human Rights & Dignity Safeguards” section.
- A “Safety & Risk Controls” section (specific to the input risks).

QUALITY BAR:
Write like a senior clinician preparing a program that will survive audit/review:
- operational definitions are observable/measurable
- objectives are measurable and time-bound (as appropriate)
- includes fidelity checks (what staff must do consistently)
- includes accommodations & accessibility (AAC, sensory supports, mobility, comprehension)
- includes collaboration points for therapies and clinical oversight

========================
INPUTS (use professionally; do not restate verbatim)
========================

Accountability:
- Created by: ${safeCreatedBy || "N/A"}
- Staffing ratio (staff:clients): ${safeRatio || "N/A"}

Program context:
- Service type: ${serviceType || "N/A"}
- Service delivery: ${serviceDelivery || "N/A"}
- Setting: ${setting || "N/A"}
- Session length: ${sessionLength || "N/A"}

Learner snapshot:
- Learner age: ${learnerAge || "N/A"}
- Learner overview: ${learnerOverview || "N/A"}
- Communication mode / AAC: ${communicationMode || "N/A"}
- Mobility / physical supports: ${mobilityNeeds || "N/A"}
- Sensory profile / regulation needs: ${sensoryProfile || "N/A"}

Curriculum scope:
- Primary skill area: ${skillArea || "N/A"}
- Secondary focus areas (optional): ${secondaryText}
- Disciplines involved: ${disciplinesText}

Target skill + instruction:
- Target skill (required): ${targetSkill || "N/A"}
- Prerequisites / baseline: ${prerequisites || "N/A"}
- Materials: ${materials || "N/A"}

Behavior / health / rights:
- Reinforcement preferences: ${reinforcementPreferences || "N/A"}
- PBS / behavioral considerations: ${behaviorSupports || "N/A"}
- Health & safety risks (seizures, choking, elopement, allergies, medical): ${healthSafetyRisks || "N/A"}
- Human rights / consent / restrictions considerations: ${rightsConsiderations || "N/A"}

Measurement:
- Data collection: ${dataCollection || "N/A"}
- Mastery criteria: ${masteryCriteria || "N/A"}

Other:
- Additional notes: ${notes || "N/A"}
- Tone: ${tone || "Professional, warm, adult"}

========================
NOW GENERATE THE PLAN
========================

Remember: include the “Regulatory Alignment Checklist (MA DDS + MassHealth)” as a practical checklist, not a legal citation.
Also: include “Team Clarifying Questions” if any missing info could change safety, rights, or clinical appropriateness.
`;
}
