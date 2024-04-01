import { getAll } from "../database/databaseHelpers.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js'


export const backup = new SlashCommandBuilder()
    .setName("backup")
    .setDescription("backup the database")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function printAllServers (channel) {
	let servers = await getAll(`SELECT * FROM servers`)
	channel.send(`**=================================== Servers ===================================**`)
	for (let server of servers){
			channel.send(`**Server ID:** ${server.serverID}\n**Owner ID:** ${server.ownerID} \n**Channels:** ${server.channels}\n**Inactivity Time:** ${server.inactivityTime} Days\n**Channels last changed:** ${server.channelsLastChanged}\n**Language:** ${server.language}\n-------------------------------------------------`)
	}
}

export async function printAllUsers (channel) {
	let users = await getAll(`SELECT * FROM users`)
	channel.send(`**=================================== Users ===================================**`)
	for (let user of users){
			channel.send(`**User ID:** ${user.userID}\n**Username:** ${user.username}\n**Membership:** ${user.membership}\n**Current Servers:** ${user.servers}\n-------------------------------------------------`)
	}
}
