const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_status_changed',
        'task_overdue',
        'project_invite',
        'project_removed',
        'project_status_changed',
        'comment_mention',
        'team_added',
        'general',
      ],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    meta: {
      taskId: { type: mongoose.Schema.Types.ObjectId, default: null },
      taskTitle: { type: String, default: null },
      projectId: { type: mongoose.Schema.Types.ObjectId, default: null },
      projectName: { type: String, default: null },
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      fromUserName: { type: String, default: null },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
