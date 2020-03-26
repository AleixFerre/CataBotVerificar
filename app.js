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


client.on('guildMemberAdd', (member) => {
    
	let channel = member.guild.channels.filter(c => c.type === 'text').find(x => x.position == 0);
    if (!channel) return;
    
    let content = "**Bienvenido al servidor" + member.guild.name + "**" +
                  "\n\nPuedes encontrar todas las reglas del servidor en <#692074424849137695>" +
                  "\n\nQue lo pases bien!😄";

    channel.send(content).then( async (msg) => {
        await msg.react("✅");
        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === member.user.id;
        msg.awaitReactions(filter, { time: 15000, max: 1 }).then(async collected => {
            if (collected.size == 1) {
                let role = msg.guild.roles.find(role => role.name === "Verificado");
                member.addRole(role);
            } else {
                let kickAware = "Te has estado demasiado tiempo sin verificar! :(";
                await member.user.send(kickAware);
                await member.kick(kickAware);
            }
            await msg.delete();
        })
        .catch(console.error);
    });

});

client.login(config.token);