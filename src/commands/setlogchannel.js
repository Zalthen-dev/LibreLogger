const { ApplicationCommandOptionType, ChannelType, PermissionsBitField, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
	name: "setlogchannel",
	description: "Set channel to send log messages to",
	enabled: true,
	options: [{
		name: 'channel',
		description: 'The channel to send logs to',
		required: true,
		type: ApplicationCommandOptionType.Channel,
	}],
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
		
			const channel = interaction.options.getChannel("channel");
			if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
				return interaction.reply({ content: "❌ Please select a valid text channel.", flags: MessageFlags.Ephemeral });
			}

			const perms = channel.permissionsFor(interaction.guild.members.me);
			if (!perms.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
				return interaction.reply({ content: "❌ I'm unable to send messages in that channel! Make sure I have permission to view it and send messages", flags: MessageFlags.Ephemeral });
			}
		
			let guildData = await getGuild(interaction.guildId);
			guildData.logChannel = channel.id.toString();

			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (logChannel) {
				let embed = {
					title: "Log Channel Set",
					color: 0x00FF00,
					description: `
> Perpetrator: ${interaction.member.displayName} \`${interaction.member.id}\`

Any new message and member events will be logged here.`
				};

				await logChannel.send({ embeds: [embed] });
			}
		
			await setGuild(interaction.guildId, { logChannel: channel.id });
			await interaction.reply(`✅ Successfully changed the log channel to ${channel.url}!`);
		} catch (error) {
			console.error("❌ Failed to set log channel: ", error);
		}
	},
};
