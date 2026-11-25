require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

async function setupEvent(client, eventData) {
	const isOnce = eventData.once || false;
	const isEnabled = (eventData.enabled == undefined ? true : eventData.enabled) || (eventData.eventType == Events.ClientReady || eventData.eventType == Events.InteractionCreate);

	let didSucceed = false;

	if (isEnabled) {
		if (isOnce) {
			client.once(eventData.eventType, eventData.callback);
		} else {
			client.on(eventData.eventType, eventData.callback);
		}
	}

	return isEnabled;
}

async function setupEvents(client) {
	const eventsPath = path.join(__dirname, "../events");
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

	console.log(`⚙️ Registering events...`);

	let allEventsSuccessfullyRegistered = true;

	const eventCount = eventFiles.length;
	let eventsRegistered = 0;
	let disabledEvents = 0;

	for (const file of eventFiles) {
		const event = require(path.join(eventsPath, file));

		if (!event.eventType || !event.callback) {
			console.warn(`⚠️ Event at ${file} is missing eventType' or 'callback', it will not be registered`);
			continue;
		}

		if (event.enabled != undefined && !event.enabled) {
			console.log(`⏭️ Event at ${file} is disabled, skipping...`);
			disabledEvents += 1;
			continue;
		}

		try {
			setupEvent(client, event);
			console.log(`✅ Loaded Event at ${file} succesfully`);
			eventsRegistered += 1;
		} catch(error) {
			console.error(`❌ Failed to load event at file ${file}: ${error}`);
			allEventsSuccessfullyRegistered = false;
		}
	}

	if (allEventsSuccessfullyRegistered) {
		console.log(`✅ Registered events! (${eventsRegistered}/${eventCount}) (${disabledEvents} disabled)`);
	} else {
		console.warn(`⚠️ Not all events registered successfully! (${eventsRegistered}/${eventCount}) (${disabledEvents} disabled)`);
	}
}

module.exports = {setupEvents};
