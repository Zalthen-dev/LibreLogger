const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "../../data/guilds.json");

let cache = null;

async function loadData() {
    if (cache) return cache;

    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, "{}");
    }

    try {
        const raw = await fs.readFile(filePath, "utf8");
        cache = JSON.parse(raw);
    } catch (err) {
        console.error("⚠️ Couldn't parse guilds.json! Resetting file...", err);
        cache = {};
        await fs.writeFile(filePath, "{}");
    }

    return cache;
}

async function saveData() {
    if (!cache) return;

    const tempFile = filePath + ".tmp";
    await fs.writeFile(tempFile, JSON.stringify(cache, null, 2));
    await fs.rename(tempFile, filePath);
}

function defaultGuildData() {
    return {
        logChannel: "",
        ignore: []
    };
}

async function getGuild(guildId) {
    const data = await loadData();

    if (!data[guildId]) {
        data[guildId] = defaultGuildData();
        await saveData();
    }

    return { ...data[guildId] };
}

async function setGuild(guildId, newValues, saveNow = true) {
    const data = await loadData();

    if (!data[guildId]) data[guildId] = defaultGuildData();

    data[guildId] = { ...data[guildId], ...newValues };

    if (saveNow) await saveData();
}

async function deleteGuild(guildId, saveNow = true) {
    const data = await loadData();
    if (data[guildId]) {
        delete data[guildId];
        if (saveNow) await saveData();
    }
}

async function saveAll() {
    await saveData();
}

module.exports = {
    getGuild,
    setGuild,
    deleteGuild,
    saveAll
};
