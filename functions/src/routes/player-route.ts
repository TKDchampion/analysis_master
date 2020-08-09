import Route from "../router/route";
import { playerController } from "../controllers/player-controller";

export class PlayerRoute extends Route {
    constructor() {
        super();
        this.prefix = '';
        this.setRoutes();
    }

    protected setRoutes() {
        this.router.get('/getPlayerList', playerController.getplayerList);
        this.router.get('/getPlayerListId', playerController.getplayerListId);
        this.router.post('/getplayerListAnalysisId', playerController.getplayerListAnalysisId);
        this.router.get('/getPlayerMessagesId', playerController.getPlayerMessagesId);
        this.router.get('/getPlayerMessagesReplyId', playerController.getPlayerMessagesReplyId);
        this.router.put('/putPlayerMessages', playerController.putPlayerMessages);
        this.router.put('/deletePlayerMessages', playerController.deletePlayerMessages);
        this.router.put('/putPlayerReply', playerController.putPlayerReply);
        this.router.put('/deletePlayerReply', playerController.deletePlayerReply);
        this.router.get('/test', playerController.test);

    }
}