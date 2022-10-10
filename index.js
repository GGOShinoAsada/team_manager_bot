const Discord = require('discord.js');
const { Client } = require("discord.js");
const { Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
//const {PermissionsBitField } = require('discord.js')
const robots = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] });
//Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES

const fs = require('fs');
let { prefix, token } = require('./config.json');

//array of channel names
let arr1 = [];
//array of passwors
let arr2 = [];
//array of roles
let arr3 = [];

//temp variables
let n2, inputPass1, sz1, channelName, ch, role, u_array, uId, users, name, roleName, cmdline, n, permissionsArray, usersCount, usersInfoString, usersArray, index, role_everyone, rId;


let currIndex = 0;
const MAX_SIZE = 100;

const MAIN_CHANNEL_NAME = "team_manager";


const quenue = new Map();
robots.on("ready", () => {
    console.log('bot started');
});
/*
robots.on('guildMemberAdd', member => {
    let auth = member.user.user.username;
    member.guild.channels.get('welcome').send("Welcome, " + auth);
});

robots.on('guildMemberRemove', member => {
    let auth = member.user.user.username;
    member.guild.channels.get('welcome').send("Bye, " + auth);
});
*/

/*
robots.on('channelPinsUpdate', (channel, date) => {
    console.log('channei is ' + channel);
    let n = channel.memberCount();
    if (n === 0) {
        channel.delete();
    }
})
*/


robots.on('message', async message => {



    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }
    else {

        cmdline = message.content.slice(prefix.length, message.content.length);
        n = validate(cmdline);
        const messages = await message.channel.messages.fetch({ limit: 2 });

        switch (n) {
            case 0:
                let teamSize = cmdline.split(' ')[2];
                let name = cmdline.split(' ')[3];
                console.log("name " + name);
                console.log("team size " + teamSize);
                let pass = "";
                let un_pass = false;
                while (!un_pass) {
                    pass = generatePassword(4);
                    console.log("generate pass is " + pass);
                    if (currIndex > 0) {
                        for (let i = 0; i < currIndex; i++) {

                            if (pass === arr2[i]) {
                                console.log("pass is equals");
                                pass = false;
                                break;
                            }
                            else {
                                console.log("pass is not equals");
                                un_pass = true;
                            }
                        }
                    }
                    else {
                        un_pass = true;
                    }

                }
                //define @everyone role
                role_everyone = message.guild.roles.cache.find(r => r.name === "@everyone");
                //check and cr. group if it isnt exists, after that create channel
                let cat_id = message.guild.channels.cache.find(ch => ch.name == "Teams");
                if (cat_id === undefined) {
                    await message.guild.channels.create('Teams', { type: 'category' });
                    cat_id = message.guild.channels.cache.find(t => t.name === "Teams");
                }

                let main_ch = message.guild.channels.cache.find(c => c.name === MAIN_CHANNEL_NAME);
                if (main_ch === undefined) {
                    let team_manager_channel = await message.guild.channels.create(MAIN_CHANNEL_NAME, { type: 'text', parent: cat_id['id'] });
                    main_ch = team_manager_channel.overwritePermissions(
                        [
                            {
                                id: role_everyone.id,
                                deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                            },
                        ]
                    )
                }
                name = "t_" + name;
                let isNameExists = false;
                if (currIndex > 0)
                    for (let i = 0; i < currIndex; i++) {
                        if (arr1[i] === name){
                            isNameExists = true;
                        }
                    }
                if (!isNameExists) {
                    let ch_created = await message.guild.channels.create(name, { type: 'text', parent: cat_id['id'] });
                    console.log("name of channel" + ch_created['name']);
                    roleName = "role_" + name;
                    let r_created = await message.guild.roles.create({
                        data: {
                            name: roleName,
                            color: 'GREEN',
                        },
                    });
                    //set permission                
                    role_everyone = message.guild.roles.cache.find(r => r.name === "@everyone");
                    ch_created.overwritePermissions([
                        {
                            id: r_created.id,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                        },
                        {
                            id: role_everyone.id,
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                        }
                    ]);
                    arr1[currIndex] = name;
                    arr2[currIndex] = pass;
                    arr3[currIndex] = roleName;
                    currIndex++;
                    const ch_info = message.guild.channels.cache.find(ch => ch.name === name);
                    roleName = arr3[getIndexByChannel(ch_info.name)];
                    usersCount = 0;
                    u_array = ch_info.members.filter(t => !t.user.bot);
                    usersInfoString = "";
                    usersArray = [];
                    index = 0;
                    rId = -1;
                    message.guild.roles.cache.forEach(rn => {

                        if (rn.name === roleName) {
                            role = rn;
                            rId = rn.id;
                        }
                        console.log(rn.name);

                    })
                    console.log("role id " + rId);
                    u_array.forEach(u => {
                        permissionsArray = u.permissions;
                        for (let i = 0; i < permissionsArray.length; i++) {
                            if (permissionsArray[i] === rId) {
                                usersArray[index] = u['user']['username'];
                                usersCount++;
                                index++;
                            }
                        }
                    });
                    usersInfoString = "";
                    users = "";
                    index = 0;
                    if (usersCount < 9) {
                        for (let i = 0; i < usersArray.length; i++) {
                            users += "— @" + usersArray[i] + ";\n ";
                        }
                        if (users === "") {
                            usersInfoString = "team is empty"
                        }
                        else {
                            usersInfoString = users;
                        }
                    }
                    else {
                        let countOfOtherPlayers = usersCount - 9;
                        for (let i = 0; i < 9; i++) {
                            users += "— @" + usersArray[i]; + "; \n ";
                        }
                        usersInfoString = users + " and " + countOfOtherPlayers + " players";
                    }
                    let sizeInfo = usersCount + "/" + teamSize;
                    /*embed */
                    let embed = new MessageEmbed();
                    //embed.setURL(inviteString);
                    embed.setColor('DARKER_GREY');
                    embed.setTitle('Team created!');
                    embed.setDescription('team was created. Information about team: ');
                    let imgs = (JSON.parse(fs.readFileSync('./resources.json'))['images']);
                    embed.setThumbnail(imgs['1']);
                    embed.addFields({ name: "password", value: pass, inline: true }, { name: "team size", value: sizeInfo, inline: true }, { name: "current size", value: usersCount, inline: true }, { name: "players", value: usersInfoString, inline: false })
                    embed.setTimestamp();
                    embed.setFooter(text = "Sorrow teams", iconURL = imgs['2']);
                    /* end of embed */
                    //console.log(embed);
                    message.channel.send(embed);
                }
                else {
                    message.channel.send("name is already use; please changhe name and try again")
                }
                break;
            case 1:

                //got role for channel and set it for user which ask invite
                uId = messages.first().author.id;
                inputPass1 = cmdline.split(' ')[2];
                console.log("pass is " + inputPass1);
                sz1 = 0;
                fl = true;
                for (let i = 0; i < currIndex; i++) {

                    if (arr2[i] === inputPass1) {
                        console.log("password success");
                        fl = false;
                        channelName = arr1[i];
                        ch = message.guild.channels.cache.find(t => t.name === channelName);
                        roleName = arr3[i];
                        role = await message.guild.roles.cache.find(r => r.name === roleName);
                        //add user to role
                        message.guild.members.cache.get(uId).roles.add(role);
                        //create invite
                        ch.createInvite().then((inv) => { console.log('create invite ' + inv.code); message.channel.send('join to team: http://discord.gg/' + inv.code) });
                    }
                }
                if (fl) {
                    message.channel.send('please check password');
                }
                break;
            case 2:
                uId = messages.first().author.id;
                n2 = cmdline.split(' ')[2];
                console.log("name is " + n2);
                sz1 = 0;
                fl = true;
                for (let i = 0; i < currIndex; i++) {

                    if (arr1[i] === n2) {
                        console.log("name is find");
                        fl = false;
                        channelName = arr1[i];
                        ch = message.guild.channels.cache.find(t => t.name === channelName);
                        //let ind = 0;
                        roleName = arr3[i];
                        role = await message.guild.roles.cache.find(r => r.name === roleName);
                        //add user to role
                        message.guild.members.cache.get(uId).roles.add(role);
                        //create invite
                        ch.createInvite().then((inv) => { console.log('create invite ' + inv.code); message.channel.send('join to team: http://discord.gg/' + inv.code) });
                    }
                }
                if (fl) {
                    message.channel.send('please check password');
                }
                break;
            case 3:
                let currentChannelName = message.channel.name;

                const channel = message.guild.channels.cache.find(ch => ch.name === currentChannelName);
                roleName = arr3[getIndexByChannel(currentChannelName)];
                message.guild.roles.cache.forEach(tmp => {
                    if (roleName === tmp.name) {
                        role = tmp;
                    }
                });
                usersInfoString = "@" + role.name + ", team is ready!";

                message.channel.send(usersInfoString + "team is ready!");
                break;
            case 4:
                let helpString = "Commands: \n · !team create [Кол-во игроков] [Название];\n · !team join [Код];\n · !team bump [Название];\n · !team ping;\n · !team leave; \n · !team reset; \n · !team help";
                message.channel.send(helpString);
                break;
            case 5:
                //removing all teams channels and Teams category
                message.guild.channels.cache.forEach(t => {
                    if (t['name'].startsWith('t_') || t['name'] === 'Teams' || t['name'] === MAIN_CHANNEL_NAME) {
                        t.delete();
                    }
                });
                //removing all teams roles (rormat is role_t_[channel_name], for example role_t_demo
                message.guild.roles.cache.forEach(r => {
                    if (r['name'].startsWith('role_t')) {
                        r.delete();
                    }
                });
                message.channel.send("teams is reset");
                break;
            case 6:
                uId = messages.first().author.id;
                let us = message.guild.members.cache.get(uId);

                message.guild.members.cache.get(uId).roles.cache.forEach(t => {

                    if (t.name.startsWith('role_t')) {
                        let r_n = t.name;
                        let tmp = message.guild.roles.cache.find(t => t.name === r_n);

                        tmp.members.forEach((memb) => {
                            memb.roles.remove(tmp);
                        })
                    }
                })
                message.channel.send(" team role removed for user " + us.nickname + ", you can leave channel")
                break;
            case 9:
                /*let _name = "demo";
                let ch_34 = await message.guild.channels.create(_name, { type: 'voice' });
                console.log("name of channel" + ch_34['name']);
                let n33 = ch_34.members.size;
                console.log("members is " + n33);*/
                break;
            case -1:
                message.channel.send("invalid command; please check the syntax and try again")
                break;
            default:
                break;
        }

    }
});



function getIndexByChannel(ch) {
    let result = -1;
    for (let i = 0; i < currIndex; i++) {
        if (arr1[i] === ch) {
            result = i;
            break;
        }
    }
    return result;
}

function getIndexByPassword(pass) {
    let result = -1;
    for (let i = 0; i < currIndex; i++) {
        if (arr2[i] === pass) {
            result = i;
            break;
        }
    }
    return result;
}

function getIndexByRole(role) {
    let result = -1;
    for (let i = 0; i < currIndex; i++) {
        if (arr3[i] === role) {
            result = i;
            break;
        }
    }
    return result;
}

function generatePassword(n) {
    let pass = "";
    for (let i = 0; i < n; i++) {
        pass += Math.floor(Math.random() * 10);
    }
    return pass;
}


robots.on('guildMemberRemove', async member => {

    console.log("user " + member.nickname + "leave someone channel");
    member.roles.cache.forEach(r => {
        if (r.name.startsWith('role_t')) {
            member.roles.remove(r);
        }
    })
})


/**
 * validation
 */
function validate(message) {
    console.log("message is " + message);
    let n = -1;
    message = message.slice(1);
    let mainCmd = "";
    if (message.split(' ').length > 1) {
        mainCmd = message.split(' ')[0];
    }
    else {
        mainCmd = message;
    }
    let count = 0;
    switch (mainCmd) {
        case "create":

            n = 0;
            count = message.split(' ').length - 1;
            if (count !== 2) {
                n = -1;
            }
            break;
        case "join":
            n = 1;
            count = message.split(' ').length;
            if (count !== 2) {
                n = -1;
            }
            break;
        case "bump":
            n = 2;
            count = message.split(' ').length;
            if (count !== 2) {
                n = -1;
            }
            break;
        case "ping":
            n = 3;
            count = message.split(' ').length;
            if (count !== 1) {
                n = -1;
            }
            break;
        case "help":
            n = 4;
            count = message.split(' ').length - 1;
            if (count !== 0) {
                n = -1;
            }
            break;
        case "reset":
            n = 5;
            break;
        case "leave":
            n = 6;
            break;
        /*case "test":
            console.log("set test");
            n = 9;
            break;*/
        default:
            console.log("unknown command");
            n = -1;
            break;
    }
    return n;
}

robots.login(token);