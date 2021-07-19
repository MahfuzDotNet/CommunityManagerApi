"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const uuid_1 = require("uuid");
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const promisify = require('util').promisify;
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
// Port Environment variable
const PORT = process.env.PORT || 5000;
// Add headers
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
let pathClub = 'club.json';
let pathMember = 'member.json';
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use('/delete/:id/:isclub', (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield writeDeletedClubDetails(req.params.id, req.params.isclub);
        return res.status(200).send({ message: 'File deleted successfully!' });
    }
    catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
}));
var writeDeletedClubDetails = (id, isClub) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let clubs = [];
        let members = [];
        let isclubvalue = isClub;
        if (isclubvalue) {
            fs.readFile(pathClub, function (_err, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (fs.statSync(pathClub).size !== 0) {
                        let jsonData = JSON.parse(data);
                        for (let item of jsonData) {
                            if (item.id !== id) {
                                let club = {};
                                club.id = item.id;
                                club.clubName = item.clubName;
                                clubs.push(club);
                            }
                        }
                        fs.writeFileSync(pathClub, JSON.stringify(clubs));
                    }
                });
            });
        }
        if (isclubvalue !== true) {
            fs.readFile(pathMember, function (_err, data) {
                if (fs.statSync(pathMember).size !== 0) {
                    let jsonData = JSON.parse(data);
                    for (let item of jsonData) {
                        if (item.id !== id) {
                            let member = {};
                            member.id = item.id;
                            member.clubId = item.clubId;
                            member.memberName = item.memberName;
                            member.memberSurname = item.memberSurname;
                            members.push(member);
                        }
                    }
                    fs.writeFileSync(pathMember, JSON.stringify(members));
                }
            });
        }
    }
    catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
});
app.get('/clubDetails', (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let clubDetails = [];
        let clubs = [];
        let members = [];
        fs.readFile(pathClub, function (_err, data) {
            if (fs.statSync(pathClub).size !== 0) {
                let clubList = [];
                let jsonData = JSON.parse(data);
                for (let item of jsonData) {
                    let club = {};
                    club.id = item.id;
                    club.clubName = item.clubName;
                    clubs.push(club);
                }
            }
            fs.readFile(pathMember, function (_err, data) {
                if (fs.statSync(pathMember).size !== 0) {
                    let jsonData = JSON.parse(data);
                    for (let item of jsonData) {
                        let member = {};
                        member.id = item.id;
                        member.clubId = item.clubId;
                        member.memberName = item.memberName;
                        member.memberSurname = item.memberSurname;
                        members.push(member);
                    }
                }
                for (let club of clubs) {
                    if (members.filter(m => m.clubId === club.id).length === 0) {
                        let clubDetail = {};
                        clubDetail.id = uuid_1.v4();
                        clubDetail.clubId = club.id;
                        clubDetail.clubName = club.clubName;
                        clubDetails.push(clubDetail);
                    }
                    for (let member of members) {
                        let clubDetail = {};
                        if (member.clubId === club.id) {
                            clubDetail.id = uuid_1.v4();
                            clubDetail.clubId = club.id;
                            clubDetail.clubName = club.clubName;
                            clubDetail.memberId = member.id;
                            clubDetail.memberName = member.memberName;
                            clubDetail.memberSurname = member.memberSurname;
                        }
                        clubDetails.push(clubDetail);
                    }
                }
                return res.status(200).send(clubDetails);
            });
        });
    }
    catch (e) {
        res.status(500).send(e.message);
    }
}));
app.get('/members', (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let members = [];
        let path = 'member.json';
        yield fs.readFile(path, function (_err, data) {
            if (fs.statSync(path).size !== 0) {
                let jsonData = JSON.parse(data);
                for (let item of jsonData) {
                    let member = {};
                    member.id = item.Id;
                    member.clubId = item.clubId;
                    member.memberName = item.memberName;
                    member.memberSurname = item.memberSurname;
                    members.push(member);
                }
            }
        });
        return res.status(200).send(members);
    }
    catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
}));
// Write route
app.use('/createclub', (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileContent = req.body;
        yield writeClubToFileAsync(fileContent);
        return res.status(200).send({ message: 'File written successfully!' });
    }
    catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
}));
var writeClubToFileAsync = (contentToWrite) => {
    try {
        let items = [];
        const path = "club.json";
        let content = JSON.stringify(contentToWrite);
        var clubName = JSON.parse(content).name;
        let clubMembers = JSON.parse(content).members;
        let newClub = {};
        newClub.id = uuid_1.v4();
        newClub.clubName = clubName;
        fs.readFile(path, function (_err, data) {
            if (fs.statSync(path).size !== 0) {
                let jsonData = JSON.parse(data);
                for (let item of jsonData) {
                    let club = {};
                    club.id = item.id;
                    club.clubName = item.clubName;
                    items.push(club);
                }
            }
            items.push(newClub);
            fs.writeFileSync(path, JSON.stringify(items));
            writeMemberToFileAsync(clubMembers, newClub.id);
        });
    }
    catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
};
var writeMemberToFileAsync = (members, clubId) => {
    try {
        let items = [];
        const path = "member.json";
        fs.readFile(path, function (_err, data) {
            if (fs.statSync(path).size !== 0) {
                let jsonData = JSON.parse(data);
                for (let item of jsonData) {
                    let member = {};
                    member.id = item.id;
                    member.clubId = item.clubId;
                    member.memberName = item.memberName;
                    member.memberSurname = item.memberSurname;
                    items.push(member);
                }
            }
            for (let itemMember of members) {
                let member = {};
                member.id = uuid_1.v4();
                member.clubId = clubId;
                member.memberName = itemMember.memberName;
                member.memberSurname = itemMember.memberSurname;
                items.push(member);
            }
            fs.writeFileSync(path, JSON.stringify(items));
        });
    }
    catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
};
