import { StageMeta } from './types'

export const STAGES: StageMeta[] = [
  {
    number: 1,
    name: 'Conceptualisation + Review Meeting',
    description: 'Define the product concept, learning objectives, and target audience. Get written approval from PDT Head before proceeding.',
    checklist: [
      { item: 'Product concept clearly defined with a working title', notes: 'Write 2–3 sentences describing the product' },
      { item: 'Learning objectives listed (minimum 3) — provided by PDT Head', notes: 'Knowledge, Understanding, Application, Analyse, Evaluate, Create' },
      { item: 'Target audience defined (age group, level, prior knowledge)', notes: 'E.g. Class 6–8, no prior astronomy knowledge' },
      { item: 'Program structure outlined (number of sessions, approximate duration each)', notes: 'E.g. 4 sessions × 90 minutes' },
      { item: 'Conceptualisation document submitted to PDT Head', notes: 'Share as a written document, not verbal-only' },
      { item: 'PDT Head has reviewed and provided written approval to proceed', notes: 'Wait for written go-ahead before Stage 2', pdt: true },
    ],
  },
  {
    number: 2,
    name: 'Making the Gist',
    description: 'Prepare a one-page Gist document summarising the product concept, objectives, and key teaching points.',
    checklist: [
      { item: 'Gist document drafted (1 page)', notes: 'Document code: [Code](5).0.0 – Gist' },
      { item: 'Gist includes: title, objectives, content summary, key topics', notes: 'Gist template available from PDT' },
      { item: 'Gist reviewed and approved by PDT Head in writing', notes: 'N/A — PDT Head action', pdt: true },
    ],
  },
  {
    number: 3,
    name: 'R&D of Teaching Aids & Kit',
    description: 'Research and prototype all teaching aids, kits, and materials. Document what was tested and selected.',
    checklist: [
      { item: 'Research log maintained — sources, references, and findings documented', notes: 'Free-form log; PDT Head can provide feedback' },
      { item: 'All teaching aids identified and prototyped / sourced', notes: 'List all aids in the Material List' },
      { item: 'Kit components identified; BOM drafted if any item is to be manufactured', notes: 'BOM required for all physical Items' },
      { item: 'Ambience material identified', notes: 'Record in Venue Layout (Stage 8)' },
      { item: 'Material quantities calculated per batch (state assumed batch size)', notes: 'E.g. Per batch of 15 students' },
      { item: 'Prototypes reviewed internally before demo', notes: '' },
      { item: 'Approved for any safety concerns', notes: '' },
      { item: 'Branding material identified', notes: '' },
    ],
  },
  {
    number: 4,
    name: 'Internal Team Demo & Review',
    description: 'Conduct a demo for the internal education team. Collect and document feedback using PDT feedback forms.',
    checklist: [
      { item: 'Full demo conducted with internal team', notes: 'Record date, venue, and attendees' },
      { item: 'Feedback collected in writing from all attendees', notes: 'Use standard feedback form or written notes' },
      { item: 'Feedback compiled into a changes list', notes: 'Document what will change and what will not' },
      { item: 'Demo notes and feedback report submitted to PDT Head', notes: '' },
    ],
  },
  {
    number: 5,
    name: 'Product Showcase',
    description: 'Conduct a full showcase for Production, Academic Support, Marketing, Education Team, and PDT. Venue must be booked at least 2 days before. EA samples and kit are mandatory.',
    checklist: [
      { item: 'Product showcase date confirmed with PDT Head — minimum 2 days notice', notes: 'Venue booked and communicated to all attendees' },
      { item: 'Venue booked and demo attendees notified', notes: 'After venue booking is confirmed' },
      { item: 'All materials acquired/prepared for the demonstration', notes: 'Developer responsibility' },
      { item: 'EA samples present at demo (mandatory — demo cannot proceed without)', notes: 'Hard gate — no EA samples = no demo' },
      { item: 'Kit present at demo (mandatory — demo cannot proceed without)', notes: 'Hard gate — no kit = no demo' },
      { item: 'Full demo conducted with PDT/SPACE team', notes: 'Record date, venue, and attendees' },
      { item: 'Production and Academic Support teams familiarised with all materials', notes: 'They may leave early once familiarised' },
      { item: 'Feedback collected in writing from PDT/Astroport/STEPL team', notes: 'Use standard feedback form or written notes' },
      { item: 'Feedback compiled into updated changes list', notes: 'Document what will change and what will not' },
      { item: 'External demo notes and feedback report submitted to PDT Head', notes: '' },
    ],
  },
  {
    number: 6,
    name: 'Post-Demo Changes',
    description: 'Incorporate all feedback from Stages 4 and 5. Track every change item. Major changes require a re-demo; minor changes are shown to attendees for approval.',
    checklist: [
      { item: 'All accepted feedback from Stages 4 & 5 incorporated', notes: 'No feedback item dropped without Astroport or STEPL Head written approval' },
      { item: 'Change log prepared: each change, reason, and who requested it', notes: 'Per-item tracking in app' },
      { item: 'Major changes: re-demo conducted', notes: 'Required if product changes are substantial' },
      { item: 'Minor changes: shown to demo attendees for approval', notes: 'Attendees confirm minor changes are acceptable' },
      { item: 'Updated prototype / run-through reviewed internally', notes: '' },
      { item: 'Change log submitted to PDT Head for sign-off', notes: '', pdt: true },
    ],
  },
  {
    number: 7,
    name: 'Coding',
    description: 'Program, Session, and Item codes are auto-generated by the system. Developer requests codes in the app; system allocates them. PDT Head is notified to verify.',
    checklist: [
      { item: 'Program Code, Session Code(s), and Item Code(s) requested from system', notes: 'Do NOT self-assign codes — system generates all codes' },
      { item: 'All codes received and confirmed before renaming any folder or file', notes: 'PDT Head notified automatically to verify codes' },
      { item: 'Program folder renamed: [ProgramCode].0.0 – [Program Name]', notes: 'E.g. AP-235.0.0 – Search for ET Life' },
      { item: 'Each Session folder renamed: [SessionCode].0.0 – [Session Name]', notes: 'E.g. AS-412.0.0 – Life Beyond Earth' },
      { item: 'Each Item folder renamed: [ItemCode]–[Item Name]', notes: 'E.g. AI-143–Mars Roving Vehicle PPT' },
      { item: 'All documents named as per document coding convention', notes: 'See Document Code Reference' },
    ],
  },
  {
    number: 8,
    name: 'Documents',
    description: 'Prepare all required documents. Mix of in-app creation and file uploads. All must be complete, correctly named, and saved before submitting.',
    checklist: [
      // 8A Program
      { item: '8A — PCP (Program Conduction Plan) complete', notes: 'Code: [ProgramCode](1).0.0 – PCP' },
      { item: '8A — PCP includes all sessions in order with names and codes', notes: '' },
      { item: '8A — PCP includes program overview, objectives, total duration', notes: '' },
      { item: '8A — PCP includes roles of all team members', notes: '' },
      { item: '8A — PCP includes pre-program checklist', notes: '' },
      { item: '8A — Role of Assistants document complete', notes: 'Code: [ProgramCode](2).0.0 – Role of Assistants' },
      { item: '8A — Material List (Program Level) complete', notes: 'Code: [ProgramCode](3).0.0 – Material List' },
      { item: '8A — Execution Time by Module complete', notes: 'Code: [ProgramCode](4).0.0 – Execution Time' },
      { item: '8A — Gist (final version) complete', notes: 'Code: [ProgramCode](5).0.0 – Gist' },
      { item: '8A — Venue Layout complete (including ambience plan)', notes: 'Code: [ProgramCode](6).0.0 – Venue Layout' },
      { item: '8A — Support Documents uploaded (if any)', notes: 'Code: [ProgramCode](8).0.0 – Support Docs' },
      // 8B Session
      { item: '8B — Lesson Plan complete for every session', notes: 'Code: [SessionCode](1).0.0 – Lesson Plan' },
      { item: '8B — Material List complete for every session', notes: 'Code: [SessionCode](2).0.0 – Material List' },
      { item: '8B — Support Documents for each session (if any)', notes: 'Code: [SessionCode](4).0.0 – Support Docs' },
      // 8C Items
      { item: '8C — Item name and type confirmed for each in-house item', notes: 'Educational Aid, Kit, or Support Material' },
      { item: '8C — BOM complete for all physical items', notes: 'Includes components, quantity, unit cost, total cost' },
      { item: '8C — Assembly instructions documented for physical items', notes: 'With diagrams or photos' },
      { item: '8C — Final file submitted in correct format for digital items', notes: 'E.g. .pptx, .mp4, .pdf' },
      { item: '8C — Editable source file included for digital items', notes: 'E.g. include .pptx, not just PDF export' },
      { item: '8C — All item folders correctly named', notes: '[ItemCode]–[Item Name]' },
    ],
  },
  {
    number: 9,
    name: 'Pre-Handover & Handover',
    description: 'Verify all deliverables, fill Pre-Handover Form, and trigger formal handover. App copies files to P-Drive and Handover Drives automatically on PDT Head sign-off.',
    checklist: [
      { item: 'All Stage 1–8 checklist items ticked in Dev column', notes: 'Do not submit unless all complete' },
      { item: 'All files saved in correct folder structure', notes: 'Per document code convention' },
      { item: 'No files in Draft or WIP status — all are final versions', notes: '' },
      { item: 'Database entries correctly done', notes: 'Programs, Sessions, Items tables complete' },
      { item: 'Item samples / files submitted to PDT Store', notes: 'Physical: one sample set. Digital: share access link' },
      { item: 'Pre-Handover Form correctly filled', notes: 'In-app form covering all program, session, and item documents' },
      { item: 'Completed Developer Brief submitted to PDT Head', notes: 'All Dev boxes ticked' },
      { item: 'All files and folders provided to PDT in designated location', notes: 'Notify PDT: "Handover Ready – [Program Code] – [Program Name]"' },
      { item: 'PDT Head final sign-off given', notes: 'Triggers automatic file copy to P-Drive and Handover Drives', pdt: true },
      { item: 'Department-specific handover notifications sent by app', notes: 'Education, Production, Accounts, IT, Sales & Marketing, Academic Support', pdt: true },
    ],
  },
]

export function getStageMeta(stageNumber: number): StageMeta | undefined {
  return STAGES.find(s => s.number === stageNumber)
}
