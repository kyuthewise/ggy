module.exports = {
	help: ()=> "Set whether certain commands can only be used by mods.",
	usage: ()=> [" [command] [true/1 | false/0] - Sets whether the given command is mod-only."],
	desc: ()=> "Commands that can be set to mod only are `add`, `remove`, `rename`, `description`, `close`, and `reopen`.\nMod-only commands can only be used by users with the `manageChannels` permission.",
	execute: async (bot, msg, args) => {
		if(!args[1]) return "Please provide a command and what to set its mod-only status to.\nExample: `tg!modonly add 1` (set the `add` command to be mod-only)";

		var cfg = await bot.stores.configs.get(msg.guild.id);
		if(!cfg) cfg = {new: true, mod_only: []}
		if(!["add", "remove", "rename", "description", "close", "open", "reopen"].includes(args[0].toLowerCase())) return msg.channel.send("That command can't be made mod-only.");
		if(!["true", "false", "0", "1"].includes(args[1].toLowerCase())) return "Invalid second argument.\nValid arguments:\n`1 or true` - Sets the command to be mod-only.\n`0 or false` - Sets the command to be usable by non-mods.";

		if(["true", "1"].includes(args[1].toLowerCase())) {
			if(cfg.mod_only?.includes(args[0].toLowerCase())) return "That command is already mod-only.";

			if(!cfg.mod_only) cfg.mod_only = [args[0].toLowerCase()];
			else cfg.mod_only.push(args[0].toLowerCase());
		} else {
			if(cfg.mod_only && !cfg.mod_only.includes(args[0].toLowerCase())) return "That command is already not mod-only.";
			
			cfg.mod_only = cfg.mod_only.filter(x => x!= args[0].toLowerCase());
		}

		try {
			if(cfg.new) await bot.stores.configs.create(msg.guild.id, {mod_only: cfg.mod_only});
			else await bot.stores.configs.update(msg.guild.id, {mod_only: cfg.mod_only});
		} catch(e) {
			return "Error:\n"+e;
		}

		return "Config set.";
	},
	permissions: ["MANAGE_GUILD"],
	guildOnly: true,
	alias: ["md", "mod", "mods"]
}