require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

module.exports = {
	eventType: Events.ClientReady,
	once: true,
	callback: async (client) => {
		console.log(`✅ ${client.user.tag} is online`);

		try {
			if (process.env.BOT_AUTOJOIN_THREADS.toLowerCase() == "true") {
				const threads = client.channels.cache.filter(x => x.isThread());
				
				for (const thread of threads.values()) {
					if (!thread.joined) {
						await thread.join().catch(() => {});
						console.log(`🧵 Joined thread: '#${thread.name}' in '${thread.guild.name}'`);
					}
				}
			}
		} catch (error) {
			console.error("❌ Failed to join threads:", error);
		}
	}
};