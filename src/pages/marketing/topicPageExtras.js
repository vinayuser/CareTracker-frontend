/** Extra, relevant copy for footer topic pages. Keyed by the document section. */
export const TOPIC_EXTRAS = {
  product_features: {
    lead: 'Agencies do not need another disconnected app for each task. These features sit on the same client, caregiver, and visit records.',
    points: [
      ['Scheduling', 'Build visits from the care plan, assign a caregiver, and see conflicts before the day starts.'],
      ['Electronic visit verification', 'Check-in, check-out, and location support the visit record your office reviews.'],
      ['Care documentation', 'Notes and assessments stay with the client so the next shift is not guessing.'],
      ['Hiring and credentials', 'Applicants, required documents, and expirations are visible before someone is scheduled.'],
      ['Portals', 'Caregivers see their day. Families see only what you choose to share.'],
      ['Reporting', 'Look at completed, missed, and in-progress visits without rebuilding a spreadsheet.'],
    ],
    faqs: [
      ['Do we have to use every module on day one?', 'No. Most agencies start with scheduling and EVV, then add intake, hiring, or billing follow-up.'],
    ],
  },
  product_pricing: {
    lead: 'Plans are a starting point. The right fit depends on caregiver count, locations, and which workflows you turn on.',
    points: [
      ['What changes the price', 'Number of caregivers, clients, locations, and whether you need hiring, billing follow-up, or extra portals.'],
      ['What is included in a conversation', 'We walk through your current tools so you are not paying for a module you will not open.'],
      ['Onboarding', 'Setup includes your roles, first clients, and a coordinator walkthrough—not only a login email.'],
      ['No surprise compliance claim', 'Software does not replace your payer contract. Pricing covers the product, not a legal guarantee.'],
    ],
    faqs: [
      ['Can we start small?', 'Yes. Begin with the team that runs today’s visits and add locations when the first office is steady.'],
    ],
  },
  product_demo: {
    lead: 'A useful demo follows your day: a new client, a schedule, a caregiver check-in, and the exception the office has to fix.',
    points: [
      ['Bring a real scenario', 'One client type, one visit length, and the way you handle a call-out.'],
      ['Who should join', 'An owner plus the coordinator who builds the schedule. Billing can join if claims are the priority.'],
      ['What you leave with', 'A clear picture of what moves off spreadsheets and what stays in your current tools.'],
      ['After the call', 'If it fits, we outline setup steps and the data you would import first.'],
    ],
    faqs: [
      ['How long is it?', 'Plan on 30 to 45 minutes. Longer is fine if you want hiring and billing in the same session.'],
    ],
  },
  crm_client_intake: {
    lead: 'Intake is the moment a lead becomes a client your schedulers can trust. Missing fields here become missed visits later.',
    points: [
      ['Who the client is', 'Contact, address, emergency contacts, and who may receive updates.'],
      ['What care is needed', 'Service type, schedule pattern, and notes the caregiver must see.'],
      ['Payer context', 'Insurance or program details so billing is not discovering coverage after week one.'],
      ['Documents', 'Consents and assessments attached to the client, not a shared drive folder.'],
      ['Handoff', 'When intake is complete, scheduling can assign visits without retyping the chart.'],
    ],
    faqs: [
      ['Can families complete part of this?', 'You can collect forms from the client or family and keep the submission on their record.'],
    ],
  },
  crm_marketing_tools: {
    lead: 'Marketing for a home care agency is mostly follow-up: referral partners, open inquiries, and families who asked for a call.',
    points: [
      ['Know the source', 'Track whether a lead came from a physician, hospital, website, or family referral.'],
      ['Do not lose the thread', 'Status and last contact stay on the inquiry so two coordinators do not both call—or neither does.'],
      ['Convert with context', 'When they become a client, the notes from the first call are still there.'],
      ['Review what works', 'Look at which sources become active clients before you spend more time on outreach.'],
    ],
    faqs: [
      ['Is this an ad platform?', 'No. It organizes inquiries and referral follow-up inside Caretraqer. Ad accounts stay where you already run them.'],
    ],
  },
  crm_email_sms: {
    lead: 'Messages work when they are about a real visit or a real next step—not a blast with no record.',
    points: [
      ['Visit changes', 'Tell the caregiver and, when appropriate, the family that a time moved.'],
      ['Intake follow-up', 'Remind a family about a missing form before the start date slips.'],
      ['Staff notices', 'Reach the office or a caregiver group without a personal text chain.'],
      ['History', 'The send is tied to the person so the next coordinator sees it.'],
    ],
    faqs: [
      ['Can caregivers opt out of non-essential texts?', 'Yes. Keep required visit communication separate from optional marketing messages.'],
    ],
  },
  crm_patient_engagement: {
    lead: 'Families stay calmer when they can see the schedule and ask a question without calling the front desk three times.',
    points: [
      ['Upcoming visits', 'Show who is coming and when, at the detail level your policy allows.'],
      ['A place for questions', 'Messages stay on the client instead of a caregiver’s personal phone.'],
      ['After the visit', 'Share an appropriate update when your program allows it.'],
      ['Boundaries', 'Families do not see other clients, payroll, or internal HR notes.'],
    ],
    faqs: [
      ['What if a family should not have access?', 'Do not issue a login. Engagement is optional and controlled by the agency.'],
    ],
  },
  crm_analytics_reports: {
    lead: 'Reports should answer an agency question: where are leads stalling, which visits were missed, and what needs a person today.',
    points: [
      ['Inquiry pipeline', 'Counts by stage so a full inbox is visible before it goes quiet.'],
      ['Conversion', 'Which sources became clients, and which were lost.'],
      ['Activity', 'Follow-ups completed versus inquiries with no owner.'],
      ['Export when finance asks', 'Share a period without screenshotting the dashboard.'],
    ],
    faqs: [
      ['Can we custom-build every chart?', 'You get the operational views tied to Caretraqer data. Unusual board reports can start from an export.'],
    ],
  },
  evv_visit_verification: {
    lead: 'A verified visit is a set of facts: the client, the caregiver, the time, and the place—reviewed when something does not match.',
    points: [
      ['Who and when', 'The assigned caregiver and the recorded start and end.'],
      ['Where', 'Location when the device can provide it, compared with the client address.'],
      ['Exceptions', 'Late, missing, or mismatched visits are listed for a coordinator, not hidden in a log.'],
      ['Use in billing prep', 'Clean visits are easier to support. Broken ones should be fixed before a claim is built.'],
    ],
    faqs: [
      ['Does verification guarantee payer approval?', 'No. It gives you a stronger record. Each payer still applies its own rules.'],
    ],
  },
  evv_care_notes: {
    lead: 'A note should tell the next caregiver what happened, in plain language, on the same visit they just closed.',
    points: [
      ['On the visit', 'Write the note while the check-out is fresh, not at the end of the week.'],
      ['What to include', 'Tasks completed, changes in the client, and anything the office must know.'],
      ['Who can read it', 'The care team for that client. Not every employee in the agency.'],
      ['History', 'Previous notes stay on the client so a substitute caregiver is not starting blind.'],
    ],
    faqs: [
      ['Is there a required clinical template?', 'Use the fields and forms your agency already approves. The product stores them with the visit.'],
    ],
  },
  evv_missed_visit_alerts: {
    lead: 'A missed visit is an operations problem first: someone expected care and it did not start.',
    points: [
      ['Notice quickly', 'Alert the office when a scheduled visit has no check-in.'],
      ['Reach the caregiver', 'Confirm a delay before you reassign the visit.'],
      ['Cover the client', 'Offer another caregiver or tell the family what changed.'],
      ['Record the reason', 'Call-out, hospitalization, or refusal should be on the visit so payroll and billing are not guessing.'],
    ],
    faqs: [
      ['Will every late visit page the owner?', 'Set the follow-up so coordinators see it first. Escalate when your policy says to.'],
    ],
  },
  evv_compliance: {
    lead: 'EVV rules differ by state and payer. Caretraqer helps you capture the visit facts those programs ask about.',
    points: [
      ['The usual data points', 'Client, caregiver, service, date, start, end, and location when required.'],
      ['Your configuration', 'We set the product around the programs you actually bill.'],
      ['Review, do not assume', 'An exception queue is part of compliance, not a failure of the software.'],
      ['Honest limit', 'Caretraqer does not automatically make an agency compliant. Your team still follows payer and state rules.'],
    ],
    faqs: [
      ['Which states are supported?', 'Tell us where you operate and which programs you bill. We will confirm the fit before you switch.'],
    ],
  },
  evv_realtime_monitoring: {
    lead: 'Real-time monitoring is the coordinator’s board: who has arrived, who is late, and which visit needs a call.',
    points: [
      ['In progress', 'Visits that have a check-in and are still open.'],
      ['Not started', 'Scheduled visits past their window with no check-in.'],
      ['Completed', 'Visits with an end time, ready for notes review if needed.'],
      ['Act from the row', 'Call, reassign, or open the client without hunting through yesterday’s export.'],
    ],
    faqs: [
      ['Is this GPS tracking all day?', 'It is visit status for scheduled care. It is not a public tracker of caregivers between clients.'],
    ],
  },
};
