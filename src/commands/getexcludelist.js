const { getGuild } = require("../utils/guildStore.js");

module.exports = {
    name: "getexcludelist",
    description: "Get the list of channels excluded from logging",
    //options: [],
    callback: async (client, interaction) => {
        //await interaction.reply({ content: "ℹ️ This command hasn't been implemented yet, annoy the developer into doing so", ephemeral: true });

        try {
            const guild = interaction.guild;
            if (!guild) {
                console.warn("⚠️ Couldn't get guild from interaction!");
                return;
            }
            
            let guildData = await getGuild(interaction.guildId);
            let ignoreList = guildData.ignore;
            let text = "";
            
            if (ignoreList.length <= 0) {
                await interaction.reply({ content: "ℹ️ There are no channels in the exclusion list! You can add one with `/excludechannel`", ephemeral: true });
                return;
            }

            for (var i = 0; i < ignoreList.length; i++) {
                let channelId = ignoreList[i];

                text = text + `${"https://discord.com/channels/" + guild.id + "/" + channelId}, `;
            }

            text = text.substring(0, text.length - 2);
            
            const embed = {
                title: "Log Exclusion List",
                color: 0x749124,
                description: text
            };

            await interaction.reply({embeds:[embed], ephemeral: true});
        } catch (error) {
            console.error("❌ Failed to get list of excluded channels: ", error);
        }
    },
};
