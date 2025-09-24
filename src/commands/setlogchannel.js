const { ApplicationCommandOptionType, ChannelType, PermissionsBitField } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
    name: "setlogchannel",
    description: "Set channel to send log messages to",
    options: [
        {
            name: 'channel',
            description: 'The channel to send logs to',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        }
    ],
    callback: async (client, interaction) => {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: "❌ You don't have sufficient permissions to use this command!", ephemeral: true });
            }

            const guild = interaction.guild;
            if (!guild) {
                console.warn("⚠️ Couldn't get guild from interaction!");
                return;
            }

            const channel = interaction.options.getChannel("channel");
            if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
                return interaction.reply({ content: "❌ Please select a valid text channel.", ephemeral: true });
            }
        
            let guildData = await getGuild(interaction.guildId);
            guildData.logChannel = channel.id.toString();

            await setGuild(interaction.guildId, { logChannel: channel.id });
            await interaction.reply(`✅ Successfully changed the log channel to ${channel.url}!`);
        } catch (error) {
            console.error("❌ Failed to set log channel: ", error);
        }
    },
};
