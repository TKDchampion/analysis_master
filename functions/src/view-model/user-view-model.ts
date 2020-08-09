export interface UserInfo {
    account: string;
    password: string;
    counts: number;
    userId: string;
}

export class UserInfoInstance implements UserInfo {
    account: string = '';
    password: string = '';
    counts: number = 0;
    userId: string = '';
    constructor(user: any) {
        this.account = user.account;
        this.password = user.password;
        this.counts = user.counts;
        this.userId = user.userId;
    }
}