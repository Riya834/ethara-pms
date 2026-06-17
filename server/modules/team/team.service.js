const Team = require('../../models/Team.model');
const User = require('../../models/User.model');
const { sendMail } = require('../../config/nodemailer');

const getTeams = async () => {
  return Team.find()
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar role department')
    .lean();
};

const createTeam = async (body) => {
  const { name, department, leadId, memberIds = [] } = body;
  const members = [...new Set([leadId, ...memberIds])];
  return Team.create({ name, department, lead: leadId, members });
};

const getTeamById = async (id) => {
  const team = await Team.findById(id)
    .populate('lead', 'name email avatar role')
    .populate('members', 'name email avatar role department')
    .lean();
  if (!team) { const e = new Error('Team not found'); e.statusCode = 404; throw e; }
  return team;
};

const updateTeam = async (id, body) => {
  return Team.findByIdAndUpdate(id, body, { new: true })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar role');
};

const deleteTeam = async (id) => {
  const team = await Team.findById(id);
  if (!team) { const e = new Error('Team not found'); e.statusCode = 404; throw e; }
  await team.deleteOne();
};

const addMembers = async (id, userIds) => {
  const team = await Team.findById(id).populate('members', 'name email');
  if (!team) { const e = new Error('Team not found'); e.statusCode = 404; throw e; }

  for (const uid of userIds) {
    if (!team.members.find((m) => m._id.toString() === uid)) {
      team.members.push(uid);
      const user = await User.findById(uid).lean();
      if (user) {
        sendMail({
          to: user.email,
          subject: `Welcome to team "${team.name}"`,
          html: `<p>Hi ${user.name},</p><p>You've been added to the team <strong>${team.name}</strong> on Ethara PMS.</p>`,
        }).catch(console.error);
      }
    }
  }
  await team.save();
  return Team.findById(id).populate('members', 'name email avatar role');
};

const removeMember = async (id, userId) => {
  const team = await Team.findById(id);
  if (!team) { const e = new Error('Team not found'); e.statusCode = 404; throw e; }
  team.members = team.members.filter((m) => m.toString() !== userId);
  await team.save();
  return team;
};

module.exports = { getTeams, createTeam, getTeamById, updateTeam, deleteTeam, addMembers, removeMember };
