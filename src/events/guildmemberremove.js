require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");
const client = require("../client.js");

module.exports = {
	eventType: Events.GuildMemberRemove,
	once: false,
	enabled: true,
	callback: async (member) => {
		try {
			let guildData = await getGuild(member.guild.id);
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;
			
			const embed = {
				title: "Member Left",
				color: 0xFF2B2B,
				description: `
> Member left Server: <t:${Math.floor((Date.now() + 500) / 1000)}:R>
> Member joined Discord: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>
> Member: ${member.user.tag} (\`${member.user.id}\`)
`
			};

			await logChannel.send({ embeds: [embed]});
		} catch (error) {
			console.error("❌ Failed to log member leaving:", error);
		}
	}
};