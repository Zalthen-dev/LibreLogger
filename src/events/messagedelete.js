require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

const client = require("../client.js");

module.exports = {
	eventType: Events.MessageDelete,
	once: false,
	enabled: true,
	callback: async (message) => {
		try {
			if (message.author && message.author.bot) return;

			let guildData =    await getGuild(message.guildId);
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;

			const content =    message.partial ? "[unknown content]" : message.content;
			const authorName = message.author ? message.author.tag : "[unknown author]"
			const authorId =   message.author ? message.author.id : "nil"

			let embed = {
				title: "Message Deleted",
				color: "8530669",
				description: `
> Channel: ${message.channel.url}
> Message ID: [${message.id}](${message.channel.url}/${message.id})
> Message author: ${authorName} (\`${authorId}\`)
> Message deleted: <t:${Math.floor((Date.now() + 500) / 1000)}:R>

**Content**
${content}`
			};

			console.log(`Partial: ${message.partial}, Attachments: ${message.attachments.size}`);
			if (!message.partial && message.attachments.size > 0) {
				embed.description = embed.description.concat("\n**Attachments**\n```");

				let i = 0;
				for (const attachment of message.attachments.values()) {
					embed.description = embed.description.concat(`
[attachment:${i}]:
URL: ${attachment.url}
Proxy URL: ${attachment.proxyURL}
Type: ${attachment.contentType}
Filename: ${attachment.name}`
);
				}
				i++;
				embed.description = embed.description.concat("\n```");
			}

			await logChannel.send({ embeds: [embed]});
		} catch (error) {
			console.error("❌ Failed to log deleted message: ", error)
		}
	}
};