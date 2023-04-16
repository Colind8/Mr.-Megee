const config = require('../config.json');
const prefix = config.prefix;
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, generateDependencyReport, NoSubscriberBehavior, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const sounds = require(`../resources/sounds.json`);


module.exports = {
	name: 'p',
	description: 'Play a funny sound in a voice channel.',
    usage: '`xd)p [sound name]`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		const soundmap = new Map();
		const path = config.path;
		var soundlist = [];
		var soundliststring = "\n";
		
		for(i=0; i < sounds.data.length; i++) {
			soundmap.set(sounds.data[i].id, sounds.data[i].url);
			soundlist.push(sounds.data[i].id);
		}
		soundlist.sort();
		for (i=0; i < soundlist.length; i++) {
			soundliststring = soundliststring + "[`" + soundlist[i] + "`] ";
		}
		soundliststring += ""
		
		if(args[0] == "report") {
			return message.channel.send("```" + generateDependencyReport() + "```");
		}
		
		if(!args[0]) {
			return message.channel.send("__Please specify the name__" + soundliststring);
		}
		if (soundmap.has(args[0]) == false) {
			return message.channel.send("__Invalid name__" + soundliststring);
		}
		
		
		
		const channel = message.member.voice.channel;
		if (!channel) {
			return message.reply('You need to join a voice channel first!');
		}
		
		const player = createAudioPlayer();
		const resource = createAudioResource(path + soundmap.get(args[0]));
		
		const connection = joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.member.voice.channel.guild.id,
			adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
		});
		
		player.play(resource);
		connection.subscribe(player)
		
		player.on(AudioPlayerStatus.Idle, () => {
			connection.destroy();
		});
		
		player.on('error', error => {
			return message.channel.send("`BOO HOO ANOTHER ERROR: ${error.message}`")
			//console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
		});
        
    },
};

