const { ApplicationCommandOptionType, ChannelType, PermissionsBitField, MessageFlags } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
	name: "includechannel",
	description: "Includes a channel to be logged",
	enabled: true,
	options: [{
		name: 'channel',
		description: 'The channel to be logged',
		required: true,
		type: ApplicationCommandOptionType.Channel,
	}],
	callback: async (client, interaction) => {
		//await interaction.reply({ content: "ℹ️ This command hasn't been implemented yet, annoy the developer into doing so", flags: MessageFlags.Ephemeral });

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
		
			let guildData = await getGuild(interaction.guildId);
			let ignoreList = guildData.ignore;
		
			let isBeingLogged = false;
			let targetIndex = -1;
			for (var i = 0; i < ignoreList.length; i++) {
				let channelId = ignoreList[i];
				if (channelId == channel.id) {
					isBeingLogged = true;
					targetIndex = i;
					break;
				}
			}
		
			if (!isBeingLogged) {
				return interaction.reply({ content: "❌ That channel is already being logged!", flags: MessageFlags.Ephemeral });
			}
		
			ignoreList.splice(targetIndex, 1);
			await setGuild(interaction.guildId, { ignore: ignoreList});
			await interaction.reply(`✅ Successfully removed ${channel.url} from the exclusion list!`);

			const logChannel = await client.channels.fetch(guildData.logChannel);
			if (!logChannel) return;

			let embed = {
				title: "Channel is now being logged",
				color: 0x00FF00,
				description: `
> Channel: ${channel.url}
> Perpetrator: ${interaction.member.displayName} \`${interaction.member.id}\``
			};

			await logChannel.send({ embeds: [embed] });
		} catch (error) {
			console.error("❌ Failed to remove channel to exclusion list: ", error);
		}
	},
};
