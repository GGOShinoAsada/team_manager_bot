const Discord = require('discord.js');
const { Client } = require("discord.js");
const { Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
//const {PermissionsBitField } = require('discord.js')
const robots = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] });


const fs = require('fs');
let { prefix, token } = require('./config.json');

//array of data; format is <team name>#<password>#<role name>#<team_size>
let arr0 = [];

//array of sending embed id's
let arr1 = [];

//temp variables
let changedUser;

let inputPass1, pass, memb, channelName, ch, role, u_array, uId, users, name, roleName, cmdline, n, permissionsArray, usersCount, usersInfoString, usersArray, index, role_everyone, rId, tittle, teamSize;

//let teamSize, name, role_everyone;

let currIndex = 0;
const MAX_SIZE = 100;

const MAIN_CHANNEL_NAME = "team_manager";



robots.on("ready", () => {
    console.log('bot started');
});

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
        ch = message.channel.name;
        switch (n) {
            case 0:
                if (ch === MAIN_CHANNEL_NAME) {
                    teamSize = cmdline.split(' ')[2];
                    name = cmdline.split(' ')[3];
                    console.log("name " + name);
                    console.log("team size " + teamSize);
                    pass = "";
                    let un_pass = false;
                    while (!un_pass) {
                        pass = generatePassword(4);
                        console.log("generate pass is " + pass);
                        if (currIndex > 0) {
                            for (let i = 0; i < currIndex; i++) {

                                if (pass === arr0[i].split("#")[1]) {
                                    console.log("pass is equals");
                                    un_pass = false;
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
                    role_everyone = message.guild.roles.cache.find(r => r.name === "@everyone");
                    let cat_id = message.guild.channels.cache.find(ch => ch.name == "Teams");
                    if (cat_id === undefined) {
                        await message.guild.channels.create('Teams', { type: 'category' });
                        cat_id = message.guild.channels.cache.find(t => t.name === "Teams");
                    }

                    /*let main_ch = message.guild.channels.cache.find(c => c.name === MAIN_CHANNEL_NAME);
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
                    }*/
                    name = "t_" + name;
                    tittle = "team " + name + " was created!";
                    let isNameExists = false;
                    if (currIndex > 0)
                        for (let i = 0; i < currIndex; i++) {
                            if (arr0[i].split("#")[0] === name) {
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
                        let tmp = name + "#" + pass + "#" + roleName + "#" + teamSize;
                        arr0[currIndex] = tmp;
                        currIndex++;
                        /**
                         * start form embed
                         */
                        const ch_info = message.guild.channels.cache.find(ch => ch.name === name);
                        roleName = arr0[getIndexByChannel(ch_info.name)].split("#")[2];
                        usersCount = 0;
                        u_array = message.guild.members.cache.filter(t => !t.user.bot);
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

                            permissionsArray = u["_roles"];
                            for (let i = 0; i < permissionsArray.length; i++) {
                                if (permissionsArray[i] === rId) {
                                    usersArray[index] = u['user']['id'];
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
                                users += "— <@" + usersArray[i]; + ">; \n ";
                            }
                            usersInfoString = users + " and " + countOfOtherPlayers + " players";
                        }
                        let sizeInfo = usersCount + "/" + teamSize;
                        /**
                         * end form embed
                         */
                        let embed = new MessageEmbed();
                        embed.setColor('DARKER_GREY');
                        embed.setTitle(tittle);
                        embed.setDescription('team was created. Information about team: ');
                        let imgs = (JSON.parse(fs.readFileSync('./resources.json'))['images']);
                        embed.setThumbnail(imgs['1']);
                        embed.addFields({ name: "password", value: pass, inline: true }, { name: "team size", value: sizeInfo, inline: true }, { name: "current size", value: usersCount, inline: true }, { name: "players", value: usersInfoString, inline: false })
                        embed.setTimestamp();
                        embed.setFooter(text = "Sorrow teams", iconURL = imgs['2']);

                        //console.log(embed);
                        let info = message.channel.send(embed);
                        info.then(t => { console.log("id of sending embed is " + t.id); arr1[currIndex - 1] = t.id });
                    }
                    else {
                        message.channel.send("name is already use; please changhe name and try again")
                    }
                }
                else {
                    message.channel.send("please move to " + MAIN_CHANNEL_NAME + " and try again");
                }

                break;
            case 1:
                if (ch === MAIN_CHANNEL_NAME) {
                    //got role for channel and set it for user which ask invite
                    uId = messages.first().author.id;
                    inputPass1 = cmdline.split(' ')[2];
                    console.log("pass is " + inputPass1);
                    fl = true;
                    for (let i = 0; i < currIndex; i++) {

                        if (arr0[i].split("#")[1] === inputPass1) {
                            console.log("password success");
                            fl = false;
                            channelName = arr0[i].split("#")[0];
                            pass = arr0[i].split("#")[1];
                            ch = message.guild.channels.cache.find(t => t.name === channelName);
                            roleName = arr0[i].split("#")[2];
                            role = message.guild.roles.cache.find(r => r.name === roleName);
                            memb = message.guild.members.cache.get(uId);
                            memb.roles.add(role);
                            changedUser = memb;
                            console.log("after adding role");
                            permissionsArray = memb["_roles"];
                            for (let i = 0; i < permissionsArray.length; i++) {
                                console.log("#" + i + " - " + permissionsArray[i]);
                            }
                            /**
                             * start form embed
                             */
                            teamSize = arr0[i].split("#")[3];
                            usersCount = 0;
                            u_array = message.guild.members.cache.filter(t => !t.user.bot);
                            /*u_array.forEach(u=>{
                                console.log("==============================");
                                console.log(u["user"]["username"]);
                                console.log(u["_roles"]);
                                console.log("==============================");
                            })*/
                            usersInfoString = "";
                            usersArray = [];
                            index = 0;
                            rId = -1;
                            tittle = "team " + arr0[i].split("#")[0] + " was created!";
                            message.guild.roles.cache.forEach(rn => {

                                if (rn.name === roleName) {
                                    role = rn;
                                    rId = rn.id;
                                }
                                console.log(rn.name);

                            })
                            console.log("role id " + rId);
                            u_array.forEach(u => {


                                permissionsArray = u["_roles"];

                                for (let i = 0; i < permissionsArray.length; i++) {



                                    if (permissionsArray[i] === rId) {
                                        console.log("find permission " + permissionsArray[i]);
                                        usersArray[index] = u['user']['id'];
                                        usersCount++;
                                        index++;
                                    }
                                }
                            });
                            //add changing member
                            console.log("add permission " + roleName + " for user " + changedUser["user"]["username"]);
                            usersArray[index] = changedUser['user']['id'];
                            usersCount++;
                            index++;
                            /*permissionsArray = changedUser["_roles"];
                            for (let i = 0; i < permissionsArray.length; i++) {
                                console.log("find permission " + permissionsArray[i]);
                                usersArray[index] = changedUser['user']['username'];
                                usersCount++;
                                index++;
                            }*/
                            usersInfoString = "";
                            users = "";
                            index = 0;
                            if (usersCount < 9) {
                                for (let i = 0; i < usersArray.length; i++) {
                                    users += "— <@" + usersArray[i] + ">;\n ";
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
                            /**
                             * end form embed
                             */
                            let newEmbed = new MessageEmbed();
                            newEmbed.setColor('DARKER_GREY');
                            newEmbed.setTitle(tittle);
                            newEmbed.setDescription('team was created. Information about team: ');
                            let imgs = (JSON.parse(fs.readFileSync('./resources.json'))['images']);
                            newEmbed.setThumbnail(imgs['1']);
                            newEmbed.addFields({ name: "password", value: pass, inline: true }, { name: "team size", value: sizeInfo, inline: true }, { name: "current size", value: usersCount, inline: true }, { name: "players", value: usersInfoString, inline: false })
                            newEmbed.setTimestamp();
                            newEmbed.setFooter(text = "Sorrow teams", iconURL = imgs['2']);
                            message.channel.messages.fetch(arr1[i]).then(e => {
                                e.edit(newEmbed);
                            });
                            //create invite
                            ch.createInvite().then((inv) => { console.log('create invite ' + inv.code); memb.send('join to team: http://discord.gg/' + inv.code) });
                        }
                    }
                    if (fl) {
                        message.channel.send('please check password');
                    }
                }
                else {
                    message.channel.send("please move to " + MAIN_CHANNEL_NAME + " and try again");
                }
                break;
            case 2:
                if (ch === MAIN_CHANNEL_NAME) {
                    uId = messages.first().author.id;
                    changedUser = message.guild.members.cache.get(uId);
                    name = cmdline.split(' ')[2];
                    console.log("name is " + name);
                    fl = true;
                    for (let i = 0; i < currIndex; i++) {

                        if (arr0[i].split("#")[0] === name) {
                            console.log("name is find");
                            fl = false;
                            channelName = arr0[i].split("#")[0];
                            pass = arr0[i].split("#")[1];
                            ch = message.guild.channels.cache.find(t => t.name === channelName);
                            /**
                             * start form embed
                             */
                            teamSize = arr0[i].split("#")[3];
                            usersCount = 0;
                            u_array = message.guild.members.cache.filter(t => !t.user.bot);
                            usersInfoString = "";
                            usersArray = [];
                            index = 0;
                            rId = -1;
                            tittle = "team " + channelName + " was created!";
                            message.guild.roles.cache.forEach(rn => {

                                if (rn.name === roleName) {
                                    role = rn;
                                    rId = rn.id;
                                }
                                console.log(rn.name);

                            })
                            console.log("role id " + rId);
                            u_array.forEach(u => {
                                
                                permissionsArray = u["_roles"];
                                for (let i = 0; i < permissionsArray.length; i++) {
                                    if (permissionsArray[i] === rId) {
                                        usersArray[index] = u['user']['id'];
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
                                    users += "— <@" + usersArray[i] + ">;\n ";
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
                            /**
                             * end form embed
                             */
                            let newEmbed = new MessageEmbed();
                            newEmbed.setColor('DARKER_GREY');
                            newEmbed.setTitle(tittle);
                            newEmbed.setDescription('team was created. Information about team: ');
                            let imgs = (JSON.parse(fs.readFileSync('./resources.json'))['images']);
                            newEmbed.setThumbnail(imgs['1']);
                            newEmbed.addFields({ name: "password", value: pass, inline: true }, { name: "team size", value: sizeInfo, inline: true }, { name: "current size", value: usersCount, inline: true }, { name: "players", value: usersInfoString, inline: false })
                            newEmbed.setTimestamp();
                            newEmbed.setFooter(text = "Sorrow teams", iconURL = imgs['2']);
                            //edit exists embed
                            message.channel.messages.fetch(arr1[i]).then(e => {
                                e.edit(newEmbed);
                            });
                            //send embed again
                            message.channel.send(newEmbed);
                        }
                    }
                    if (fl) {
                        message.channel.send('please check password');

                    }
                }
                else {
                    message.channel.send("please move to " + MAIN_CHANNEL_NAME + " and try again");
                }
                break;
            case 3:
                if (ch.startsWith("t_")) {
                    let currentChannelName = message.channel.name;

                    //const channel = message.guild.channels.cache.find(ch => ch.name === currentChannelName);
                    roleName = arr0[getIndexByChannel(currentChannelName)].split("#")[2];
                    message.guild.roles.cache.forEach(tmp => {
                        if (roleName === tmp.name) {
                            role = tmp;
                        }
                    });
                    usersInfoString = "<@&" + role.id + ">, team is ready!";

                    message.channel.send(usersInfoString + "team is ready!");
                }
                else {

                }
                break;
            case 4:
                let helpString = "Commands: \n - !team create [Кол-во игроков] [Название];\n - !team join [Код];\n - !team bump [Название];\n - !team ping;\n - !team leave [Код]; \n - !team reset; \n - !team help";
                message.channel.send(helpString);
                break;
            case 5:

                if (ch === MAIN_CHANNEL_NAME) {

                    uId = messages.first().author.id;
                    memb = message.guild.members.cache.get(uId);
                    let isAdmin = false;
                    memb.roles.cache.forEach(r=>{
                        console.log("role is "+r.name);
                        if (r.name === "admin"){
                            isAdmin = true;
                        }
                    })

                    console.log("Is having admin permission? " + isAdmin);

                    if (isAdmin) {
                        //removing all teams channels and Teams category
                        message.guild.channels.cache.forEach(t => {
                            if (t['name'].startsWith('t_') || t['name'] === 'Teams') {
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
                    }
                    else {
                        message.channel.send("insufficient permissions to execute the command")
                    }

                }
                else {
                    message.channel.send("please move to " + MAIN_CHANNEL_NAME + " and try again");
                }

                break;
            case 6:
                if (ch === MAIN_CHANNEL_NAME) {
                    pass = cmdline.split(" ")[2];
                    //искать тиму по коду; если найдена, то ищем в тиме мембера и снимаем роль
                    uId = messages.first().author.id;
                    memb = message.guild.members.cache.get(uId);

                    console.log("pass is " + pass);
                    index = getIndexByPassword(pass);
                    console.log("index " + index);
                    // channel = message.guild.channels.cache.find(c=>{c.name === arr0[ind].split("#")[0]});
                    roleName = arr0[index].split("#")[2];
                    console.log("role is " + roleName);
                    // isComplete = true;
                    //  memb = message.guild.members.cache.get(uId);
                    message.guild.roles.cache.forEach(r => {
                        console.log(r.name);
                        if (r.name === roleName) {
                            console.log("success ");
                            role = r;
                        }
                    });
                    //remove role for user
                    memb.roles.remove(role);

                    //role = message.guild.roles.cache.find(r => { r.name === roleName });
                    console.log("role all is " + role);
                    changedUser = message.guild.members.cache.get(uId);

                    console.log("changedUser is " + changedUser.id);



                    console.log("after removing role");

                    //memb = message.guild.members.cache.get(uId);
                    permissionsArray = changedUser["_roles"];
                    for (let i = 0; i < permissionsArray.length; i++) {
                        console.log("#" + i + " - " + permissionsArray[i]);
                    }



                    /**
                     * start form embed
                     */
                    usersCount = 0;
                    u_array = message.guild.members.cache.filter(m => !m.user.bot); //ch.members.filter(t => !t.user.bot);
                    usersInfoString = "";
                    usersArray = [];
                    //index = 0;
                    rId = -1;
                    tittle = "team " + arr0[index].split("#")[0] + " was created!";
                    index = 0;
                    message.guild.roles.cache.forEach(rn => {

                        if (rn.name === roleName) {
                            role = rn;
                            rId = rn.id;
                        }
                        console.log(rn.name);

                    })

                    console.log("role id " + rId);
                    u_array.forEach(u => {
                        //exclude changing member
                        if (u.id !== changedUser["id"]) {
                            permissionsArray = u["_roles"];
                            for (let i = 0; i < permissionsArray.length; i++) {
                                if (permissionsArray[i] === rId) {
                                    usersArray[index] = u['user']['id'];
                                    usersCount++;
                                    index++;
                                }
                            }
                        }

                    });
                    usersInfoString = "";
                    users = "";
                    index = 0;
                    if (usersCount < 9) {
                        for (let i = 0; i < usersArray.length; i++) {
                            users += "— <@" + usersArray[i] + ">;\n ";
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
                    //end form embed
                    /*embed */
                    let newEmbed = new MessageEmbed();
                    //embed.setURL(inviteString);
                    newEmbed.setColor('DARKER_GREY');
                    newEmbed.setTitle(tittle);
                    newEmbed.setDescription('team was created. Information about team: ');
                    let imgs = (JSON.parse(fs.readFileSync('./resources.json'))['images']);
                    newEmbed.setThumbnail(imgs['1']);
                    newEmbed.addFields({ name: "password", value: pass, inline: true }, { name: "team size", value: sizeInfo, inline: true }, { name: "current size", value: usersCount, inline: true }, { name: "players", value: usersInfoString, inline: false })
                    newEmbed.setTimestamp();
                    newEmbed.setFooter(text = "Sorrow teams", iconURL = imgs['2']);
                    index = getIndexByPassword(pass);
                    message.channel.messages.fetch(arr1[index]).then(e => {
                        e.edit(newEmbed);
                    });

                    memb.send(" team role removed for user <@" + memb["user"]["id"] + ">, you can leave channel")
                }
                else {
                    message.channel.send("please move to " + MAIN_CHANNEL_NAME + " and try again");
                }

                break;
            /* case 9:
                  console.log("this is a test action");
                 break;*/
            case -1:
                message.channel.send("invalid command; please check the syntax and try again")
                break;
            default:
                break;
        }

    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getIndexByChannel(ch) {
    let result = -1;
    for (let i = 0; i < currIndex; i++) {

        if (arr0[i].split("#")[0] === ch) {
            result = i;
            break;
        }
    }
    return result;
}

function getIndexByPassword(pass) {
    let result = -1;
    for (let i = 0; i < currIndex; i++) {
        if (arr0[i].split("#")[1] === pass) {
            result = i;
            break;
        }
    }
    return result;
}

function getIndexByRole(role) {
    let result = -1;
    for (let i = 0; i < currIndex; i++) {
        if (arr0[i].split("#")[2] === role) {
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
            count = message.split(' ').length;
            if (count !== 3) {
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
            count = message.split(' ').length;
            if (count !== 1) {
                n = -1;
            }
            break;
        case "reset":
            n = 5;
            break;
        case "leave":
            count = message.split(' ').length;
            if (count !== 2) {
                n = -1;
            }
            n = 6;
            break;
        /* case "test":
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