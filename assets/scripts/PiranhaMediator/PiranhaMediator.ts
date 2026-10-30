import { _decorator, Component, Node, Vec3 } from 'cc';
import { mediator } from '../Mediator/mediator';
import { Actor } from '../Actor/Actor';
import { Constants, LazyFishID } from '../Constants';
import { state, stateMachine } from '../StateMachine/stateMachine';
import { AttackCommand, CommandQueue, MoveCommand } from '../Command/Command';
const { ccclass, property } = _decorator;

@ccclass('PiranhaMediator')
export class PiranhaMediator extends mediator {
     @property(mediator)
    public Fish: mediator;
    start() {
        this.actor = new Actor(LazyFishID.Piranha);
        this.stateMachine = this.node.getComponentInChildren(stateMachine);
        this.stateMachine.change_stateMachine_state(state.IDLE);
        // const movePos = new Vec3(this.Fish.node.worldPosition.x + this.crabWidth(), this.Fish.node.worldPosition.y, this.Fish.node.worldPosition.z);//目标位置 = 螃蟹的坐标，再往右偏一点。
        // const move = new MoveCommand(this, movePos, Constants.MoveDuration);//创建一个移动命令：让食人鱼用 MoveDuration 秒，移动到 movePos。
        // const atk = new AttackCommand(this, this.Fish,100000);//创建一个攻击命令：我攻击 Fish。100000是传入的固定伤害
        // const moveBack = new MoveCommand(this, this.node.worldPosition.clone(), Constants.MoveDuration);//创建一个移动命令：让食人鱼回到自己现在的位置。
        // /**
        //  * 建一个命令队列，依次加入：
        //     1. 走过去
        //     2. 攻击
        //     3. 走回来
        //     然后开始执行
        //     CommandQueue 的设计是：上一个命令完成后，才执行下一个。
        //  */
        // const commandQueue = new CommandQueue();
        // commandQueue.addcommand(move);
        // commandQueue.addcommand(atk);
        // commandQueue.addcommand(moveBack);
        // commandQueue.execute();//开始执行
        
    }

    update(deltaTime: number) {
        
    }
}

