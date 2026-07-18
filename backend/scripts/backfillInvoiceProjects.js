// One-time backfill: invoices generated before invoiceItemSchema gained
// projectId/projectTitle have items with no project info. This looks up
// each item's original WorkItem (still present, just marked billed) to
// recover which project it belonged to.
//
// Usage: node scripts/backfillInvoiceProjects.js

import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Invoice from '../src/models/Invoice.js';
import WorkItem from '../src/models/WorkItem.js';
import Project from '../src/models/Project.js';

const run = async () => {
  await connectDB();

  const invoices = await Invoice.find({ 'items.projectId': { $exists: false } });
  console.log(`Found ${invoices.length} invoice(s) with at least one item missing project info`);

  let updatedInvoices = 0;
  let updatedItems = 0;

  for (const invoice of invoices) {
    const workItemIds = invoice.items.map((item) => item.workItemId).filter(Boolean);
    const workItems = await WorkItem.find({ _id: { $in: workItemIds } }).select('projectId');
    const projectIdByWorkItem = new Map(workItems.map((w) => [String(w._id), w.projectId]));

    const projectIds = [...new Set([...projectIdByWorkItem.values()].map(String))];
    const projects = await Project.find({ _id: { $in: projectIds } }).select('title');
    const titleByProjectId = new Map(projects.map((p) => [String(p._id), p.title]));

    let changed = false;
    invoice.items.forEach((item) => {
      if (!item.projectId) {
        const projectId = projectIdByWorkItem.get(String(item.workItemId));
        if (projectId) {
          item.projectId = projectId;
          item.projectTitle = titleByProjectId.get(String(projectId)) || '';
          changed = true;
          updatedItems++;
        }
      }
    });

    if (changed) {
      await invoice.save();
      updatedInvoices++;
    }
  }

  console.log(`Backfilled ${updatedItems} item(s) across ${updatedInvoices} invoice(s)`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
