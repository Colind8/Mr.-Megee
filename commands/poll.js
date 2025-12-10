const config = require('../config.json');
const fs = require('fs');
const prefix = config.prefix;
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

module.exports = {
	name: 'poll',
	description: 'Create and Vote on public polls',
    usage: '`xd)poll help`',
    category: 'others',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		//var file = fs.readFileSync('poll.txt').toString();
        //var dataobj = JSON.parse(file);
		
		try {
			db.run("PRAGMA busy_timeout = 30000");
		} catch(error){throw error}
		
		if ((!args[0]) || (args[0] == "rand")) { //Get Random Poll
			
			
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
				if(error) {
					return console.log(error);
				}
				
				dbwords = `SELECT * FROM polls WHERE ID NOT IN (`;
				
				try {
					votedpolls = JSON.parse(results.VOTE_ARRAY).data;
				} catch {
					votedpolls = "nope"
				}
				if (votedpolls != "nope" && (args[0] != "rand")) {
					dbwords += votedpolls.toString();
				}
				
				dbwords += `) AND NOT TITLE GLOB '~~!@*' ORDER BY RANDOM() LIMIT 1`;
				
				db.get(dbwords, (error, data) => {
					if(error) {
						return console.log(error);
					}
					
					if (data == undefined) {
						return message.channel.send("You voted for every poll you could!");
					}
					
					sendembed(data);
				});
			});
		}
        
		if (args[0] == "help" || args[0] == "h") { //HELP
			if (args[1] == "list") {
				return message.channel.send({embeds: [listhelpembed]});
			} else {
				return message.channel.send({embeds: [helpembed]});
			}
			
		}
		
		if (args[0] == "create" || args[0] == "c") { //CREATE POLL
			rearg = message.content.slice(prefix.length + command.length + args[0].length + 1).trim().split(/\?+/);
			for (i = 0; i < rearg.length; i++) {
				rearg[i] = rearg[i].trim();
			}
			if (rearg[rearg.length - 1] == "") {
				rearg.pop();
			}
			
			try {
				title = rearg[0];
				a = rearg[1];
				b = rearg[2];
			} catch {
				return message.channel.send("Missing arguments.");
			}
			
			if (rearg.length != 3) {
				return message.channel.send("Too many or too few arguments. Each argument has to end in a `?`. Use `xd)poll help` for more info.");
			}
			
			if (title.length > 128) {
				return message.channel.send("Your title is too long! Must be less than 128 characters. (" + title.length + ")");
			}
			
			if (title.length < 4) {
				return message.channel.send("Your title is too short! Must be at least 4 characters. (" + title.length + ")");
			}
			
			if (a.length > 64 || b.length > 64) {
				return message.channel.send("Your option is too long! Must be less than 64 characters.");
			}
			
			if (a.length < 1 || b.length < 1) {
				return message.channel.send("Your option is too long! Must be at least 1 character.");
			}
			
			if(title.includes(`*`) || title.includes(`@`)) {
                return message.channel.send("Your title cannot contain `*` or `@`");
            }
			
			if(a.includes(`*`) || a.includes(`@`) || b.includes(`*`) || b.includes(`@`)) {
                return message.channel.send("Your options cannot contain `*` or `@`");
            }
			
			if(title.includes(`*`) || title.includes(`@`)) {
                return message.channel.send("Your title cannot contain `*` or `@`");
            }
			
			title = title.replace(/_/g," ");
			a = a.replace(/_/g," ");
			b = b.replace(/_/g," ");
			
			//date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
			newid = Math.floor(Math.random() * 8999999999) + 1000000000;
			
			db.all(`SELECT ID FROM polls`,(error,ids) => {
				//return console.log(ids);
				bruh = []
				for(i = 0; i < ids.length; i++) {
					bruh.push(ids[i].ID);
				}
				//console.log(bruh);
				
				while (bruh.includes(newid)) {
					newid = Math.floor(Math.random() * 8999999999) + 1000000000;
				}
				let d = new Date();
				
				db.run(`INSERT INTO polls (ID, AUTHOR, AUTHORID, DATE, TITLE, OPTION_A, OPTION_B, VOTES_A, VOTES_B, VOTES_C) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [newid, message.author.username, message.author.id, d, title, a, b, `{"data":[]}`, `{"data":[]}`, `{"data":[]}`], (error) => {
					if(error) {
						return console.log(error);
					}
					
					db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
						if(error) {
							return console.log(error);
						}
						
						if(results != undefined) {
							createarray = JSON.parse(results.CREATE_ARRAY);
							
							createarray.data.push(newid);
							
							db.run(`UPDATE polls_users SET CREATE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(createarray), message.author.id]);
						} else {
							db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [message.author.id, `{"data":[]}`, `{"data":[]}`], (error) => {
								createarray = JSON.parse(`{"data":[]}`);
								
								createarray.data.push(newid);
							
								db.run(`UPDATE polls_users SET CREATE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(createarray), message.author.id]);
							});
						}
					});
				});
			
				newpoll = {
					"ID": newid,
					"AUTHOR": message.author.username,
					"AUTHORID":message.author.id,
					"DATE": d,
					"TITLE": title,
					"OPTION_A": a,
					"OPTION_B": b,
					"VOTES_A": `{"data":[]}`,
					"VOTES_B": `{"data":[]}`,
					"VOTES_C": `{"data":[]}`
				};
				
				sendembed(newpoll);
			});
			
		}
		
		if (args[0] == "vote" || args[0] == "v") { //VOTE
			if (!(Number.isInteger(Number(args[1])))) {
				return message.channel.send("ID must be a ten digit number.");
			}
			
			return vote(message.author.id, Number(args[1]), args[2], "");
			
			/*db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
				if (error) {
					throw error;
				}
				try {
					votedpolls = JSON.parse(results.VOTE_ARRAY).data;
					if (votedpolls.includes(searchid)) {
						return message.channel.send("You already voted for this poll!");
					}
				} catch {}
				
				
			});*/
			
			
			}
		
		if (args[0] == "search" || args[0] == "s") { //SEARCH
			if (!(Number.isInteger(Number(args[1])))) {
				return message.channel.send("ID must be a ten digit number.");
			}
			searchid = Number(args[1]);
			
			db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[searchid], (error, data) => {
				if (data == undefined) {
					return message.channel.send("Invalid ID.");
				}
				
				sendembed(data);
			});
		}

		if (args[0] == "list" || args[0] == "l") { //LIST [sort] [filter] [page]
			
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
				rearg = message.content.slice(prefix.length + command.length + args[0].length + 1).trim().split(/\?+/);
				let searchtypesused = [false,false,false,false,false,false] // filter, sort, title, author, amountper, pageindex
				meta_array = [0,"",10] // pageindex, list_desc, amountper
				dbcommand = `SELECT * FROM polls `;
				list_sort = "";
				list_desc = "";
				where_array = [];
				//console.log(`rearg: ${rearg}`);
				
				for (let i = 0; i < rearg.length; i++) {
					//console.log(`${i}: ${rearg[i]}`);
					if (rearg[i].indexOf("filter:") != -1) {
						if (searchtypesused[0]) {
							return message.channel.send(`Only one filter may be used`)
						}
						searchtypesused[0] = true;
						let filter = rearg[i].trim().slice("filter:".length).trim().split(/\,+/);
						let whereid_array = [];
						let whereidnot_array = [];
						
						
						// Use below if more filters are added... otherwise
						
						/*for (let j = 0; j < filter.length; j++) {
							switch (filter[j]) {
								case "voted":
									votedpolls = JSON.parse(results.VOTE_ARRAY).data;
									whereid_array = whereid_array.concat(votepolls);
									break;
								case "notvoted":
									votedpolls = JSON.parse(results.VOTE_ARRAY).data;
									whereid_array = whereidnot_array.concat(votepolls);
									break;
							}
						}*/
						
						// Otherwise, this code is used instead...
						
						if (filter[0] == "voted" || filter[0] == "v") {
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							whereid_array = whereid_array.concat(votedpolls);
							where_array.push(`ID IN (${whereid_array})`);
							list_desc += `Filter: voted -- `;
						} else if (filter[0] == "notvoted" || filter[0] == "nv") {
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							whereidnot_array = whereidnot_array.concat(votedpolls);
							where_array.push(`ID NOT IN (${whereidnot_array})`);
							list_desc += `Filter: not voted -- `;
						} else {
							return message.channel.send(`Filter error!`);
						}
						
						
					}
					
					if (rearg[i].indexOf("sort:") != -1) {
						if (searchtypesused[1]) {
							return message.channel.send(`Only one sort may be used`);
						}
						searchtypesused[1] = true;
						let sort = rearg[i].trim().slice("sort:".length).trim();
						switch (sort) {
							case "newest":
								list_sort = "ORDER BY DATE DESC";
								list_desc += `Sort: newest -- `;
								break
							case "oldest":
								list_sort = "ORDER BY DATE ASC";
								list_desc += `Sort: oldest -- `;
								break;
							case "mostvotes":
								list_sort = "ORDER BY VOTES_TOTAL DESC";
								list_desc += `Sort: most votes -- `;
								break;
							case "leastvotes":
								list_sort = "ORDER BY VOTES_TOTAL ASC";
								list_desc += `Sort: least votes -- `;
								break;
							case "n":
								list_sort = "ORDER BY DATE DESC";
								list_desc += `Sort: newest -- `;
								break
							case "o":
								list_sort = "ORDER BY DATE ASC";
								list_desc += `Sort: oldest -- `;
								break;
							case "m":
								list_sort = "ORDER BY VOTES_TOTAL DESC";
								list_desc += `Sort: most votes -- `;
								break;
							case "l":
								list_sort = "ORDER BY VOTES_TOTAL ASC";
								list_desc += `Sort: least votes -- `;
								break;
							default:
								return message.channel.send(`Sorting option not valid!`);
						}
					}
					
					if (rearg[i].indexOf("title:") != -1) {
						if (searchtypesused[2]) {
							return message.channel.send(`Only one title filter may be used`)
						}
						searchtypesused[2] = true;
						let title_filter = rearg[i].trim().slice("title:".length).trim();
						if (title_filter.length > 0) {
							where_array.push(`TITLE LIKE '%${title_filter}%'`);
							list_desc += `Title Search: "${title_filter}" -- `;
						} else {
							return message.channel.send(`title not valid!`);
						}
					}
					
					if (rearg[i].indexOf("author:") != -1) {
						if (searchtypesused[3]) {
							return message.channel.send(`Only one author filter may be used`)
						}
						searchtypesused[3] = true;
						let author_filter = rearg[i].trim().slice("author:".length).trim();
						if (author_filter.length > 0) {
							where_array.push(`AUTHOR LIKE '%${author_filter}%'`);
							list_desc += `Author Search: "${author_filter}" -- `;
						} else {
							return message.channel.send(`author not valid!`);
						}
					}
					
					if (rearg[i].indexOf("amount:") != -1) {
						if (searchtypesused[4]) {
							return message.channel.send(`Only one amount filter may be used`)
						}
						searchtypesused[4] = true;
						let amount_filter = rearg[i].trim().slice("author:".length).trim();
						amount_filter = Number(amount_filter);
						
						if (isNaN(amount_filter)) {
							amount_filter = 10;
						}
						if (amount_filter < 1) {
							amount_filter = 1;
						}
						
						if (amount_filter > 15) {
							amount_filter = 15;
						}
						
						meta_array[2] = amount_filter
					}
					
					if (rearg[i].indexOf("page:") != -1) {
						if (searchtypesused[4]) {
							return message.channel.send(`Only one page filter may be used`)
						}
						searchtypesused[4] = true;
						let page_filter = rearg[i].trim().slice("page:".length).trim();
						page_filter = Number(page_filter);
						
						if (isNaN(page_filter)) {
							page_filter = 0;
						}
						page_filter--;
						if (page_filter < 0) {
							page_filter = 0;
						}
						
						meta_array[0] = page_filter;
					}
				}
				where_array.push(`NOT TITLE GLOB '~~!@*'`)
				
				if (where_array.length > 0) {
					dbcommand += `WHERE `
					for (let i = 0; i < where_array.length; i++) {
						if (i == where_array.length - 1) {
							dbcommand += `${where_array[i]} `
						} else {
							dbcommand += `${where_array[i]} AND `
						}
					}
				}
				
				if (list_sort.length == 0) {
					list_sort = "ORDER BY DATE DESC";
				}
				
				dbcommand += `${list_sort}`;
				list_desc = list_desc.slice(0,list_desc.length - 4);
				meta_array[1] = list_desc;
				
				
				db.all(dbcommand, (error,data) => {
					sendlistembed(data,meta_array);
				});
			});
			
			
		}
		
		if (args[0] == "delete") {
			if (!(Number.isInteger(Number(args[1])))) {
				return message.channel.send("ID must be a ten digit number.");
			}
			searchid = Number(args[1]);
			
			db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[searchid], (error, data) => {
				if (data == undefined) {
					return message.channel.send("Invalid ID.");
				}
				
				if (message.author.id == 207901876434370562 || message.author.id == data.AUTHORID) {
					db.run("PRAGMA busy_timeout = 30000");
					db.run(`UPDATE polls SET TITLE = ? WHERE ID = ?`,[(`~~!@` + data.title),searchid], () => {
						return message.channel.send("Poll deleted!");
					});
				}
				
				//sendembed(data);
			});
		}
		
		function sendlistembed(select,extra_meta,message_id) {
			page_index = extra_meta[0];
			list_desc = extra_meta[1];
			
			descriptionbuilder = `${list_desc}`;
			
			listfieldbuilder = ``;
			
			row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setStyle('SECONDARY')
						.setCustomId(`first_page`)
						.setEmoji(`⏮`)
				)
				.addComponents(
					new MessageButton()
						.setStyle('SECONDARY')
						.setCustomId(`previous_page`)
						.setEmoji(`⏪`)
				)
				.addComponents(
					new MessageButton()
						.setLabel(`page`)
						.setStyle('PRIMARY')
						.setCustomId(`page_number`)
				)
				.addComponents(
					new MessageButton()
						.setStyle('SECONDARY')
						.setCustomId(`next_page`)
						.setEmoji(`⏩`)
				)
				.addComponents(
					new MessageButton()
						.setStyle('SECONDARY')
						.setCustomId(`last_page`)
						.setEmoji(`⏭`)
				)
			if (page_index == 0) {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
			}
			
			amount_per_page = extra_meta[2];
			pages = Math.ceil(select.length / amount_per_page);
			if (page_index > pages - 1) {
				page_index = pages - 1
			}
			
			row.components[2].setLabel(`${page_index + 1}/${pages}`)
			
			if ((page_index + 1) == pages) {
				row.components[3].setDisabled(true);
				row.components[4].setDisabled(true);
			}
			
			for (let i = (page_index * amount_per_page); i < (page_index * amount_per_page) + amount_per_page; i++) {
				if (select[i]) {
					let temptitle = select[i].TITLE;
					if (temptitle.length > 50) {
						temptitle = temptitle.slice(0,50);
						temptitle = temptitle.trim();
						temptitle += "...";
					}
					listfieldbuilder += `- [**\`${select[i].ID}\`**] ${temptitle}?\n`;
				}
			}
			if (select.length == 0) {
				listfieldbuilder += `No results found!`
			}
			
			let d = new Date();
			let button_lifespan = (1 * 60 * 1000);
			let button_expiration = d.getTime() + button_lifespan;
			
			descriptionbuilder += `\n-# Buttons expire <t:${Math.floor(button_expiration / 1000)}:R>`
			
			var listembed = new MessageEmbed()
				.setColor("#c6c6c6")
				.setTitle(select.length + " results")
				.setDescription(descriptionbuilder)
				.addFields({
					name: "Poll List",
					value: listfieldbuilder,
					inline: true
				})
				//.setFooter({text:(page_index + 1) + "/" + pages})
			
			if (message_id) {
				return message_id.edit({embeds: [listembed],components: [row]}).then((newmessage) => {
					const collector = newmessage.createMessageComponentCollector({
						time: button_lifespan,
						maxProcessed: 1
					});
					
					collector.on('collect', i => {
						//i.message.delete();
						//console.log("collected " + i);
						//console.log("collected " + i.user.id);
						i.deferUpdate();
						collector.stop();
					});
					
					collector.on('end', collection => {
						collection.forEach(click => {
							//console.log(click.user.id, click.customId);
							switch (click.customId) {
								case "first_page":
									sendlistembed(select,[0,list_desc,amount_per_page],newmessage);
									break;
								case "next_page":
									sendlistembed(select,[page_index + 1,list_desc,amount_per_page],newmessage);
									break;
								case "previous_page":
									sendlistembed(select,[page_index - 1,list_desc,amount_per_page],newmessage);
									break;
								case "last_page":
									sendlistembed(select,[pages - 1,list_desc,amount_per_page],newmessage);
									break;
								case "page_number":
									sendlistembed(select,[page_index,list_desc,amount_per_page],newmessage);
									break;
							}
							
						})
						
						
					})
				});
			} else {
				return message.channel.send({embeds: [listembed],components: [row]}).then((newmessage) => {
					const collector = newmessage.createMessageComponentCollector({
						time: button_lifespan,
						maxProcessed: 1
					});
					
					collector.on('collect', i => {
						//i.message.delete();
						//console.log("collected " + i);
						//console.log("collected " + i.user.id);
						i.deferUpdate();
						collector.stop();
					});
					
					collector.on('end', collection => {
						collection.forEach(click => {
							//console.log(click.user.id, click.customId);
							switch (click.customId) {
								case "first_page":
									sendlistembed(select,[0,list_desc,amount_per_page],newmessage);
									break;
								case "next_page":
									sendlistembed(select,[page_index + 1,list_desc,amount_per_page],newmessage);
									break;
								case "previous_page":
									sendlistembed(select,[page_index - 1,list_desc,amount_per_page],newmessage);
									break;
								case "last_page":
									sendlistembed(select,[pages - 1,list_desc,amount_per_page],newmessage);
									break;
								case "page_number":
									sendlistembed(select,[page_index,list_desc,amount_per_page],newmessage);
									break;
							}
							
						})
						
						
					})
				});
			
			}
			
			}
        function sendembed(select, votereel) {
			if (!votereel) {
				votereel = null;
			}
			
			a_votesobj = JSON.parse(select.VOTES_A).data;
			b_votesobj = JSON.parse(select.VOTES_B).data;
			c_votesobj = JSON.parse(select.VOTES_C).data;
			
			a = a_votesobj.length;
			b = b_votesobj.length;
			c = c_votesobj.length;
			t = a + b;
			bar_length = 8;
			
			words = `<:a_end4:993299735630852106>`;
			
			for (i = 0; i < bar_length; i++) {
				if (i < (Math.round((a / t) * bar_length))) { //A MID
					words += "<:a_mid4:993299736452943882>";
				} else if (i == (Math.round((a / t) * bar_length))) { //MID
					//words += "<a:mid:988990340646207528>";
					words += "<:mid4:993299739099529287>";
					words += "<:b_mid4:993299737912545382>";
				} else if (i > (Math.round((a / t) * bar_length))) { //B MID
					words += "<:b_mid4:993299737912545382>";
				}
			}
			if ((Math.round((a / t) * bar_length)) == bar_length) {
				//words += "<a:mid:988990340646207528>";
				words += "<:mid4:993299739099529287>";
			}
			
			if (a == "0" && b == "0") {
				//words += "<a:mid:988990340646207528>";
				words += "<:mid4:993299739099529287>";
			}

			words += "<:b_end4:993299737157570693>";
			
			if (a > b) {
				aword = "__" + a.toString() + "__";
				bword = b.toString();
			} else if (a < b) {
				bword = "__" + b.toString() + "__";
				aword = a.toString();
			} else {
				aword = a.toString();
				bword = b.toString();
			}
			let d = new Date();
			let newdate = new Date(Number(select.DATE));
			let button_lifespan = (60 * 60 * 1000);
			let button_expiration = d.getTime() + button_lifespan;
			
			words += `\nButtons expire <t:${Math.floor(button_expiration / 1000)}:R>\n-# *${c} abstained*.`
			
			var pollembed = new MessageEmbed()
				.setColor("#c6c6c6")
				.setAuthor({name: "Submitted by " + select.AUTHOR})
				.setTitle(select.TITLE + "?")
				.setDescription(words)
				.setTimestamp(newdate.toISOString())
				.setFooter({text: (select.ID).toString()})
				.addFields({
					name: "a. " + select.OPTION_A,
					value: aword,
					inline: true
				},{
					name: "b. " + select.OPTION_B,
					value: bword,
					inline: true
				},{
					name: `__Vote for ${select.OPTION_A}__`,
					value: "xd)poll vote "+select.ID+" a"
				},{
					name: `__Vote for ${select.OPTION_B}__`,
					value: "xd)poll vote "+select.ID+" b"
				})
			
			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(`vote_a-${select.ID}`)
						.setLabel('Vote A')
						.setStyle('DANGER')
				)
				.addComponents(
					new MessageButton()
						.setCustomId(`vote_b-${select.ID}`)
						.setLabel('Vote B')
						.setStyle('SUCCESS')
				)
				.addComponents(
					new MessageButton()
						.setCustomId(`vote_c-${select.ID}`)
						.setLabel('Abstain')
						.setStyle('SECONDARY')
				)
				
			
			
			return message.channel.send({
				content: votereel,
				embeds: [pollembed],
				components: [row]
			}).then((newmessage) => {
				function collectorFilter (i) {
					if ((i.customId.slice(5,6) == "a") && (a_votesobj.includes(i.user.id))) {
						i.reply({content:"You already voted for this option!",ephemeral: true});
						return false;
					}
					
					if ((i.customId.slice(5,6) == "b") && (b_votesobj.includes(i.user.id))) {
						i.reply({content:"You already voted for this option!",ephemeral: true});
						return false;
					}
					
					if ((i.customId.slice(5,6) == "c") && (c_votesobj.includes(i.user.id))) {
						i.reply({content:"You already abstained!",ephemeral: true});
						return false;
					}
					return true;
				}
				const collector = newmessage.createMessageComponentCollector({
					filter: collectorFilter,
					time: button_lifespan,
					max: 1
				});
				collector.on('collect', i => {
					//i.message.delete();
					//console.log("collected " + i.user.id);
					//console.log("1")
					
					collector.stop();
					return i.message.delete();
					
					//collector.stop();
					//return i.message.delete();
				});
				collector.on('end', collection => {
					collection.forEach(click => {
						//console.log(click.user.id, click.customId);
						//console.log(click.customId.slice(7,17));
						/*
						db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[click.customId.slice(7,17)], (error, data) => {
							if (data == undefined) {
								return message.channel.send("Invalid ID.");
							}
							
							sendembed(data);
						});*/
						vote(click.user.id, Number(click.customId.slice(7,17)), click.customId.slice(5,6), votereel);
					})
					
					
				})
				collector.on('ignore', l => {
					return i.reply({content:"You already voted for this poll!",ephemeral: true});
				})
			});
		}
		function vote(voter, searchid, votechoice, votereel_vote) {
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
				let changing_vote = false;
				
				//return console.log(voter);
				
				if (error) {
					throw error;
				}
				try {
					votedpolls = JSON.parse(results.VOTE_ARRAY).data;
					if (votedpolls.includes(searchid)) {
						changing_vote = true;
					}
				} catch {}
				
				db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[searchid], (error, data) => {
					if (error) {
						throw error;
					}
					if (data == undefined){
						return message.channel.send("Invalid ID.");
					}
					
					if (!(votechoice == "a" || votechoice ==  "b" || votechoice ==  "c")) {
						return message.channel.send("You must use either \"`a`\" or \"`b`.\" Or you can use \"`c`\" to abstain.");
					}
					
					if (votereel_vote == null) {
						votereel_vote = ""
					}
					
					parsed_votes_a = JSON.parse(data.VOTES_A);
					parsed_votes_b = JSON.parse(data.VOTES_B);
					parsed_votes_c = JSON.parse(data.VOTES_C);
					pos_a = parsed_votes_a.data.indexOf(voter);
					pos_b = parsed_votes_b.data.indexOf(voter);
					pos_c = parsed_votes_c.data.indexOf(voter);
					
					if (votechoice == "a") {
						console.log("Arived here");
						if (parsed_votes_a.data.includes(voter) == true) {
							return message.reply({content:"You already voted for this option!",ephemeral: true})
						}
						if (changing_vote) {
							if (pos_b != -1) {
								parsed_votes_b.data.splice(pos_b,1);
								data.VOTES_B = JSON.stringify(parsed_votes_b);
								db.run(`UPDATE polls SET VOTES_B = ? WHERE ID = ?`,[data.VOTES_B,searchid],(error) => {
									if (error) {
										throw error;
									}
									
								});
							}
							if (pos_c != -1) {
								parsed_votes_c.data.splice(pos_c,1);
								data.VOTES_C = JSON.stringify(parsed_votes_c);
								db.run(`UPDATE polls SET VOTES_C = ? WHERE ID = ?`,[data.VOTES_C,searchid],(error) => {
									if (error) {
										throw error;
									}
									
								});
							}
						}
						
						parsed_votes_a.data.push(voter)
						data.VOTES_A = JSON.stringify(parsed_votes_a);
						
						db.run("PRAGMA busy_timeout = 30000");
						db.run(`UPDATE polls SET VOTES_A = ? WHERE ID = ?`,[data.VOTES_A,searchid],(error) => {
							console.log("And here");
							if (error) {
								throw error;
							}
							votereel_vote += `${message.client.users.cache.get(voter).displayName} voted for ${data.OPTION_A}\n`;
							sendembed(data, votereel_vote);
							if (!changing_vote) {
								db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
									if(error) {
										return console.log(error);
									}
									
									if(results != undefined) {
										votearray = JSON.parse(results.VOTE_ARRAY);
										
										votearray.data.push(searchid);
										
										db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
									} else {
										db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [voter, `{"data":[]}`, `{"data":[]}`], (error) => {
											votearray = JSON.parse(`{"data":[]}`);
											
											votearray.data.push(searchid);
										
											db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
										});
									}
								});
							} else {
								return;
							}
						});
					} else if (votechoice == "b") {
						if (parsed_votes_b.data.includes(voter) == true) {
							return message.reply({content:"You already voted for this option!",ephemeral: true})
						}
						if (changing_vote) {
							if (pos_a != -1) {
								console.log(`Splicing ${parsed_votes_a.data} at position ${pos_a}`);
								parsed_votes_a.data.splice(pos_a,1);
								console.log(parsed_votes_a)
								data.VOTES_A = JSON.stringify(parsed_votes_a);
								db.run(`UPDATE polls SET VOTES_A = ? WHERE ID = ?`,[data.VOTES_A,searchid],(error) => {
									if (error) {
										throw error;
									}
									
								});
							}
							if (pos_c != -1) {
								parsed_votes_c.data.splice(pos_c,1);
								data.VOTES_C = JSON.stringify(parsed_votes_c);
								db.run(`UPDATE polls SET VOTES_C = ? WHERE ID = ?`,[data.VOTES_C,searchid],(error) => {
									if (error) {
										throw error;
									}
									
								});
							}
						}
						
						parsed_votes_b.data.push(voter)
						data.VOTES_B = JSON.stringify(parsed_votes_b);
						
						db.run("PRAGMA busy_timeout = 30000");
						db.run(`UPDATE polls SET VOTES_B = ? WHERE ID = ?`,[data.VOTES_B,searchid],(error) => {
							if (error) {
								throw error;
							}
							votereel_vote += `${message.client.users.cache.get(voter).displayName} voted for ${data.OPTION_B}\n`;
							sendembed(data, votereel_vote);
							if (!changing_vote) {
								db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
									if(error) {
										return console.log(error);
									}
									
									if(results != undefined) {
										votearray = JSON.parse(results.VOTE_ARRAY);
										
										votearray.data.push(searchid);
										
										db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
									} else {
										db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [voter, `{"data":[]}`, `{"data":[]}`], (error) => {
											votearray = JSON.parse(`{"data":[]}`);
											
											votearray.data.push(searchid);
										
											db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
										});
									}
								});
							} else {
								return;
							}
						});
					} else if (votechoice == "c") {
						if (parsed_votes_c.data.includes(voter) == true) {
							return message.reply({content:"You've already abstained!",ephemeral: true})
						}
						if (changing_vote) {
							if (pos_a != -1) {
								parsed_votes_a.data.splice(pos_a,1);
								data.VOTES_A = JSON.stringify(parsed_votes_a);
								db.run(`UPDATE polls SET VOTES_A = ? WHERE ID = ?`,[data.VOTES_A,searchid],(error) => {
									if (error) {
										throw error;
									}
									
								});
							}
							if (pos_b != -1) {
								parsed_votes_b.data.splice(pos_b,1);
								data.VOTES_B = JSON.stringify(parsed_votes_b);
								db.run(`UPDATE polls SET VOTES_B = ? WHERE ID = ?`,[data.VOTES_B,searchid],(error) => {
									if (error) {
										throw error;
									}
									
								});
							}
						}
						
						parsed_votes_c.data.push(voter)
						data.VOTES_C = JSON.stringify(parsed_votes_c);
						
						db.run("PRAGMA busy_timeout = 30000");
						db.run(`UPDATE polls SET VOTES_C = ? WHERE ID = ?`,[data.VOTES_C,searchid],(error) => {
							if (error) {
								throw error;
							}
							votereel_vote += `${message.client.users.cache.get(voter).displayName} abstained\n`;
							sendembed(data, votereel_vote);
							if (!changing_vote) {
								db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
									if(error) {
										return console.log(error);
									}
									
									if(results != undefined) {
										votearray = JSON.parse(results.VOTE_ARRAY);
										
										votearray.data.push(searchid);
										
										db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
									} else {
										db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [voter, `{"data":[]}`, `{"data":[]}`], (error) => {
											votearray = JSON.parse(`{"data":[]}`);
											
											votearray.data.push(searchid);
										
											db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
										});
									}
								});
							} else {
								return;
							}
						});
					}
					
					
				});
			});
		
		}
	},
};

const helpembed = new MessageEmbed()
	.setColor("#c6c6c6")
	.setTitle("Everybody Votes but it's a command")
	.setDescription("xd)poll allows you and others to create and vote on user made polls. Every poll can only have two questions.\nEach poll has an ID that you can use to find the exact poll again in case you need it.")
	.addFields({
		name: "`xd)poll`",
		value: "Get a random poll. Excludes polls you've already voted for."
	},{
		name: "`xd)poll create <question>? <option 1>? <option 2>?`",
		value: "Create a poll. Each question and options HAVE to end with a `?`.\n`<question>` is the question you're asking\n`<option 1>` is the first answer people can choose\n`<option 2>` is the second answer people can choose."
	},{
		name: "`xd)poll vote <id> <option>`",
		value: "Vote on a poll.\n`<id>` is the ID of the poll. It should be on the embed for it.\n`<option>` is which option of the poll you are voting. Should be either \"`a`\" or \"`b`\""
	},{
		name: "`xd)poll search <id>`",
		value: "Returns the poll and its current results by ID.\n`<id>` is the ID of the poll. You'll need to already know it before using this command."
	},{
		name: "`xd)poll list [search string]`",
		value: "Returns a list of polls.\n\nUse `xd)poll help list` to learn more."
	},{
		name: "`xd)poll rand`",
		value: "Get a true random poll. It can include a poll you've already voted for."
	})

const listhelpembed = new MessageEmbed()
	.setColor("#c6c6c6")
	.setTitle("Poll List Help")
	.setDescription("# `xd)poll list [search string]`\nYou can filter and sort the poll list very easily. The search string is a `?` separated list of search options created with the format `option:criteria`. Below are a list of options you can use.\n### Examples:\n-# - `xd)poll list sort:mostvotes` - sort list from most voted\n-# - `xd)poll list title:Mr. Megee? sort:leastvotes` - only shows polls with \"Mr. Megee\" in the title and sorts by least voted.\n-# - `xd)poll list amount:15? filter:notvoted? author:colind8? sort:oldest` - Sets the amount of polls per page to 15, only shows polls you haven't voted on, only shows polls by colind8, and sorts the list from oldest.\n### Search Options")
	.addFields({
		name: "`filter:voted` or `filter:notvoted`",
		value: "Filters the search results to return only polls you've voted for (filter:voted) or haven't voted for (filter:voted)"
	},{
		name: "`sort:criteria`",
		value: "Sorts the list based on the following usable criteria: `newest`, `oldest`, `mostvotes`, and `leastvotes`. Example: `sort:mostvotes`"
	},{
		name: "`title:criteria`",
		value: "Filters the search results to return only polls with titles matching your criteria. Example: `title:would you rather`"
	},{
		name: "`author:criteria`",
		value: "Filters the search results to return only polls by an author matching your criteria. Example: `author:Mr. Megee`"
	},{
		name: "`amount:number`",
		value: "The amount of polls listed per page. Can be any number 1 - 15. Example: `amount:14`"
	},{
		name: "`page:number`",
		value: "Will go to a specific page. Example: `page:3`"
	})