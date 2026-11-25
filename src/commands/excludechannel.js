const { ApplicationCommandOptionType, ChannelType, PermissionsBitField, MessageFlags } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
	name: "excludechannel",
	description: "Excludes a channel from being logged",
	enabled: true,
	options: [{
		name: 'channel',
		description: 'The channel to exclude from logging',
		required: true,
		type: ApplicationCommandOptionType.Channel,
	}],
	callback: async (client, interaction) => {
		try {
			if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) {
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

			let guildData = await getGuild(interaction.guildId);
			let ignoreList = guildData.ignore;

			for (var i = 0; i < ignoreList.length; i++) {
				let channelId = ignoreList[i];
				if (channelId == channel.id) {
					return interaction.reply({ content: "❌ That channel is already excluded from logging!", flags: MessageFlags.Ephemeral });
				}
			}

			ignoreList.push(channel.id);
			await setGuild(interaction.guildId, { ignore: ignoreList});
			await interaction.reply(`✅ Successfully added ${channel.url} to the exclusion list!`);

			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;

			let embed = {
				title: "Channel is no longer being logged",
				color: 0x00FF00,
				description: `
> Channel: ${channel.url}
> Perpetrator: ${interaction.member.displayName} \`${interaction.member.id}\``
			};

			await logChannel.send({ embeds: [embed] });
		} catch (error) {
			console.error("❌ Failed to add channel to exclusion list: ", error);
		}
	},
};
