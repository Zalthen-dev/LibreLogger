require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

module.exports = {
	eventType: Events.GuildDelete,
	once: false,
	callback: async (guild) => {
		console.log(`🗑️ Removed from guild: ${guild.name} (${guild.id}), cleaning up guild data...`);

		try {
			await deleteGuild(guild.id);
			console.log(`✅ Removed guild data from ${guild.name} (${guild.id})!`);
		} catch (error) {
			console.error("❌ Failed to clean up guild data:", error);
		}
	}
};