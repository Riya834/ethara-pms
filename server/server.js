const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { createTransporter } = require('./config/nodemailer');
const initSocket = require('./socket');
const cron = require('node-cron');
const { port } = require('./config/env');

const server = http.createServer(app);
const io = initSocket(server);

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Daily cron: check overdue tasks and send notifications
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running overdue task check...');
  try {
    const Task = require('./models/Task.model');
    const Notification = require('./models/Notification.model');
    const { sendMail } = require('./config/nodemailer');

    const overdueTasks = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    }).populate('assignee', 'name email').populate('project', 'title').lean();

    for (const task of overdueTasks) {
      if (task.assignee) {
        await Notification.create({
          recipient: task.assignee._id,
          type: 'task_overdue',
          message: `Task "${task.title}" is overdue`,
          meta: { taskId: task._id, taskTitle: task.title, projectId: task.project?._id, projectName: task.project?.title },
        });
        sendMail({
          to: task.assignee.email,
          subject: `⚠️ Overdue Task: ${task.title}`,
          html: `<p>Hi ${task.assignee.name},</p><p>Your task <strong>${task.title}</strong> is overdue. Please update its status.</p>`,
        }).catch(console.error);
      }
    }
    console.log(`✅ Processed ${overdueTasks.length} overdue tasks`);
  } catch (err) {
    console.error('Cron error:', err);
  }
}, { timezone: 'UTC' });

const start = async () => {
  await connectDB();
  await createTransporter();
  server.listen(port, () => {
    console.log(`🚀 Ethara PMS Server running on http://localhost:${port}`);
  });
};

start();
