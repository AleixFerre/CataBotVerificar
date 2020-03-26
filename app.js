const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");

client.on("ready", () => {

    client.user.setPresence({
        status: "online",
        game: {
            name: client.guilds.size + " servers.",
            type: "WATCHING"
        }
	});

	console.log("READY :: Version " + config.version +
				"\nON " + client.guilds.size + " servers\n" +
				"---------------------------------");
});


client.on('message', message => {

	if (message === "!invite") {
		let link = 'https://discordapp.com/oauth2/authorize?client_id='+ config.clientid +'&permissions=8&scope=bot';

        const embedMessage = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setTitle('Invite link')
            .setURL(link)
            .setAuthor('CataBOT', 'https://i.imgur.com/UXoPSuU.jpg', 'https://github.com/CatalaHD/DiscordBot')
            .setDescription('Aqui tens el link')
            .setThumbnail('https://i.imgur.com/UXoPSuU.jpg')
            .setTimestamp()
            .setFooter('Convida amb precaució');

        message.author.send(embedMessage).catch(console.error);
	}

});

client.login(config.token);
