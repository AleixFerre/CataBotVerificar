const chalk = require("chalk");
const log = chalk.bold.green;
const remove = chalk.bold.red;
const bot = chalk.bold.blue;

const Canvas = require('canvas');
const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const servers = require("../CataBOT/Storage/servers.json");

client.on("ready", () => {

    client.user.setPresence({
        status: "online",
        activity: {
            name: "usuarios verificados.",
            type: "WATCHING"
        }
    });

    console.log(log("\nREADY :: Version: " + config.version + "\nON " + client.guilds.cache.size + " servers\n-----------------\n"));

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

    let server = servers[member.guild.id];

    const description = "✅**T'HAS VERIFICAT CORRECTAMENT**✅\n" +
        "Pots trobar totes les alertes del bot a <#" + server.alertChannel + ">" +
        ". També pots usar el bot al canal <#" + server.botChannel + ">" +
        ". Per veure les comandes del bot cal posar `" + server.prefix + "help`" +
        "\nPasa'ho bé, " + member.user.username + "!";

    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor(getRandomColor())
        .setTitle('👋Benvingut/da a ' + member.guild.name + "!")
        .setDescription(description)
        .setThumbnail(member.guild.iconURL)
        .setTimestamp().setFooter("CataBOTVerificar 2020 © All rights reserved");

    member.user.send(welcomeEmbed);
}

function generateText(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomTransform() {
    let max = 0.2;
    return Math.random() * (max * 2) - max;
}

async function captcha(member, msg) {
    let text = generateText(5);
    let description = "Escriu pel xat el codi per verificar la teva conta (60 segons per respondre):";

    const canvas = Canvas.createCanvas(200, 100);
    const ctx = canvas.getContext('2d');

    let bgColor = getRandomColor();

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, getRandomTransform(), 0, 1, 0, 0);

    ctx.font = '28px sans-serif';
    let s = ctx.measureText(text);
    ctx.fillStyle = invertColor(bgColor);
    ctx.fillText(text, canvas.width / 2 - s.width / 2, canvas.height / 2);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'captcha.png');

    let message = await member.user.send(description, attachment);

    // Await messages that fit the code
    const filter = m => m.content === text && m.author.id === member.user.id;
    // Errors: ['time'] treats ending because of the time limit as an error
    message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(async collected => { // S'ha respos correctament el codi

            msg.delete();
            let role = member.guild.roles.cache.find(role => role.name === "Verificado");
            member.roles.add(role);
            sendWelcomeMessage(member);

            console.log(log("[ADD] - " + member.user.username + " s'ha verificat!"));

        }).catch(async collected => { // Ha pasat el temps
            console.log(collected);
            let kickAware = "T'has estat massa temps sense verificar el Captcha! :(";
            await member.user.send(kickAware);
            await member.kick(kickAware);
            msg.delete();
        });

}

client.on('guildMemberAdd', async(member) => {

    if (member.user.bot) {

        let role = member.guild.roles.cache.find(role => role.name === "Verificado");
        member.roles.add(role);

        console.log(bot("[BOT] - " + member.user.username + " s'ha verificat!"));

    } else {
        let channel = member.guild.channels.cache.filter(c => c.type === 'text').find(x => x.position == 0);
        if (!channel) return;

        let msg = await channel.send("<@" + member.id + "> `Mira els missatges directes per confirmar la teva identitat.`");

        captcha(member, msg);
    }
});

client.on("guildMemberRemove", (member) => {

    console.log(remove("[REMOVE] - " + member.user.username + " ha marxat"));

});

client.login(config.token);