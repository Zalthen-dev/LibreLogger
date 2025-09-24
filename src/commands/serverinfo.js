module.exports = {
    name: "serverinfo",
    description: "Quickly get some information about the server",
    //options: [],
    callback: async (client, interaction) => {
        const guild = interaction.guild;
        if (!guild) {
            console.warn("⚠️ Couldn't get guild from interaction!");
            return;
        }

        let owner = await guild.fetchOwner();
        let guildOwnerName = owner ? ` ${owner.user.globalName}` : ``

        let guildFeatures = guild.features.length > 0 ? `${guild.features.join(", ")}` : "None"
        let guildBoostCount = guild.premiumSubscriptionCount >= 0 ? guild.premiumSubscriptionCount : "Unavailable"

        const embed = {
            title: `Info about ${guild.name}`,
            description: `\`\`\`
👑 Owner:${guildOwnerName} (${guild.ownerId})
🔐 Verification Level: ${guild.verificationLevel}
👥 Members: ${guild.members.cache.size}
✨ Boosts: ${guildBoostCount}
🔢 Roles: ${guild.roles.cache.size}
💫 Features: ${guildFeatures}
🪪 Guild ID: ${guild.id}
\`\`\``
        };

        await interaction.reply({ embeds: [embed], ephemeral: true});
    },
};
