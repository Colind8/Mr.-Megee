const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'test',
	description: 'test',
    usage: '`xd)test <required> [optional]`',
    category: 'lore',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		a = Number(args[0]);
		b = Number(args[1]);
		t = a + b;
		
		a_ = Math.round((a / t) * 24);
		
		words = `a: `+a+`, b: `+b+`, total: `+t+`, ` + ((a / t) * 100) + `%, a_: `+a_+`\n|`;
		
		for (i = 0; i < 24; i++) {
			if (i == a_) {
				words += "|";
			}
			words += "-";
		}
		if (a_ == 24) {
			words += "|";
		}
		
		words += "|";
		
        
		return message.channel.send(words);

        
    },
};