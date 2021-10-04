const { MessagePayload, MessageOptions, User, BaseGuildTextChannel } = require("discord.js");
const { getJson } = require("@utils/httpUtils");
const config = require("@root/config.js");
const { success, warn, error, log } = require("@src/helpers/logger");

async function checkForUpdates() {
  const response = await getJson("https://api.github.com/repos/saiteja-madha/discord-js-bot/releases/latest");
  if (!response.success) return error("VersionCheck: Failed to check for bot updates");
  if (response.data) {
    if (require("@root/package.json").version.replace(/[^0-9]/g, "") >= response.data.tag_name.replace(/[^0-9]/g, "")) {
      success("VersionCheck: Your discord bot is up to date");
    } else {
      warn(`VersionCheck: ${response.data.tag_name} update is available`);
      warn("download: https://github.com/saiteja-madha/discord-js-bot/releases/latest");
    }
  }
}

function validateConfig() {
  log("Validating config.js and environment variables");
  // Validate .env file
  if (!process.env.BOT_TOKEN) {
    error("env: BOT_TOKEN cannot be empty");
    process.exit();
  }
  if (!process.env.MONGO_CONNECTION) {
    error("env: MONGO_CONNECTION cannot be empty");
    process.exit();
  }
  if (config.DASHBOARD.enabled) {
    if (!process.env.BOT_SECRET) {
      error("env: BOT_SECRET cannot be empty");
      process.exit();
    }
    if (!process.env.SESSION_PASSWORD) {
      error("env: SESSION_PASSWORD cannot be empty");
      process.exit();
    }
  }
  if (!process.env.WEATHERSTACK_KEY) {
    warn("env: WEATHERSTACK_KEY is missing. Weather command won't work");
  }

  // Validate config.js file
  if (isNaN(config.CACHE_SIZE.GUILDS) || isNaN(config.CACHE_SIZE.USERS) || isNaN(config.CACHE_SIZE.MEMBERS)) {
    error("config.js: CACHE_SIZE must be a positive integer");
    process.exit();
  }
  if (!config.PREFIX) {
    error("config.js: PREFIX cannot be empty");
    process.exit();
  }
  if (config.DASHBOARD.enabled) {
    if (!config.DASHBOARD.baseURL || !config.DASHBOARD.failureURL || !config.DASHBOARD.port) {
      error("config.js: DASHBOARD details cannot be empty");
      process.exit();
    }
  }
  if (config.OWNER_IDS.length === 0) warn("config.js: OWNER_IDS are empty");
  if (!config.BOT_INVITE) warn("config.js: BOT_INVITE is not provided");
  if (!config.SUPPORT_SERVER) warn("config.js: SUPPORT_SERVER is not provided");
}

async function startupCheck() {
  await checkForUpdates();
  validateConfig();
}

/**
 * @param {BaseGuildTextChannel} channel
 * @param {string | MessagePayload | MessageOptions} message
 */
async function sendMessage(channel, message) {
  if (!channel || !message) return;
  if (!channel.permissionsFor(channel.guild?.me).has("SEND_MESSAGES")) return;
  try {
    return await channel.send(message);
  } catch (ex) {
    error(`sendMessage`, ex);
  }
}

/**
 * @param {User} user
 * @param {string|MessagePayload|MessageOptions} message
 */
async function safeDM(user, message) {
  if (!user || !message) return;
  try {
    return await user.send(message);
  } catch (ex) {
    error(`safeDM`, ex);
  }
}

const permissions = {
  CREATE_INSTANT_INVITE: "Create instant invite",
  KICK_MEMBERS: "Kick members",
  BAN_MEMBERS: "Ban members",
  ADMINISTRATOR: "Administrator",
  MANAGE_CHANNELS: "Manage channels",
  MANAGE_GUILD: "Manage server",
  ADD_REACTIONS: "Add Reactions",
  VIEW_AUDIT_LOG: "View audit log",
  PRIORITY_SPEAKER: "Priority speaker",
  STREAM: "Video",
  VIEW_CHANNEL: "View channel",
  SEND_MESSAGES: "Send messages",
  SEND_TTS_MESSAGES: "Send TTS messages",
  MANAGE_MESSAGES: "Manage messages",
  EMBED_LINKS: "Embed links",
  ATTACH_FILES: "Attach files",
  READ_MESSAGE_HISTORY: "Read message history",
  MENTION_EVERYONE: "Mention everyone",
  USE_EXTERNAL_EMOJIS: "Use external emojis",
  VIEW_GUILD_INSIGHTS: "View server insights",
  CONNECT: "Connect",
  SPEAK: "Speak",
  MUTE_MEMBERS: "Mute members",
  DEAFEN_MEMBERS: "Deafen members",
  MOVE_MEMBERS: "Move members",
  USE_VAD: "Use voice activity",
  CHANGE_NICKNAME: "Change nickname",
  MANAGE_NICKNAMES: "Manage nicknames",
  MANAGE_ROLES: "Manage roles",
  MANAGE_WEBHOOKS: "Manage webhooks",
  MANAGE_EMOJIS_AND_STICKERS: "Manage emojis and stickers",
  USE_APPLICATION_COMMANDS: "Use Application Commands",
  REQUEST_TO_SPEAK: "Request to Speak",
  MANAGE_THREADS: "Manage Threads",
  USE_PUBLIC_THREADS: "Use Public Threads",
  USE_PRIVATE_THREADS: "Use Private Threads",
  USE_EXTERNAL_STICKERS: "Use External Stickers",
};

module.exports = {
  permissions,
  sendMessage,
  safeDM,
  startupCheck,
};
