const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'sticky', 'shape', 'freehand', 'arrow'], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: '' },
    style: { type: mongoose.Schema.Types.Mixed, default: {} },
    width: { type: Number },
    height: { type: Number },
    points: { type: mongoose.Schema.Types.Mixed },
    shapeType: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false }
);

const snapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    elements: [elementSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const canvasSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, default: 'Project Board' },
    elements: [elementSchema],
    version: { type: Number, default: 1 },
    snapshots: [snapshotSchema],
  },
  { timestamps: true }
);

canvasSchema.index({ project: 1 });

module.exports = mongoose.model('Canvas', canvasSchema);
