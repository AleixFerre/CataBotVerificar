const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");

client.on("ready", () => {

    client.user.setPresence({
        status: "online",
        game: {
            name: "verificar.",
            type: "PLAYING"
        }
    });
    
    console.log("Ready to verify");
    
});


client.on('message', message => {

    if (message.author.bot) return;

    let link = 'https://discordapp.com/oauth2/authorize?client_id='+ config.clientid +'&permissions=8&scope=bot';

	const embedMessage = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setTitle('Invite link')
            .setURL(link)
            .setAuthor('CataBOTVerificar', 'https://i.imgur.com/FrOPSdc.jpg', 'https://github.com/CatalaHD/DiscordBotVerificar')
            .setDescription('Aqui tens el link')
            .setThumbnail('https://i.imgur.com/FrOPSdc.jpg')
            .setTimestamp()
            .setFooter('Convida amb precaució');

	message.author.send(embedMessage).catch(console.error);

});

client.login(config.token);