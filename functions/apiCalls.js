const OPEN_AI_KEY = process.env.OPEN_AI_KEY

import { Configuration, OpenAIApi } from "openai"

const conf = new Configuration({
    apiKey: OPEN_AI_KEY,
})

const openai = new OpenAIApi(conf);

export async function generatePrompt(channelName, language) {
    const prompt = `One random "${channelName.replace('-', ' ')}" ice breaker question in ${language}`;
    const convo = await getConversationStarter(prompt)
    return convo
}


export async function answerQ(prompt) {
    const question = `${prompt}`;
    const convo = await getAnswer(question)
    return convo
}

const getAnswer = async (query) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: query,
        max_tokens: 2048,
        temperature: 1,
    })

	return response.data.choices[0].text
}


const getConversationStarter = async (query) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: query,
        max_tokens: 2048,
        temperature: 1,
    })

	if(response.data.choices[0].text.includes(':')){
		return response.data.choices[0].text.split(":")[1];
	} else if (response.data.choices[0].text.includes('could be, ')) {
		return response.data.choices[0].text.replace('could be, ', '')
	} else if (response.data.choices[0].text.includes('would be, ')) {
		return response.data.choices[0].text.replace('would be, ', '')
	} else {
		return response.data.choices[0].text
	}


}

