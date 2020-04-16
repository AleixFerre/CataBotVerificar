const express = require("express");
const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
let nUsers = 0;

const expressApp = express();
expressApp.get("/", (req, res) => res.json("OK"));
expressApp.listen(process.env.PORT);

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
    
    console.log("\nREADY :: Version: " + config.version + "\nON " + client.guilds.size + " servers\n" + nUsers + " users verified\n-----------------\n");

});

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function sendWelcomeMessage(member) {

    const description = "✅**TE HAS VERIFICADO CORRECTAMENTE EN EL SERVIDOR**✅\n" +
    "Puedes encontrar todas las reglas del servidor en <#692074424849137695>" +
    ". Puedes hablar de cualquier tema de conversación en <#692073250540486717>" +
    ". También puedes usar un bot muy majo en <#692772616641183854>" +
    ". El bot de Zoe está disponible en este servidor en el canal de <#698195409297735750>" +
    "\nPasalo bien!";

    const welcomeEmbed = new Discord.RichEmbed()
    .setColor(getRandomColor())
    .setTitle('👋Bienvenido/a a ' + member.guild.name + "!")
    .setDescription(description)
    .setThumbnail(member.guild.iconURL)
    .setTimestamp().setFooter("CataBotVerificar 2020 © All rights reserved");

    member.user.send(welcomeEmbed);
}

client.on('guildMemberAdd', (member) => {

    if (member.user.bot) {
        let role = member.guild.roles.find(role => role.name === "Verificado");
        member.addRole(role);
        console.log("[BOT] - " + member.user.username + " s'ha verificat!");
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
        
        let content = "**Bienvenido al servidor " + member.guild.name + "**" +
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
                    sendWelcomeMessage(member);
                    console.log("[NORMAL] - " + member.user.username + " s'ha verificat!");
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
    console.log("[REMOVE] - " + member.user.username + " ha marxat");
    nUsers--;
    client.user.setPresence({
        status: "online",
        game: {
            name: nUsers + " usuarios verificados.",
            type: "WATCHING"
        }
    });
});

client.on("disconnect", (event) => {
	nUsers = 0;
	console.log(`--------------- DISCONNECTING with code ${event.code}---------------\nReason: ${event.reason}\n---------------\n`);
});

client.login(config.token);
