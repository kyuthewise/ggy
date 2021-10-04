const { Guild, MessageEmbed } = require("discord.js");
const { BotClient } = require("@src/structures");
const { registerGuild } = require("@schemas/guild-schema");

/**
 * @param {BotClient} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true });
  client.logger.log(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`);
  await registerGuild(guild);

  if (!client.joinLeaveWebhook) return;

  const embed = new MessageEmbed()
    .setTitle("Guild Joined")
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.SUCCESS_EMBED)
    .addField("Name", guild.name, false)
    .addField("ID", guild.id, false)
    .addField("Owner", `${client.users.cache.get(guild.ownerId).tag} [\`${guild.ownerId}\`]`, false)
    .addField("Members", `\`\`\`yaml\n${guild.memberCount}\`\`\``, false)
    .setFooter(`Guild #${client.guilds.cache.size}`);

  client.joinLeaveWebhook.send({
    username: "Join",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
