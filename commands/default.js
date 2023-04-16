const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'name',
	description: 'description',
    usage: '`xd)name <required> [optional]`',
    category: 'category',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		return message.channel.send("insert words here");

        
    },
};