require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

const client = require("../client.js");

module.exports = {
	eventType: Events.MessageUpdate,
	once: false,
	enabled: true,
	callback: async (oldMessage, newMessage) => {
		try {
			if (!newMessage.guildId) return;
			if (oldMessage.content == newMessage.content) return;

			if (newMessage.author && newMessage.author.bot) return;

			let guildData = await getGuild(newMessage.guildId);
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;

			const authorName = newMessage.author ? newMessage.author.tag : "`[unknown author]`"
			const authorId = newMessage.author ? newMessage.author.id : "nil"

			const oldContent = oldMessage.partial ? "`[uncached content]`" : oldMessage.content
			const newContent = newMessage.content || "`[no content]`";

			let embed = {
				title: "Message Edited",
				color: 0xE67E22,
				description: `
> Channel: ${newMessage.channel.url}
> Message ID: [${newMessage.id}](${newMessage.channel.url}/${newMessage.id})
> Message author: ${authorName} (\`${authorId}\`)
> Message edited: <t:${Math.floor((Date.now() + 500) / 1000)}:R>

**After**
${newContent}

**Before**
${oldContent}
`};

			if (!message.partial && message.attachments) {
				embed.description.concat("\n```");

				for (let i = 0; i < message.attachments.length; i++) {
					const attachment = message.attachments[i];
					embed.description.concat(`
[attachment:${i}]:
URL: ${attachment.url}
Proxy URL: ${attachment.proxyURL}
Type: ${attachment.contentType}
Filename: ${attachment.name}`);
				}
				embed.description.concat("\n```");
			}

			await logChannel.send({ embeds: [embed]});
		} catch (error) {
			console.error("❌ Failed to log edited message:", error);
		}
	}
};