require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

const client = require("../client.js");

module.exports = {
	eventType: Events.ThreadDelete,
	once: false,
	enabled: true,
	callback: async (thread) => {
		try {
			let guildData = await getGuild(thread.guildId);
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;
			
			let startMessage = await thread.fetchStarterMessage();
			const embed = {
				title: "Thread Deleted",
				color: 0x906756,
				description: `
> Thread ID: ${thread.id}
> Thread name: ${thread.name}
> Thread creator: ${startMessage.member.tag} (\`${startMessage.member.id}\`)
> Thread created: <t:${Math.floor(thread.createdTimestamp / 1000)}:R>
> Thread members: ${thread.members.cache.size}
> Thread messages: ${thread.messages.cache.size}
`
			};

			await logChannel.send({embeds: [embed], ephemeral: true})
		} catch (error) {
			 console.error(`❌ Couldn't log thread deletion '${thread.name}':`, error);
		}
	}
};