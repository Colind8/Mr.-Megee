const superSecret = require('../resources/random/secret.json');

module.exports = {
	name: 'supersecretcommand',
	description: 'Shh...',
    usage: '`xd)supersecretcommand`',
    category: 'meme',
	async execute(message) {
        let length = superSecret.data.length;
        
		await message.channel.send(superSecret.data[Math.floor(Math.random() * (length - 1))]);
	},
};