import Route from "./route";
import { UserRoute } from "../routes/user-route";
import { PlayerRoute } from "../routes/player-route";

export const router: Array<Route> = [
    new UserRoute(),
    new PlayerRoute()
]