const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS);

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  welcome: {
    enabled: Boolean,
    channel_id: String,
    embed: {
      description: String,
      color: String,
      thumbnail: Boolean,
      footer: String,
    },
  },
  farewell: {
    enabled: Boolean,
    channel_id: String,
    embed: {
      description: String,
      color: String,
      thumbnail: Boolean,
      footer: String,
    },
  },
});

const Model = mongoose.model("greeting-config", Schema);
const upsert = { upsert: true };

module.exports = {
  getConfig: async (guildId) => {
    if (cache.contains(guildId)) return cache.get(guildId);
    const config = await Model.findOne({ _id: guildId }).lean({ defaults: true });
    cache.add(guildId, config);
    return config;
  },

  setChannel: async (guildId, channelId, type) => {
    if (type === "welcome") {
      const update = {
        "welcome.channel_id": channelId,
        "welcome.enabled": !!channelId,
      };

      await Model.updateOne({ _id: guildId }, update, upsert);
    } else if (type === "farewell") {
      const update = {
        "farewell.channel_id": channelId,
        "farewell.enabled": !!channelId,
      };

      await Model.updateOne({ _id: guildId }, update, upsert);
    } else return;

    return cache.remove(guildId);
  },

  setDescription: async (guildId, content, type) => {
    if (type === "welcome") await Model.updateOne({ _id: guildId }, { "welcome.embed.description": content }, upsert);
    else if (type === "farewell") {
      await Model.updateOne({ _id: guildId }, { "farewell.embed.description": content }, upsert);
    } else return;
    return cache.remove(guildId);
  },

  setColor: async (guildId, color, type) => {
    if (type === "welcome") await Model.updateOne({ _id: guildId }, { "welcome.embed.color": color }, upsert);
    else if (type === "farewell") await Model.updateOne({ _id: guildId }, { "farewell.embed.color": color }, upsert);
    else return;
    return cache.remove(guildId);
  },

  setThumbnail: async (guildId, status, type) => {
    if (type === "welcome") await Model.updateOne({ _id: guildId }, { "welcome.embed.thumbnail": status }, upsert);
    else if (type === "farewell") {
      await Model.updateOne({ _id: guildId }, { "farewell.embed.thumbnail": status }, upsert);
    } else return;
    return cache.remove(guildId);
  },

  setFooter: async (guildId, content, type) => {
    if (type === "welcome") await Model.updateOne({ _id: guildId }, { "welcome.embed.footer": content }, upsert);
    else if (type === "farewell") await Model.updateOne({ _id: guildId }, { "farewell.embed.footer": content }, upsert);
    else return;
    return cache.remove(guildId);
  },
};
