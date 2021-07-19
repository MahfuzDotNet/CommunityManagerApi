import { json } from 'express';
import * as fs from 'fs';
import { stringify } from 'querystring';
import { v4 as uuidv4 } from 'uuid';
import IClub from './interfaces/clubInterface'
import IMember from './interfaces/memberInteface'
import IClubDetail from './interfaces/clubDetailInterface'

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

app.use('/delete/:id/:isclub', async (req: any, res: any, _next: any) => {

    try {
        await writeDeletedClubDetails(req.params.id, req.params.isclub);
        return res.status(200).send({ message: 'File deleted successfully!' });
    } catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
});

var writeDeletedClubDetails = async (id: string, isClub: boolean) => {
    try {
        let clubs: IClub[] = [];
        let members: IMember[] = [];
        let isclubvalue: boolean = isClub;
        if (isclubvalue) {
            fs.readFile(pathClub, async function (_err: Error, data: any) {
                if (fs.statSync(pathClub).size !== 0) {
                    let jsonData = JSON.parse(data);
                    for (let item of jsonData) {
                        if (item.id !== id) {
                            let club = {} as IClub;

                            club.id = item.id;
                            club.clubName = item.clubName;

                            clubs.push(club);
                        }
                    }
                    fs.writeFileSync(pathClub, JSON.stringify(clubs));
                }
            })
        }

        if (isclubvalue !== true) {
            fs.readFile(pathMember, function (_err: Error, data: any) {
                if (fs.statSync(pathMember).size !== 0) {

                    let jsonData = JSON.parse(data);

                    for (let item of jsonData) {
                        if (item.id !== id) {

                            let member = {} as IMember;

                            member.id = item.id;
                            member.clubId = item.clubId;
                            member.memberName = item.memberName;
                            member.memberSurname = item.memberSurname;

                            members.push(member);
                        }

                    }
                    fs.writeFileSync(pathMember, JSON.stringify(members));

                }
            })

        }
    } catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
}

app.get('/clubDetails', async (req: any, res: any, _next: any) => {

    try {

        let clubDetails: IClubDetail[] = [];
        let clubs: IClub[] = [];
        let members: IMember[] = [];

        fs.readFile(pathClub, function (_err: Error, data: any) {

            if (fs.statSync(pathClub).size !== 0) {
                let clubList: IClub[] = [];
                let jsonData = JSON.parse(data);

                for (let item of jsonData) {
                    let club = {} as IClub;

                    club.id = item.id;
                    club.clubName = item.clubName;

                    clubs.push(club);
                }

            }

            fs.readFile(pathMember, function (_err: Error, data: any) {

                if (fs.statSync(pathMember).size !== 0) {
                    let jsonData = JSON.parse(data);

                    for (let item of jsonData) {
                        let member = {} as IMember;

                        member.id = item.id;
                        member.clubId = item.clubId;
                        member.memberName = item.memberName;
                        member.memberSurname = item.memberSurname;

                        members.push(member);
                    }
                }

                for (let club of clubs) {

                    if (members.filter(m => m.clubId === club.id).length === 0) {

                        let clubDetail = {} as IClubDetail;

                        clubDetail.id = uuidv4();
                        clubDetail.clubId = club.id;
                        clubDetail.clubName = club.clubName;

                        clubDetails.push(clubDetail);

                    }

                    for (let member of members) {
                        let clubDetail = {} as IClubDetail;

                        if (member.clubId === club.id) {
                            clubDetail.id = uuidv4();
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
            })
        })

    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.get('/members', async (req: any, res: any, _next: any) => {

    try {

        let members: IMember[] = [];
        let path = 'member.json';

        await fs.readFile(path, function (_err: Error, data: any) {

            if (fs.statSync(path).size !== 0) {
                let jsonData = JSON.parse(data);

                for (let item of jsonData) {
                    let member = {} as IMember;

                    member.id = item.Id;
                    member.clubId = item.clubId;
                    member.memberName = item.memberName;
                    member.memberSurname = item.memberSurname;

                    members.push(member);
                }
            }

        })

        return res.status(200).send(members);

    } catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
});

// Write route
app.use('/createclub', async (req: any, res: any, _next: any) => {

    try {
        const fileContent = req.body;
        await writeClubToFileAsync(fileContent);
        return res.status(200).send({ message: 'File written successfully!' });

    } catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
});

var writeClubToFileAsync = (contentToWrite: any) => {
    try {

        let items: IClub[] = [];
        const path = "club.json";
        let content = JSON.stringify(contentToWrite);
        var clubName = JSON.parse(content).name;
        let clubMembers: IMember[] = JSON.parse(content).members;
        let newClub = {} as IClub;

        newClub.id = uuidv4();
        newClub.clubName = clubName;

        fs.readFile(path, function (_err: Error, data: any) {

            if (fs.statSync(path).size !== 0) {
                let jsonData = JSON.parse(data);

                for (let item of jsonData) {
                    let club = {} as IClub;

                    club.id = item.id;
                    club.clubName = item.clubName;

                    items.push(club);
                }
            }

            items.push(newClub);

            fs.writeFileSync(path, JSON.stringify(items));

            writeMemberToFileAsync(clubMembers, newClub.id);

        })

    } catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
}

var writeMemberToFileAsync = (members: IMember[], clubId: string) => {
    try {

        let items: IMember[] = [];
        const path = "member.json";

        fs.readFile(path, function (_err: Error, data: any) {
            if (fs.statSync(path).size !== 0) {
                let jsonData = JSON.parse(data);

                for (let item of jsonData) {
                    let member = {} as IMember;

                    member.id = item.id;
                    member.clubId = item.clubId;
                    member.memberName = item.memberName;
                    member.memberSurname = item.memberSurname;

                    items.push(member);
                }

            }

            for (let itemMember of members) {
                let member = {} as IMember;

                member.id = uuidv4();
                member.clubId = clubId;
                member.memberName = itemMember.memberName;
                member.memberSurname = itemMember.memberSurname;

                items.push(member);
            }

            fs.writeFileSync(path, JSON.stringify(items));
        })

    } catch (err) {
        throw new Error(`Could not write file because of {err}`);
    }
}