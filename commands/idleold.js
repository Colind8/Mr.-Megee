const config = require('../config.json');
const idle = require('../resources/idle/idle.json');
const idleUserData = require('../resources/idle/idleuserdata.json');
const prefix = config.prefix;
//const Database = require("@replit/database");
const color = "#c6c6c6";
//const db = new Database();
const { MessageEmbed } = require('discord.js');
const owner = config.owner;
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);



module.exports = {
    name: 'idleoldoiqueoriuqotu',
    description: 'The Mr. Megee Idle Game!',
    usage: '`xd)idleold`',
    category: 'lore',
    async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!args[0]) {
            return message.channel.send({ embeds: [idleInfo] });
        }

        /*if ((args[0] == "thing") && (message.author.id == owner)) { //GIVE
            db.get("206312851659292675").then(key => {
                key.coins = 20;
                db.set("206312851659292675", key);
            });
            return message.channel.send("The thing is done");
        }*/

        db.get(`SELECT * FROM idle WHERE userid = ?`,[message.author.id], (error, results) => {
			if(error) {
				throw error;
			}
			
			
			
            if (results != undefined) { //user has a profile
                //base variables
				var key = JSON.parse(results.data);
                var xp = key.xp;
                var level = key.level;
                var levelneed = 10 + (key.prestige - 1); //level needed to activate prestige
                var coins = key.coins;
                var prestige = key.prestige;
                var xppm = key.xppm; //xp per message
                var xpneeded = 100 + (Math.pow(level, 4)); //xp needed to level up
                var perks = key.perks; //array of strings
                var perkpoints = key.perkpoints;
                //upgrade counts
                var food = key.upgrades.food;
                var water = key.upgrades.water;
                var shelter = key.upgrades.shelter;
                var weaponry = key.upgrades.weaponry;
                var stamina = key.upgrades.stamina;
                var intel = key.upgrades.intel;
                //upgrade cost
                var foodc = 1 + (Math.pow(food, 2));
                var waterc = 1 + (Math.pow(water, 2));
                var shelterc = 10 + (Math.pow(shelter, 2));
                var weaponryc = 15 + (Math.pow(weaponry, 2));
                var staminac = 50 + (Math.pow(stamina, 2));
                var intelc = 55 + (Math.pow(intel, 2));


                if (args[0] == "stats" || args[0] == "i") { //STATS
                    let perkline = "";
                    for (i = 0; i < key.perks.length; i++) {
                        if (key.perks[i].owned == true) {
                            perkline = perkline + idle.perklist[i].emote;
                        }
                    }
                    if (perkline === "") {
                        perkline = "None";
                    }

                    const idleStats = new MessageEmbed()
                        .setColor(color)
                        .setTitle("Prestige " + prestige + ": " + idle.prestige[prestige - 1].name)
                        .setAuthor(message.author.username + "'s stats")
                        .setThumbnail(idle.prestige[prestige - 1].thumbnail)
                        .setDescription("*" + idle.prestige[prestige - 1].status[Math.floor(Math.random() * (idle.prestige[prestige - 1].status.length))] + "*")
                        .addField("XP", xp + "/" + xpneeded + " (" + Math.round((xp / xpneeded) * 100) + "%)", true)
                        .addField("Level", level + "/" + levelneed, true)
                        .addField("Coins", "<:Coin:514985713574346758> " + coins, true)
                        .addField("XP per message", xppm.toString(), true)
                        .addField("Perk Points", perkpoints.toString(), true)
                        .addField("Perks", perkline, false)
                    return message.channel.send({ embeds: [idleStats] });
                } else if (args[0] == "help" || args[0] == "h") { //HELP
                    return message.channel.send({ embeds: [idleHelp] });
                } else if (args[0] == "convert" || args[0] == "c") { //CONVERT
                    if (!args[1]) {
                        return message.channel.send("You need to enter the amount of coins you want to make from your xp: `xd)idle convert [amount]`")
                    } else if (args[1] == "all") {
                        var coincost = 100;
                        if (key.perks[1].owned == true) {
                            coincost = coincost - 10;
                        }
                        if (key.perks[3].owned == true) {
                            coincost = coincost - 10;
                        }
                        if (xp >= coincost) {



                            let convertamount = Math.floor(xp / coincost);
                            let xpconvert = coincost * convertamount;
                            if (key.perks[9].owned == true) {
                                let oldconvert = convertamount;
                                for (i = 0; i < oldconvert; i++) {
                                    if (Math.floor(Math.random() * 10) == 0) {
                                        convertamount = convertamount + 1;
                                    }
                                }
                            }
                            key.coins = coins + convertamount;
                            key.xp = xp - xpconvert;

                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Successfully converted " + xpconvert + " to " + convertamount + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You need at least " + coincost + " XP to convert!");
                        }
                    } else if (Number.isInteger(Number(args[1]))) {
						if (Number(args[1]) < 0) {
							return message.channel.send("bruh.");
						}
                        var coincost = 100;
                        if (key.perks[1].owned == true) {
                            coincost = coincost - 5;
                        }
                        if (key.perks[3].owned == true) {
                            coincost = coincost - 5;
                        }

                        let xpconvert = coincost * Number(args[1]);
                        if (xp < xpconvert) {
                            return message.channel.send("You can not afford that many coins!");
                        }

                        key.coins = coins + Number(args[1]);
                        key.xp = xp - xpconvert;
                        db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                        return message.channel.send("Successfully converted " + xpconvert + " to " + Number(args[1]) + " Coin(s) <:Coin:514985713574346758>");

                    } else {
                        return message.channel.send("Either a number or *ALL*")
                    }
                } else if (args[0] == "shop" || args[0] == "s") { //SHOP
                    const idleShop = new MessageEmbed()
                        .setColor(color)
                        .setTitle(idle.shop.title)
                        .setDescription(idle.shop.body)
                        .setThumbnail(idle.shop.thumbnail)
                        .setFooter("Coins: " + coins)
                        .addField("Items", "1. Food [" + food + "]\n2. Water [" + water + "]\n3. Shelter [" + shelter + "]\n4. Weaponry [" + weaponry + "]\n5. Stamina [" + stamina + "]\n6. Intel [" + intel + "]\n", true)
                        .addField(idle.shop.fields[0].name, idle.shop.fields[0].description, true)
                        .addField("Cost", "<:Coin:514985713574346758> " + foodc + "\n<:Coin:514985713574346758> " + waterc + "\n<:Coin:514985713574346758> " + shelterc + "\n<:Coin:514985713574346758> " + weaponryc + "\n<:Coin:514985713574346758> " + staminac + "\n<:Coin:514985713574346758> " + intelc + "\n", true)
                        .addField("Perks", "None", false)

                    return message.channel.send({ embeds: [idleShop] });
                } else if (args[0] == "buy" || args[0] == "b") {
                    if (args[1] == 1) {
                        if (coins >= foodc) {
                            key.upgrades.food = food + 1;
                            key.coins = coins - foodc;
                            key.xppm = xppm + 1;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Purchased Food for " + foodc + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You cannot afford that!");
                        }
                    } else if (args[1] == 2) {
                        if (coins >= waterc) {
                            key.upgrades.water = water + 1;
                            key.coins = coins - waterc;
                            key.xppm = xppm + 1;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Purchased Water for " + waterc + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You cannot afford that!");
                        }
                    } else if (args[1] == 3) {
                        if (coins >= shelterc) {
                            key.upgrades.shelter = shelter + 1;
                            key.coins = coins - shelterc;
                            key.xppm = xppm + 5;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Purchased Shelter for " + shelterc + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You cannot afford that!");
                        }
                    } else if (args[1] == 4) {
                        if (coins >= weaponryc) {
                            key.upgrades.weaponry = weaponry + 1;
                            key.coins = coins - weaponryc;
                            key.xppm = xppm + 5;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Purchased Weaponry for " + weaponryc + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You cannot afford that!");
                        }
                    } else if (args[1] == 5) {
                        if (coins >= staminac) {
                            key.upgrades.stamina = stamina + 1;
                            key.coins = coins - staminac;
                            key.xppm = xppm + 10;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Purchased Stamina for " + staminac + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You cannot afford that!");
                        }
                    } else if (args[1] == 6) {
                        if (coins >= intelc) {
                            key.upgrades.intel = intel + 1;
                            key.coins = coins - intelc;
                            key.xppm = xppm + 10;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Purchased Intel for " + intelc + " Coin(s) <:Coin:514985713574346758>");
                        } else {
                            return message.channel.send("You cannot afford that!");
                        }
                    }
                } else if (args[0] == "perk" || args[0] == "p") { //PERK
                    let z = true; //every perk owned
                    for (i = 0; i < key.perks.length; i++) {
                        if (key.perks[i].owned == false) {
                            z = false;
                        }
                    }
                    if (z == true) {
                        if (key.perkpoints > 0) {
                            key.coins = key.coins + (key.perkpoints * 15);
                            key.perkpoints = 0;
                            db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                            return message.channel.send("Converted " + perkpoints + " perk points to " + (perkpoints * 15) + " Coins. <:Coin:514985713574346758>");
                        }
                        return message.channel.send("You have every perk! If you have any extra perk points, you can convert them to coins with `xd)perk`. One perk point is 15 coins.");
                    }

                    if (!args[1]) {
                        let a = 0
                        for (i = 0; key.randperk != idle.perklist[i].name; i++) {
                            a = i + 1;
                        }

                        const idlePerk = new MessageEmbed()
                            .setColor(color)
                            .setTitle(idle.perk.title)
                            .setThumbnail(idle.perk.thumbnail)
                            .setDescription(idle.perk.body)
                            .addField(idle.perklist[a].name, idle.perklist[a].description, false)
                            .setImage(idle.perklist[a].image)
                            .setFooter("Perk Points: " + key.perkpoints)

                        return message.channel.send({ embeds: [idlePerk] });
                    } else if (args[1] == "buy") {
                        if (key.perkpoints < 1) {
                            return message.channel.send("You need at least one perk point to get this perk.");
                        }

                        let a = 0;
                        for (i = 0; key.randperk != idle.perklist[i].name; i++) {
                            a = i + 1;
                        }
                        key.perks[a].owned = true;

                        if (key.perks[a].name == "Payment") {
                            key.coins = key.coins + ((key.level * Math.ceil(key.prestige / 5)) * 15);
                        }

                        let b = [];
                        for (i = 0; i < key.perks.length; i++) {
                            if (key.perks[i].owned == false) {
                                b.push(key.perks[i].name);
                            }
                        }
                        key.randperk = b[Math.floor(Math.random() * (b.length - 1))];
                        key.perkpoints = key.perkpoints - 1;

                        db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);


                        return message.channel.send("You equipped the " + idle.perklist[a].name + " perk!");
                    } else if (args[1] == "reroll") {
                        if (key.perkpoints < 1) {
                            return message.channel.send("You need at least one perk point to get this perk.");
                        }
                        let b = [];
                        for (i = 0; i < key.perks.length; i++) {
                            if (key.perks[i].owned == false) {
                                b.push(key.perks[i].name);
                            }
                        }
                        let chosenperk = b[Math.floor(Math.random() * (b.length - 1))];
                        let a = 0;
                        for (i = 0; chosenperk != key.perks[i].name; i++) {
                            a = i + 1;
                        }
                        key.perks[a].owned = true;

                        if (key.perks[a].name == "Payment") {
                            key.coins = key.coins + ((key.level * Math.ceil(key.prestige / 5)) * 15);
                        }

                        let c = [];
                        for (i = 0; i < key.perks.length; i++) {
                            if (key.perks[i].owned == false) {
                                c.push(key.perks[i].name);
                            }
                        }

                        key.randperk = c[Math.floor(Math.random() * (c.length - 1))];
                        key.perkpoints = key.perkpoints - 1;

                        db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                        const idleReroll = new MessageEmbed()
                            .setColor(color)
                            .setTitle(idle.reroll.title)
                            .setThumbnail(idle.reroll.thumbnail)
                            .setDescription(idle.reroll.body)
                            .addField(idle.perklist[a].name, idle.perklist[a].description, false)
                            .setImage(idle.perklist[a].image)
                            .setFooter("Perk Points: " + key.perkpoints)

                        return message.channel.send({ embeds: [idleReroll] });
                    }
                } else if ((args[0] == "prestige")) {
                    if (level == levelneed) {
                        key = idleUserData;
                        key.prestige = prestige + 1;

                        db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                        return message.channel.send(idle.prestige[key.prestige - 1].lore + "\n\nEverything has been reset as per the rules of prestige. Good luck on reaching prestige again!");
                    } else {
                        return message.channel.send("You need to be at max level to activate prestige!");
                    }
                } else if ((args[0] == "give") && (message.author.id == owner)) { //GIVE
                    key.xp = Number(args[1]) + xp;
                    db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
                    return message.channel.send("You now have " + key.xp + " XP");
                } else if (args[0] == "get") {
                    return (message.channel.send(eval(args[1])));
                } else if (args[0] == "delete") {
                    message.channel.send("Deleting profile...");

                    db.run(`DELETE FROM idle WHERE userid = ?`,message.author.id);
                    return message.channel.send("Profile deleted!");

                } else if (args[0] == "hypothetical" || args[0] == "h") {
                    var hypothetic = "Lets say you send a message.\n\n";

                    if (key.perks[8].owned == true) { //GAMBLING
                        var newxp = (key.xppm + (Math.floor(Math.random() * (15 * key.level)) - (5 * key.level))); // new XP + (-5*level to 10*level)
                        hypothetic = hypothetic + "Because you have **Gambling**, your XP is rolled from " + (key.level * -5) + "+" + xppm + " to " + (key.level * 10) + "+" + xppm + " which could result in you getting " + newxp;
                        if (key.perks[0].owned == true) { //double xp
                            newxp = newxp * 2;
                            hypothetic = hypothetic + "\n\nAnd because you have **Double XP**, that will be doubled, resulting in: " + newxp;
                        }
                    } else {
                        var newxp = key.xppm;
                        hypothetic = hypothetic + "Since you don't have Gambling, you start with your regular xppm: " + newxp;
                        if (key.perks[0].owned == true) { //double xp
                            newxp = newxp * 2;
                            hypothetic = hypothetic + "\n\nAnd because you have **Double XP**, that will be doubled, resulting in: " + newxp;
                        }
                    }
                    if (key.perks[4].owned == true) { //COIN DROPS
                        hypothetic = hypothetic + "\n\nYou have **Coin Drops**. So this message would have a 1/100 chance to give you a coin!";
                        if ((Math.floor(Math.random() * 100) + 1) == 1) { //1/100 chance
                            hypothetic = hypothetic + " And **you do gain that coin!**";
                        } else {
                            hypothetic = hypothetic + " But this time you don't gain a coin.";
                        }
                    }
                    if (key.perks[5].owned == true) { //XP BOOST
                        hypothetic = hypothetic + "\n\nYou have **XP Boost**, so you have a 1/40 chance to gain 7.5x the XP."
                        if ((Math.floor(Math.random() * 40) + 1) == 1) { //1/40 chance
                            newxp = Math.ceil(newxp * 7.5); //to increase XP by 7.5x
                            hypothetic = hypothetic + " And **this time, you do!** Making your new XP gained to " + newxp;
                        } else {
                            hypothetic = hypothetic + " But this time you don't gain the boost."
                        }
                    }
                    if (key.perks[6].owned == true) { //WEB MASTERY
                        hypothetic = hypothetic + "\n\nYou have **Web Mastery**, so if the message has a link in it, you'll gain 50% more XP. If you did, your new total would be " + Math.ceil(newxp * 1.5); //increase xp by 50%
                        
                    }
                    if (key.perks[7].owned == true) { //FRIENDS OF THE WILD
                        hypothetic = hypothetic + "\n\nYou have **Friends of the Wild**, so if the message has a ping in it, you'll gain 50% more XP. If you did, your new total would be " + Math.ceil(newxp * 1.5); //increase xp by 50%
                    }
                    hypothetic = hypothetic + "\n\nAnd so, the xp you gained from this message would be " + newxp;

                    return message.channel.send(hypothetic);
                }
            } else {
                if (args[0] == "play") {
                    message.channel.send("Creating Profile...");
                    try {
                        let v = idleUserData;
                        let h = v.perks.length;
                        v.randperk = v.perks[Math.floor(Math.random() * (h - 1))].name;
                        //db.set(message.author.id, a);
						db.run(`INSERT INTO idle (userid, data) VALUES (?, ?)`, [message.author.id, JSON.stringify(v)]);

                        return message.channel.send("*You immediately get to work on Research and Development.*\n\nProfile created! Use `xd)idle help` to learn all what you can do!");
                    } catch (error) {
                        console.log(error);
                        return message.channel.send("An error has occured!");
                    }
                } else {
                    return message.channel.send("You do not have an Idle Profile. Do `xd)idle` for more info.");
                }
            }
        });

    },
};



const idleInfo = new MessageEmbed()
    .setColor(color)
    .setTitle(idle.info.title)
    .setAuthor(idle.info.author)
    .setDescription(idle.info.body)
    .setThumbnail(idle.info.thumbnail)
    .addField(idle.info.fields[0].name, idle.info.fields[0].description, false)
    .addField(idle.info.fields[1].name, idle.info.fields[1].description, false)

const idleHelp = new MessageEmbed()
    .setColor(color)
    .setTitle(idle.help.title)
    .setDescription(idle.help.body)
    .setThumbnail(idle.help.thumbnail)
    .addField(idle.help.fields[0].name, idle.help.fields[0].description, false)