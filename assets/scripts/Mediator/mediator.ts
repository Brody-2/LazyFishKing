import { _decorator, Component, Mat3, Mat4, mat4, math, Node, ProgressBar, UIOpacity, UITransform, UITransformComponent, Vec2, Vec3 } from 'cc';
import { state, stateMachine } from '../StateMachine/stateMachine';
import { Actor } from '../Actor/Actor';
const { ccclass, property } = _decorator;

@ccclass('mediator')
export class mediator extends Component {
    /**
     * 状态机
     */
    private _stateMachine: stateMachine;

    @property(ProgressBar)
    private rageBar: ProgressBar = null;

    @property(ProgressBar)
    private HpBar: ProgressBar = null;

    @property(Node)
    public crab: Node = null;

    /**
     * 获取 crab 节点的实际显示宽度。
     * 计算方式：原始内容宽度 × 横向缩放的绝对值。
     * 负缩放只表示左右镜像翻转，不会产生负宽度，所以取 Math.abs。
     * @returns 实际显示宽度（像素）
    */
    public crabWidth(): number {
        const ScaleX = Math.abs(this.crab.scale.x);//取出节点横向的缩放比例，并把它变成正数；
        return this.crab.getComponent(UITransform).contentSize.width * ScaleX;//返回 原始宽度 × 横向缩放，也就是这个节点在屏幕上实际占多宽。
    }

    public get stateMachine(): stateMachine {
        return this._stateMachine;
    }

    public set stateMachine(newState: stateMachine) {
        this._stateMachine = newState;
    }

    private _isLive: boolean = true;
    /**
     * 当前是否存活
     */
    public get isLive(): boolean {
        return this._isLive;
    }
    public set isLive(value: boolean) {
        this._isLive = value;
    }

    private _uiopacity: UIOpacity;
    /**
     * 透明度设置组件
     */
    public get uiopacity(): UIOpacity {
        return this._uiopacity;
    }
    public set uiopacity(value: UIOpacity) {
        this._uiopacity = value;
    }

    private _isReverse: number = 1;
    /**
     * 1是从左到右
     * -1是从右到左
    */
    public get isReverse(): number {
        return this._isReverse;
    }
    public set isReverse(value: number) {
        this._isReverse = value;
        this.crab.scale = new Vec3(this.crab.scale.x * this._isReverse, this.crab.scale.y, this.crab.scale.z);//把刚刚算出来的新缩放，重新设置给 crab 节点。
    }

    private _actor: Actor;
    /**Actor */
    public get actor(): Actor {
        return this._actor;
    }

    public set actor(value: Actor) {
        this._actor = value;
    }

    public get Hp(): Number {
        return this.actor.hp;
    }

    public set Hp(value: number) {
        if (value < 0 || value > this.actor.cfg.hp) {
            console.log("bad Hp value" + value);
            return;
        }
        this.actor.hp = value;
        this.HpBar.progress = this.actor.hp / this.actor.cfg.hp;
    }

    public get Rage(): number {
        return this.actor.rage;
    }

    public set Rage(value: number) {
        if (value < 0 || value > this.actor.cfg.rage) {
            console.log("bad rage value" + value);
            return;
        }
        this.actor.rage = value;
        this.rageBar.progress = this.actor.rage / this.actor.cfg.rage;
    }

    protected onLoad(): void {
        this.uiopacity = this.node.getComponent(UIOpacity);
    }
    start() {

    }

    update(deltaTime: number) {

    }

    /**状态切换 */
    public change_mediator_state(newState: string) {
        this.stateMachine.change_stateMachine_state(newState);
        if (newState == state.HURT) {
            this.hurt();
        } else if (newState == state.DYING) {
            this.dying();
        }
    }

    /**受击 */
    private hurt() {
        const dir = this._stateMachine.play_anim_duration(state.HURT);
        this.scheduleOnce(() => {
            this.stateMachine.change_stateMachine_state(state.IDLE);
        }, dir)
    }

    /**死亡 */
    private dying() {
        this.isLive = false;
    }
}

