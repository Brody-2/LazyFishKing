import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { mediator } from '../Mediator/mediator';
import { Actor } from '../Actor/Actor';
import { Constants, LazyFishID } from '../Constants';
import { state, stateMachine } from '../StateMachine/stateMachine';
import { AttackCommand, CommandQueue, MoveCommand } from '../Command/Command';
const { ccclass, property } = _decorator;

@ccclass('CrabMediator')
export class CrabMediator extends mediator {
   
    start() {
        this.actor = new Actor(LazyFishID.crab);//创建一个螃蟹角色
        this.stateMachine = this.node.getComponentInChildren(stateMachine);//找到状态机
        this.stateMachine.change_stateMachine_state(state.IDLE);//播放待机动画
       

    }

    update(deltaTime: number) {

    }
}

