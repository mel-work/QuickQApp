import {keepAlive} from "./server.js"
import cron from "cron";
import { activityChecker } from "./functions/messageFunctions.js";
import { setupChannelsCommandBasic, setupChannels } from "./commands/setupChannels.js";
import { premiumLiteSetupCommand, premiumLiteSetup } from "./commands/premiumLiteSetup.js";
import { premiumSetupCommand, premiumSetup } from "./commands/premiumSetup.js";
import { getUserCommand, getUser, deleteUser, deleteUserAndServersCommand, updateMembership, updateMembershipCommand, getServer, getServerCommand, deleteServerCommand, deleteServerFunction } from './commands/localAdminCommands.js';
import { addColumnLanguage, createUser } from './database/databaseHelpers.js'
import { updateLanguageCommand, updateLanguage } from './commands/updateServerLanguage.js'
import {helpCommand, helpDisplay} from './commands/help.js'
import {printAllServers,printAllUsers,backup} from './functions/printAll.js'
import { askQCommand, answerQuestion } from './commands/ask.js'

// -------------- Connect to DB ------------------
import sqlite3 from 'sqlite3';
const TOKEN = process.env.TOKEN

export const db = new sqlite3.Database('QuickQ.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

// -------------- Set up App Client --------------
import { Client } from "discord.js";
export const client = new Client({
  intents: ["Guilds"],
  allowedMentions: { parse: ["roles"], repliedUser: true },
});



// -------------- Command Setup --------------




function addCommands(commandList) {
    client.application.commands.set(commandList);
}

const commands = [
  setupChannelsCommandBasic,
  premiumLiteSetupCommand,
  premiumSetupCommand,
  updateLanguageCommand,
  helpCommand,
  askQCommand,
];

// --------------- On Interaction ----------------------
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName == "setup_channels") {
      setupChannels(interaction);
    } else if (interaction.commandName == "premium_lite_setup") {
      premiumLiteSetup(interaction);
    } else if (interaction.commandName == "premium_setup") {
      premiumSetup(interaction);
    } else if (interaction.commandName == "get_user") {
      getUser(interaction)
    } else if (interaction.commandName == "delete_user") {
		deleteUser(interaction)
	} else if (interaction.commandName == "update_membership") {
		updateMembership(interaction)
	} else if (interaction.commandName == "get_server") {
		getServer(interaction)
	} else if (interaction.commandName == "update_language") {
		updateLanguage(interaction)
	} else if (interaction.commandName == "delete_server") {
		deleteServerFunction(interaction)
	} else if (interaction.commandName == "help") {
		helpDisplay(interaction)
	}else if (interaction.commandName == "backup") {
		const channelID = "1081023090349326357"
		const dbChannel = client.channels.cache.get(channelID)
		printAllServers(dbChannel)
		printAllUsers(dbChannel)
	}
	else if (interaction.commandName == "ask") {
		answerQuestion(interaction)
	}
  }
});



// -------------- App ready --------------
client.on("ready", async () => {
  console.log("App is online.");
  // global commands
  addCommands(commands);
  // local commands
  client.application.commands.set([getUserCommand, deleteUserAndServersCommand, updateMembershipCommand, getServerCommand, deleteServerCommand, backup], '1079154752467763210');
	const channelID = "1081023090349326357"
	const dbChannel = client.channels.cache.get(channelID)

  	let runDailyAtNoon = new cron.CronJob(
      // "0 14 * * *"   
	  "0 14 * * *",
        async function () {
          console.log("Job Running...");
          await activityChecker();
		  printAllServers(dbChannel)
		  printAllUsers(dbChannel)
        },
        null,
        true,
        "America/Los_Angeles"
	);
	//await activityChecker()

});

client.on("guildCreate", guild => { // This event fires when a guild is created or when the bot is added to a guild.
    guild.fetchAuditLogs({type: 28, limit: 1}).then(log => { // Fetching 1 entry from the AuditLogs for BOT_ADD.
        log.entries.first().executor.send(`Thank you for adding me to ${guild.name}!
To get started, use \`/setup_channels\` in the server channel of your choice.
Add the channels you wish me to monitor. 
For my basic settings, you can monitor up to 5 channels. 
If a message has not been sent in one of those channels within the past 30 days, I will send an ice-breaker question specifically tailored to that channel based on the channel's name.
Note: You will need admin privileges to use my setup commands.
Use \`/help\` in the server for more info!`).catch(e => console.error(e)); // Sending the message to the executor.
    });
});


// -------------- Run application --------------
keepAlive()
client.login(TOKEN);