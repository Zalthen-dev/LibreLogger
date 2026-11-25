const { ApplicationCommandOptionType, ChannelType, PermissionsBitField, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
	name: "clearlogchannel",
	description: "Unsets the channel that is logged to, disabling logging",
	enabled: true,
	//options: [],
	callback: async (client, interaction) => {
		try {
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
				return interaction.reply({ content: "❌ You don't have sufficient permissions to use this command!", flags: MessageFlags.Ephemeral });
			}
		
			const guild = interaction.guild;
			if (!guild) {
				console.warn("⚠️ Couldn't get guild from interaction!");
				return;
			}

			let guildData = await getGuild(interaction.guildId);

			if (guildData.logChannel.length == 0) {
				return interaction.reply({ content: "❌ No log channel is currently set.", flags: MessageFlags.Ephemeral });
			}

			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (logChannel) {
				let embed = {
					title: "Logging is being disabled",
					color: 0x00FF00,
					description: `
> Perpetrator: ${interaction.member.displayName} \`${interaction.member.id}\`

This means **NO** new message and member events will be logged.`
				};

				await logChannel.send({ embeds: [embed] });
			}

			guildData.logChannel = "";
		
			await interaction.reply(`✅ Successfully disabled logging!`);
		} catch (error) {
			console.error("❌ Failed to set log channel: ", error);
		}
	},
};
