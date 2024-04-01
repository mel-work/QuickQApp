import { client } from "../index.js";
import { unixToDatetimeFunction, getDaysSinceLastMessage } from "./timeFunctions.js";
import { generatePrompt } from "./apiCalls.js";
import { getAll } from "../database/databaseHelpers.js";
import { PermissionFlagsBits } from 'discord.js'



export function getMessageDate(message) {
    return message.creationDate
}


export async function getInactiveChannelName(ownerID, serverID, channelID, inactiveDays, language) {
    let guild = client.guilds.cache.get(serverID)
    let channel = client.channels.cache.get(channelID);
	let check = guild.members.me?.permissionsIn(channel).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])
	let owner = await client.users.fetch(ownerID)
	if (check){
		let prompt = await generatePrompt(channel.name, language)
	    channel.messages.fetch({ limit: 1 }).then(messages => {
	        let lastMessage = messages.first();
	        if (lastMessage == undefined) {
				channel.send(prompt).catch((err) => {
					console.log(`Unable to send due to permissions`)
				})
	        } else {
	            let messageUnix = lastMessage.createdTimestamp
	            let daysSinceSent = getDaysSinceLastMessage(unixToDatetimeFunction(messageUnix))
	            if (daysSinceSent >= inactiveDays) {
					channel.send(prompt).catch((err) => {
						console.log(`Unable to send due to permissions`)
					})
	            }
		    }
		    })
		    .catch(console.error);
	} else {
		owner.send({content: `Hey <@${owner.id}>! 👋 
I cannot send messages to the channel: **${channel.name}** in **${guild.name}**. 
Please adjust my permissions so that I can **view the channel** and **send messages**. Thanks! `})
	 	//console.log(`Unable to send due to permissions`)
	}
    
}


export function getChannels(guildID) {
    let guild = client.guilds.cache.get(guildID);
    let guildTextChannels = []
    guild.channels.cache.forEach(channel => {
        if (channel.type == 0){
            guildTextChannels.push(channel.id)
        }
    })
    return guildTextChannels
}


export async function activityChecker() {
    let servers = await getAll(`SELECT * FROM servers`)
    // for each server in the db
    for (let i in servers) {
        //console.log('Server ID ' + servers[i].serverID)
        let channelList = servers[i].channels.split(',')
        //console.log("Channels " + channelList)
         // loop through channels and run get active channel name function
        for (let j in channelList) {
            //console.log("Channel Loop " + channelList[j])
            await getInactiveChannelName(servers[i].ownerID, servers[i].serverID, channelList[j], servers[i].inactivityTime, servers[i].language)
        }
    }


}