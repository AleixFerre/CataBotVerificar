const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
let nUsers = 0;

client.on("ready", () => {

    client.guilds.forEach (guild => {
        console.log(guild.name + ": " + guild.memberCount + " members");
        nUsers += guild.memberCount;
    });

    client.user.setPresence({
        status: "online",
        game: {
            name: nUsers + " usuarios verificados.",
            type: "WATCHING"
        }
    });
    
    console.log("Ready to verify " + nUsers + " users\n-----------------\n");

});


client.on('guildMemberAdd', (member) => {

    if (member.user.bot) {
        let role = member.guild.roles.find(role => role.name === "Verificado");
        member.addRole(role);
        console.log("BOT: " + member.user.username + " s'ha verificat!");
        nUsers++;
        client.user.setPresence({
            status: "online",
            game: {
                name: nUsers + " usuarios verificados.",
                type: "WATCHING"
            }
        });
    } else {
        let channel = member.guild.channels.filter(c => c.type === 'text').find(x => x.position == 0);
        if (!channel) return;
        
        let content = "**Bienvenido al servidor" + member.guild.name + "**" +
                    "\n---------------------------------------" +
                    "\nPuedes encontrar todas las reglas del servidor en <#692074424849137695>" +
                    "\n\nPara verificar reacciona a este mensaje clicando en el ✅";

        channel.send(content).then( async (msg) => {
            await msg.react("✅");
            const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === member.user.id;
            msg.awaitReactions(filter, { time: 60000, max: 1 }).then(async collected => {
                if (collected.size == 1) {
                    let role = msg.guild.roles.find(role => role.name === "Verificado");
                    member.addRole(role);
                    console.log(member.user.username + " s'ha verificat!");
                    nUsers++;
                    client.user.setPresence({
                        status: "online",
                        game: {
                            name: nUsers + " usuarios verificados.",
                            type: "WATCHING"
                        }
                    });
                } else {
                    let kickAware = "Te has estado demasiado tiempo sin verificar! :(";
                    await member.user.send(kickAware);
                    await member.kick(kickAware);
                }
                await msg.delete();
            })
            .catch(console.error);
        });
    }
});

client.on("guildMemberRemove", (member) => {
    console.log(member.user.username + " ha marxat");
    nUsers--;
    client.user.setPresence({
        status: "online",
        game: {
            name: nUsers + " usuarios verificados.",
            type: "WATCHING"
        }
    });
});

client.login(config.token);
