const config = require('../config.json');
const prefix = config.prefix;
const fetch = require('node-fetch');
const seedrandom = require('seedrandom');

module.exports = {
	name: 'sotd',
	description: 'Listen to the song of the day!',
    usage: '`xd)sotd`',
    category: 'others',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		// Fetch data
        const response = await fetch("https://raw.githubusercontent.com/Colind8/Fungi-Radio/refs/heads/main/radio/2k/radios/fungiradio.txt");
		const data = await response.text();
		
		// Build seed
		const d = new Date();
		var seed = "";
		seed += d.getMonth() + "/";
		seed += d.getDate() + "/";
		seed += d.getFullYear();
		
		// Randomize array with seed
		var arng = seedrandom.alea(seed);
		
		data_array = data.split(`\n`);
		for (let i = data_array.length -1; i > 0; i--) {
			let j = Math.floor(arng() * (i+1));
			let k = data_array[i];
			data_array[i] = data_array[j];
			data_array[j] = k;
		}
		
		// Return sotd
		return message.channel.send(`Song of the Day ${seed}\nhttps://www.youtube.com/watch?v=${data_array[0]}`);

        
    },
};