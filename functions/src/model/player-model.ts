import { db } from "../detabase/setting";
import { verify } from "./verify-model";
import { dataBase } from "../detabase/db-interface";
import * as admin from 'firebase-admin';
import { ErrorContent } from "../view-model/error-viewmodel";

class PlayerModel {
    public getplayerList(req: any) {
        const reference = db.collection('playerList').doc('list');
        const formatResultFn = (result: any) => { return result.data() };
        const asyncData = dataBase.get({ reference: reference }, formatResultFn);
        return asyncData;
    }

    public getplayerListId(req: any) {
        const id = req.query.id;
        const time = req.query.time;
        const reference = db.collection('playerList').doc('winRate');
        const formatResultFn = (result: any) => {
            const list = Object.values(result.data());
            const filterList = list.filter((i: any) => i.team1_id === id || i.team2_id === id);
            filterList.forEach((i: any) => {
                if (i.active) {
                    delete i.team1_winRate;
                    delete i.team2_winRate;
                }
            });
            return filterList.filter((i: any) => i.time === time);
        };
        const asyncData = dataBase.get({ reference: reference }, formatResultFn);
        return asyncData;
    }

    public getplayerListAnalysisId(req: any) {
        const id = req.body.id;
        const account = req.body.account;
        const time = req.body.time;
        const game_id = req.body.game_id;
        const reference = db.collection('playerList').doc('winRate');
        const formatResultFn = (result: any) => {
            const list = Object.values(result.data());
            const filterList = list.filter((i: any) => i.team1_id === id || i.team2_id === id);
            const filterItemVs = filterList.find((i: any) => i.active === true);
            return this.getplayerListAnalysisUser(filterItemVs, account, time, game_id);
        };
        const asyncData = dataBase.get({ reference: reference }, verify.verifyCounts(req, formatResultFn));

        return asyncData;
    }

    private getplayerListAnalysisUser(item: any, account: string, time: string, game_id: string) {
        const userReference = db.collection('users').doc('user');
        return userReference.get()
            .then((query: any) => {
                const list: any = Object.values(query.data());
                const user = list.find((i: any) => i.account === account);
                if (user.counts >= 0) {
                    if (user.read.time === time) {
                        if (!user.read.active.includes(game_id)) {
                            user.counts = user.counts - 1;
                            user.read.active.push(game_id);
                        }
                    } else {
                        user.counts = user.counts - 1;
                        user.read.time = time;
                        user.read.active = [game_id];
                    }
                    const updateObj: any = {};
                    updateObj[`user${user.userId}`] = user;

                    if (user.counts >= 0) {
                        return userReference.update(updateObj)
                            .then(function () {
                                return item
                            })
                            .catch(function (error) {
                                console.error("Error writing document: ", error);
                            });
                    } else {
                        return { message: 'user unauthorized', errorStatus: 401 } as ErrorContent;
                    }
                } else {
                    return { message: 'user unauthorized', errorStatus: 401 } as ErrorContent;
                }
            })
            .catch(function (error) {
                console.error("Error read document: ", error);
            });
    }

    public getPlayerMessagesId(req: any) {
        const id = req.query.id;
        const reference = db.collection('playerList').doc('messages');
        const formatResultFn = (result: any) => {
            const teamIdObj = `teamId${id}`
            let filterItemList = result.data()[teamIdObj];
            if (filterItemList) {
                filterItemList.forEach((element: any) => {
                    const replyObj = `replyId${element.replyId}`;
                    element.replyConuts = result.data()[replyObj] ? result.data()[replyObj].length : 0;
                });
                filterItemList.sort((a: any, b: any) => { return new Date(a.time) > new Date(b.time) ? -1 : 1; });
            } else {
                filterItemList = [];
            }
            return filterItemList
        };
        const asyncData = dataBase.get({ reference: reference }, formatResultFn);
        return asyncData;
    }

    public getPlayerMessagesReplyId(req: any) {
        const id = req.query.id;
        const reference = db.collection('playerList').doc('messages');
        const formatResultFn = (result: any) => {
            const replyObj = `replyId${id}`;
            const filterItemList = result.data()[replyObj] ? result.data()[replyObj] : [];
            filterItemList.sort((a: any, b: any) => { return new Date(a.time) > new Date(b.time) ? -1 : 1; });
            return filterItemList;
        };
        const asyncData = dataBase.get({ reference: reference }, formatResultFn);
        return asyncData;
    }

    public putPlayerMessages(req: any) {
        const teamId = req.query.teamId;
        const obj = req.body;
        const reference = db.collection('playerList').doc('messages');
        const teamIdObj = `teamId${teamId}`;
        const setParams: any = {};
        if (verify.getToken(req).account === obj.author) {
            setParams[teamIdObj] = admin.firestore.FieldValue.arrayUnion(obj);
        }
        const asyncData = dataBase.put({ reference: reference, setParams: setParams });
        return asyncData;
    }

    public deletePlayerMessages(req: any) {
        const teamId = req.query.teamId;
        const obj = req.body;
        const reference = db.collection('playerList').doc('messages');
        const teamIdObj = `teamId${teamId}`;
        const setParams: any = {};
        if (verify.getToken(req).account === obj.author) {
            setParams[teamIdObj] = admin.firestore.FieldValue.arrayRemove(obj);
        }
        const formatResultFn = (result: any) => {
            const deleteParams: any = {};
            deleteParams[`replyId${obj.replyId}`] = admin.firestore.FieldValue.delete();
            return reference.update(deleteParams);
        };
        const asyncData = dataBase.put({ reference: reference, setParams: setParams }, formatResultFn);
        return asyncData;
    }

    public putPlayerReply(req: any) {
        const replyId = req.query.replyId;
        const obj = req.body;
        const reference = db.collection('playerList').doc('messages');
        const replyIdObj = `replyId${replyId}`;
        const setParams: any = {};
        if (verify.getToken(req).account === obj.author) {
            setParams[replyIdObj] = admin.firestore.FieldValue.arrayUnion(obj);
        }
        const asyncData = dataBase.put({ reference: reference, setParams: setParams });
        return asyncData;
    }

    public deletePlayerReply(req: any) {
        const replyId = req.query.replyId;
        const obj = req.body;
        const reference = db.collection('playerList').doc('messages');
        const replyIdObj = `replyId${replyId}`;
        const setParams: any = {};
        if (verify.getToken(req).account === obj.author) {
            setParams[replyIdObj] = admin.firestore.FieldValue.arrayRemove(obj);
        }
        const asyncData = dataBase.put({ reference: reference, setParams: setParams });
        return asyncData;
    }

    test(req: any) {
        const reference = db.collection('playerList').doc('test');
        // const setParams = {
        //     test1: {
        //         age: 456,
        //         name: 123
        //     }
        // }
        const setParams: any = {};
        setParams.test1 = admin.firestore.FieldValue.delete();
        const asyncData = dataBase.put({ reference: reference, setParams });
        return asyncData;
    }
}

export const playerModel = new PlayerModel();