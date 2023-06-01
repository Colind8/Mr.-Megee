const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'choose',
	description: 'Pick a random thing from a comma seperated list.',
    usage: '`xd)choose [options, ...]`',
    category: 'utility',
	async execute(message) {
        args = message.content.slice(prefix.length).trim().split(/,+/);
	    args[0] = args[0].slice(6, args[0].length);
		
		if (args.length < 1) {
			return message.channel.send("You must provide a comma seperated list of options to randomly select from.\n\nExample: `xd)choose one, two, three, four`");
		}
		
		return message.channel.send(args[Math.floor(Math.random() * (args.length))]);
        
    },
};