import { SlashCommandBuilder } from '@discordjs/builders';
import { answerQ } from "../functions/apiCalls.js";

export const askQCommand = new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Quick Q a question")
	.addStringOption((option) =>
        option
        .setName("question")
        .setDescription("Enter a question.")
		.setRequired(true)
	).addStringOption((option) =>
        option
        .setName("visibility")
        .setDescription("Choose a visiblity.")
        .setRequired(true)
        .addChoices(
				{ name: 'Public', value: 'Public' },
				{ name: 'Private', value: 'Private' },
	))
					 
export async function answerQuestion(interaction){
	let question = interaction.options.data[0].value
	let visibility = interaction.options.data[1].value
	let user = interaction.user.id
	let answer;
	if (visibility == 'Private'){
interaction.reply({content:'Working on it...', ephemeral:true});
		answer = await answerQ(question)
  await interaction.editReply({content: `${answer}`, ephemeral: true});
	} else {
interaction.reply({content:'Working on it...', ephemeral:false});	
		answer = await answerQ(question)
		interaction.editReply({content: `<@${user}> asked: ${question} ${answer}`, ephemeral: false})
	}

}					 