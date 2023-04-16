const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'roll',
	description: 'roll dice and stuff',
    usage: '`xd)roll [<number of dice>d<number of sides>[operations]]`',
    category: 'utility',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        var num = 0;
        var dicenum = 1;
        var diceval = 20;
        var addition = 0;
        var dicearray = [];
        
        if (!args[0]) {
            num = Math.floor(Math.random() * diceval + 1);
            return message.reply(`Rolled: **${num}**`);
        }
        if (args[0].includes("d")) {
            if (args[0].indexOf("d") == 0) {
                return message.reply("Invalid Syntax (ex. 3d20)");
            } else {
                dicenum = Number(args[0].slice(0,args[0].indexOf("d")));
                if (args[0].includes("+")) {
                    diceval = Number(args[0].slice(args[0].indexOf("d")+ 1,args[0].indexOf("+")));
                    addition = Number(args[0].slice(args[0].indexOf("+")+ 1,args[0].length));
                } else if (args[0].includes("-")) {
                    diceval = Number(args[0].slice(args[0].indexOf("d")+ 1,args[0].indexOf("-")));
                    addition = Number(args[0].slice(args[0].indexOf("-")+ 1,args[0].length));
                    addition = -addition;
                } else {
                    diceval = Number(args[0].slice(args[0].indexOf("d")+ 1,args[0].length));
                }
                
                //message.channel.send(`Dice amount: ${dicenum}, Diceval: ${diceval}, Addition: ${addition}`)
            }
            if (dicenum != 1) {
				if (dicenum > 599) {
					return message.channel.send("Dude. I don't have that much dice.");
				}
                for(var i = 0; i < dicenum; i++) {
                    rand = Math.floor(Math.random() * diceval + 1);
                    dicearray.push(rand);
                    num = num + rand;
                }
                if (addition != 0) {
					v = `Rolled `+ dicearray +`; Total: ${num} + ${addition} = **${num + addition}**`;
					if (v.length < 1900) {
						return message.reply(v);
					} else {
						return message.reply(`Rolled a lot of numbers probably; Total: ${num} + ${addition} = **${num + addition}**`);
					}
                } else {
					v = `Rolled `+ dicearray +`; Total: **${num}**`;
					if (v.length < 1900) {
						return message.reply(v);
					} else {
						return message.reply(`Rolled a lot of numbers probably; Total: **${num}**`);
					}
                }
            } else {
                if(addition != 0) {
                    num = Math.floor(Math.random() * diceval + 1);
                    return message.reply(`Rolled ${num} + ${addition} = **${num+addition}**`);
                } else {
                    num = Math.floor(Math.random() * diceval + 1 + addition);
                    return message.reply(`Rolled: **${num}**`);
                }
                
            }
        } else {
            diceval = args[0];
            num = Math.floor(Math.random() * diceval + 1);
            return message.reply(`Rolled: **${num}**`);
        }
    },
};