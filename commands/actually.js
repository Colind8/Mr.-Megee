const config = require('../config.json');
const prefix = config.prefix;
const img = require('../resources/random/actually.json');

module.exports = {
	name: 'actually',
	description: 'Prove your friend is wrong in the worst way possible',
    usage: '`xd)actually [text]`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        const arg = message.content.slice(prefix.length + 9).trim();
        let length = img.data.length;
        let image = img.data[Math.floor(Math.random() * length)];
		
		
		if (arg.length > 1500) {
			return message.channel.send({
            content: "\"Actually... Your message is way too long.\"",
            files: [image]
        });
		}
		
		return message.channel.send({
            content: "\"Actually... " + arg + "\"",
            files: [image]
        });

        
    },
};