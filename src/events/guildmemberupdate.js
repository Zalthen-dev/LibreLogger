require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");
const client = require("../client.js");

module.exports = {
	eventType: Events.GuildMemberUpdate,
	once: false,
	enabled: true,
	callback: async (oldMember, newMember) => {
		try {
			let guildData = await getGuild(newMember.guild.id ?? oldMember.guild.id);
			if (!guildData) return;
			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;
		
			const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
			const newTimeout = newMember.communicationDisabledUntilTimestamp;
		
			const oldNick = oldMember.nickname;
			const newNick = newMember.nickname;
		
			const logs = await newMember.guild.fetchAuditLogs({
				type: AuditLogEvent.MemberUpdate,
				limit: 1,
			});
		
			const entry = logs.entries.first();
			let moderator = (entry && entry.target.id === newMember.id) ? entry.executor.tag : "[Unknown Moderator]"
			let moderatorId = (entry && entry.target.id === newMember.id) ? `(${entry.executor.id})` : ""
		
			let embed = null;
			if (!oldTimeout && newTimeout) {
				embed = {
					title: "Timeout Added",
					color: 0x2D74A6,
					description: `
> Member: ${newMember.user.tag ?? oldMember.user.tag} (\`${newMember.user.id}\`)
> Member timed out until: <t:${Math.floor(newTimeout / 1000)}:R>
> Perpretrator: ${moderator} (\`${moderatorId}\`)`
				}
			}

			if (oldTimeout && !newTimeout) {
				embed = {
					title: "Timeout Removed",
					color: 0x2D74A6,
					description: `
> Member: ${newMember.user.tag ?? oldMember.user.tag} (\`${newMember.user.id}\`)
> Member timed out until: <t:${Math.floor(oldTimeout / 1000)}:R>
> Perpretrator: ${moderator} (\`${moderatorId}\`)`
				}
			}

			if (oldNick != newNick) {
				embed = {
					title: "User Nickname Changed",
					color: 0x2D74A6,
					description: `
> Member: ${newMember.user.tag ?? oldMember.user.tag} (\`${newMember.user.id}\`)
> Nickname Before: \`${oldNick ?? "[Unknown Nickname]"}\`
> Nickname After: \`${newNick ?? "[Unknown Nickname]"}\`
> Perpretrator: ${moderator} (\`${moderatorId}\`)`
				}
			}

			if (embed) await logChannel.send({ embeds: [embed]});
		} catch (error) {
			console.error("❌ Failed to log member change:", error);
		}
	}
};