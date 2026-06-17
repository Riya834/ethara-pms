const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 120, trim: true },
    description: { type: String, maxlength: 2000, default: '' },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['team_leader', 'project_manager', 'team_member', 'hr'],
          required: true,
        },
      },
    ],
    deadline: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    canvasId: { type: mongoose.Schema.Types.ObjectId, ref: 'Canvas', default: null },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Project', projectSchema);
