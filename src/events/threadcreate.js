require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

const client = require("../client.js");

module.exports = {
	eventType: Events.ThreadCreate,
	once: false,
	enabled: true,
	callback: async (thread) => {
		try {
			let guildData = await getGuild(thread.guildId);
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (logChannel) {
				let creator = await thread.fetchOwner();
				let creatorTag = creator ? creator.tag : `[Unknown Creator]`;
				
				const embed = {
					title: "Thread Created",
					color: 0x567890,
					description: `
> Thread: ${thread.url}
> Thread name: ${thread.name}
> Thread creator: ${creatorTag} (\`${thread.ownerId}\`)
> Thread created: <t:${Math.floor(thread.createdTimestamp / 1000)}:R>`
				};

				await logChannel.send({embeds: [embed], ephemeral: true});
			}

			if (!thread.joined) {
				await thread.join();
				console.log(`🧵 Joined new thread: '#${thread.name}'`);
			}
		} catch (error) {
			console.error(`❌ Couldn't handle thread creation '${thread.name}':`, error);
		}
	}
};