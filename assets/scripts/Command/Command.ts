import { tween, Vec3, } from "cc";
import { mediator } from "../Mediator/mediator";
import { state } from "../StateMachine/stateMachine";
/**
 * Command：单个"命令"的抽象

MoveCommand：一个具体的命令（让某个目标移动到某位置）

CommandQueue：管理多个命令，一个执行完再执行下一个

 */
export abstract class Command {
    private _isFinished: boolean = false;
    /**命令完成状态 */
    public get isFinished(): boolean {
        return this._isFinished;
    }
    public set isFinished(value: boolean) {
        this._isFinished = value;
    }

    private _duration: number;
    /**命令持续时间 */
    public get duration(): number {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    /**完成回调钩子 */
    public oncomplete?: () => void;

    /**子类重写的执行入口 */
    public abstract execute(): void;

    /**统一结束流程：置状态 + 触发回调 */
    public complete() {
        this._isFinished = true;
        if (this.oncomplete) {
            this.oncomplete();
        }
    }

}

export class CommandQueue {
    private _command: Command[] = [];//命令数组（待执行的命令列表）
    private _currentIndex: number = 0;//当前执行到第几个命令

    /**队列里添加命令 */
    public addcommand(command: Command) {
        if (command) {
            this._command.push(command);
        }
    }

    /**启动入口 */
    public execute() {
        this.executeNextCommand();
    }

    private executeNextCommand() {
        if (this._currentIndex < this._command.length) { //① 还有命令没执行完
            const command = this._command[this._currentIndex]; //② 取出当前命令
            command.oncomplete = () => { //③ 设置完成回调
                this._currentIndex++; //执行完了，下标+1
                this.executeNextCommand(); //④ 开始执行当前命令
            }
            command.execute();
        }
    }
}

export class MoveCommand extends Command {
    private _target: mediator;
    /**
     * 移动人物
     */
    public get target(): mediator {
        return this._target;
    }
    public set target(value: mediator) {
        this._target = value;
    }

    private _targetPos: Vec3;
    /**
     * 目标位置（世界坐标）
     */
    public get targetPos(): Vec3 {
        return this._targetPos;
    }
    public set targetPos(value: Vec3) {
        this._targetPos = value;
    }

    private _time: number;
    /**
     * 移动完成的时间
     */
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
    }

    constructor(target: mediator, targetPos: Vec3, time: number) {
        super();
        this.target = target;//移动人物存入实例中 后续可以继续调用target
        this.targetPos = targetPos;//目标位置存入实例中 后续可以继续调用targetPos
        this.time = time;////移动完成的时间存入实例中 后续可以继续调用time
        this.duration = this.time;
    }

    public execute() {
        this.target.change_mediator_state(state.WALKING);
        tween(this.target.node)
            .to(this.time, { worldPosition: this.targetPos })
            .call(() => {
                this.target.change_mediator_state(state.IDLE);
                this.complete();
            })
            .start()
    }
}

export class AttackCommand extends Command {

    private _attacker: mediator;
    /**
     * 攻击方
     */
    public get attacker(): mediator {
        return this._attacker;
    }
    public set attacker(value: mediator) {
        this._attacker = value;
    }

    private _denfender: mediator;
    public get denfender(): mediator {
        return this._denfender;
    }
    public set denfender(value: mediator) {
        this._denfender = value;
    }

    /**
     * 防御方
     */
    private _damage: number;
    public get damage(): number {
        return this._damage;
    }
    public set damage(value: number) {
        this._damage = value;
    }

    /**
     * 伤害 如果外部不传入则自行计算
     */

    /**
     * 
     * @param attacker 攻击方
     * @param denfender 防御方
     * @param damage 伤害 如果外部不传入则自行计算
     */

    constructor(attacker: mediator, denfender: mediator, damage?: number) {
        super();
        this.attacker = attacker;
        this.denfender = denfender;
        this.damage = damage;
        this.duration = this.attacker.stateMachine.play_anim_duration(state.ATTACK);
    }

    public execute(): void {
        if (this.attacker.isLive && this.denfender.isLive) {//只有攻击方和防御方都还活着，才执行攻击
            this.attacker.change_mediator_state(state.ATTACK);
            if (this.damage == undefined) {//如果外部没有传入伤害值，就自己算一个伤害
                this.damage = this.attacker.actor.attack - this.denfender.actor.defence //用攻击方的攻击力减去防御方的攻击力作为伤害
            }
            const isDead = (this.denfender.actor.hp - this.damage) <= 0;//算一下"血量 - 这次伤害"，如果结果小于等于 0，就认为会被打死。
            if (!isDead) {//如果没有死亡  创建一个"受击命令"：让被打的一方 denfender 受到 damage 点伤害
                const hurtCommand = new HurtCommand(this.denfender, this.damage);
                this.denfender.scheduleOnce(() => {
                    hurtCommand.execute();
                }, this.duration * 0.5);//this.duration 是攻击动画的时长，乘以 0.5 就是攻击动画放到一半的时间。
            } else {
                //如果这一下会把对方打死，就走死亡逻辑（DeadCommand）
                //DeadCommand
                //DeadCommand 自己不负责"什么时候死"，什么时候执行是由 AttackCommand 决定的
                const deadCommand = new DeadCommand(this.denfender);//创建一个死亡命令，让被打的一方 denfender播放死亡动画
                this.denfender.scheduleOnce(() => {
                    deadCommand.execute();
                }, this.duration * 0.5);//this.duration 是攻击动画的时长，乘以 0.5 就是攻击动画放到一半的时间。
            }

            this.attacker.scheduleOnce(() => {//等攻击方的动画时长播放完毕后
                this.complete();//命令队列才会继续执行下一步（走回来）
            }, this.duration);
        } else {
            //只要有一方已经死了，就不攻击，直接把命令标记为完成。
            this.complete();
        }
    }
}
export class HurtCommand extends Command {
    private _target: mediator;
    /**
     * 受击对象
     */
    public get target(): mediator {
        return this._target;
    }
    public set target(value: mediator) {
        this._target = value;
    }

    private _damage: number;
    /**
     * 伤害
     */
    public get damage(): number {
        return this._damage;
    }
    public set damage(value: number) {
        this._damage = value;
    }

    /**
     * 
     * @param target 受击对象
     * @param damage 伤害
     */

    constructor(target: mediator, damage: number) {
        super();
        this.target = target;
        this.damage = damage;
        this.duration = this.target.stateMachine.play_anim_duration(state.HURT);
    }

    public execute(): void {
        if (this.target.isLive) {//当前被攻击对象是否存活，如果存活就切换受击动画(防止Hurt动画连续重复播放)
            this.target.change_mediator_state(state.HURT);//让被打的人切换到"受击"状态，播放受击动画。
            const currentHp = this.target.actor.hp - this.damage;//计算扣血后的血量：当前血量 - 伤害
            this.target.Hp = currentHp > 0 ? currentHp : 0;//如果 currentHp > 0，就用 currentHp；否则为0（防止血量变成负数）
            this.target.scheduleOnce(() => {//等受击动画播放 this.duration 秒后，把这个受击命令标记为完成。
                this.complete();
            }, this.duration);
        } else {
            this.complete();//如果这个人已经死了，就不用再受击了，直接把这个命令标记为完成，免得命令队列卡住。
        }
    }
}

export class DeadCommand extends Command {
    private _target: mediator;
    /**
     * 死亡对象
     */
    public get target(): mediator {
        return this._target;
    }
    public set target(value: mediator) {
        this._target = value;
    }

    constructor(target: mediator) {
        super();
        this.target = target;
        this.duration = this.target.stateMachine.play_anim_duration(state.DYING);
    }
    public execute(): void {
        if (this.target.isLive) {//如果还没死亡则切换状态为播放死亡动画（防止已经死亡后再次触发死亡）
            this.target.change_mediator_state(state.DYING);
            this.target.Hp = 0;//死亡对象设置为0
            this.target.scheduleOnce(() => {//使用一次定时器播放一个tween动画的淡入淡出的死亡动画，然后完全消失后把当前节点移出屏幕
                tween(this.target.uiopacity)
                    .to(0.3, { opacity: 0 })
                    .call(() => {
                        this.complete();//把死亡命令标记为"完成"
                        this.target.node.removeFromParent();
                    })
                    .start();
            }, this.duration * 0.5);
        } else {
            this.complete();//否则如果这条鱼已经死了，就不用再死一次，直接把这个命令标记为完成，避免命令队列卡住。
        }
    }
}
