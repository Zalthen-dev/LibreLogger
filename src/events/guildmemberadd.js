require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");
const client = require("../client.js");

module.exports = {
	eventType: Events.GuildMemberAdd,
	once: false,
	enabled: true,
	callback: async (member) => {
		try {
			let guildData = await getGuild(member.guild.id);
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;

			const embed = {
				title: "Member Joined",
				color: 0x5AD662,
				description: `
> Member joined Server: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>
> Member joined Discord: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>
> Member: ${member.user.tag} (\`${member.user.id}\`)
`
			};

			await logChannel.send({ embeds: [embed]});
		} catch (error) {
			console.error("❌ Failed to log member joining:", error);
		}
	}
};