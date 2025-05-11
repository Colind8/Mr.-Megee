const config = require('../config.json');
const prefix = config.prefix;
const img = require('../resources/random/aktchually.json');

module.exports = {
	name: 'aktchually',
	description: 'Instantly win any arguement.',
    usage: '`xd)aktchually [text]`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        const arg = message.content.slice(prefix.length + 10).trim();
        let length = img.data.length;
        let image = img.data[Math.floor(Math.random() * length)];
		
		
		if (arg.length > 1500) {
			return message.channel.send({
            content: "\"aktchually... Your message is way too long.\"",
            files: [image]
        });
		}
        
		return message.channel.send({
            content: "\"aktchually... " + arg + "\"",
            files: [image]
        });

        
    },
};