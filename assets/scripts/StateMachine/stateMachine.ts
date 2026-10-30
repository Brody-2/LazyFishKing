import { _decorator, Animation, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export const state = {
    IDLE: `idle`,//待机
    ATTACK: `attacking`,//攻击
    WALKING: `walking`,//行走
    SHOOTING: `shooting`,//射击
    HEALING: `healing`,//治疗
    CASTING: `casting`,//施法
    HURT: `hurt`,//受伤
    DYING: `dying`,//死亡
    EMPTY: `empty`,//初始值

};

@ccclass('stateMachine')
export class stateMachine extends Component {

    private _CurrentState: string = state.EMPTY;//当前状态

    @property(Animation)
    private anim: Animation = null!;

    private get currentState(): String {
        return this._CurrentState;
    }

    private set currentState(value: string) {
        this._CurrentState = value;
    }

    /**状态切换 */
    public change_stateMachine_state(newState: string) {
        if (this.currentState != newState) {
            this.currentState = newState;
            if (this._CurrentState != state.CASTING) {
                this.play_anim();
            }
        }
    }
    
    /**播放动画 */
    private play_anim() {
        const animation = this.anim.getState(this._CurrentState);
        if (animation) {
            this.anim.play(this._CurrentState);
        } else {
            console.log(`没有对应的动画`)
        }
    }


    public play_anim_duration(stateName: string): number {
        const duration = this.anim.getState(stateName);
        if(duration){
            return duration.duration;
        }
        console.log(`cannot find anim` + stateName)
        return -1;
    }

    start() {

    }

    update(deltaTime: number) {

    }

}

