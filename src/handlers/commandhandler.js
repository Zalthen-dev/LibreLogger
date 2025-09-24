require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

module.exports = (client) => {
    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    const commands = [];

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));

        if (!command.name || !command.description || !command.callback) {
            console.warn(`⚠️ Command at ${file} is missing "name", "description", or "callback", it will not be usable`);
            continue;
        }

        client.commands.set(command.name.toLowerCase(), command);
        commands.push({
            name: command.name.toLowerCase(),
            description: command.description,
            options: command.options || [],
        });

        console.log(`✅ Loaded '${command.name}' command`);
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    (async () => {
        try {
            console.log("🔄 Refreshing slash commands...");

            if (process.env.ENVIRONMENT == "testing") {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                            { body: commands },
                );
            } else if (process.env.ENVIRONMENT == "production") {
                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                           { body: commands },
                );
            }

            console.log("✅ Refreshed slash commands!");
        } catch (error) {
            console.error(`❌ Failed to refresh slash commands: ${error}`);
        }
    })();
};
