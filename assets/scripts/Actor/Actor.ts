import GameTsCfg from "../data/client/GameTsCfg";

export class ActorIDFactory {
    static _id: number = 0;
    static createuuid(): number {
        return this._id++;//先返回，再自增
    }

}

export class Actor {
    constructor(id: number) {
        this.uuid = ActorIDFactory.createuuid();
        this.id = id;
        const cfg = GameTsCfg.Actor[this.id];
        if (cfg) {
            this.cfg = cfg;
            this.attack = this.cfg?.attack;
            this.defence = this.cfg?.defence;
            this.hp = this.cfg?.hp;
            this.speed = this.cfg?.speed;
            this.rage = this.cfg?.rage;

        }
    }
    private _cfg;
    /**配置文件 */
    public get cfg() {
        return this._cfg;
    }
    public set cfg(value) {
        this._cfg = value;
    }

    private _uuid;
    /**uuid */
    private get uuid() {
        return this._uuid
    }
    private set uuid(value) {
        this._uuid = value;
    }

    private _id;
    /**id */
    private get id() {
        return this._id;
    }
    private set id(value) {
        this._id = value;
    }

    private _attack;
    /**攻击 */
    public get attack() {
        return this._attack;
    }
    public set attack(value) {
        this._attack = value;
    }

    private _hp;
    /**血量 */
    public get hp() {
        return this._hp;
    }
    public set hp(value) {
        this._hp = value;
    }

    private _speed;
    /**速度 */
    private get speed() {
        return this._speed;
    }
    private set speed(value) {
        this._speed = value;
    }

    private _rage;
    /**怒气值 */
    public get rage() {
        return this._rage;
    }
    public set rage(value) {
        this._rage = value;
    }

    private _defence;
    /**防御 */
    public get defence() {
        return this._defence;
    }
    public set defence(value) {
        this._defence = value;
    }

    private _level;
    /**等级 */
    private get level() {
        return this._level;
    }
    private set level(value) {
        this._level = value;
    }
}

