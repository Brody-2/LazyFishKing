import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import GameTsCfg from '../data/client/GameTsCfg';
import { Utils } from '../Utils';
import { mediator } from '../Mediator/mediator';
const { ccclass, property } = _decorator;

@ccclass('BattleField')
export class BattleField extends Component {
    @property(Node)
    public MyFishes: Node[] = [];//我方螃蟹的站位节点数组

    @property(Node)
    public EnemyFishes: Node[] = [];//敌方鱼的站位节点数组

    private _LeftFishes: mediator[] = [];
    public get LeftFishes(): mediator[] {
        return this._LeftFishes;
    }
    public set LeftFishes(value: mediator[]) {
        this._LeftFishes = value;
    }

    private _RightFished: mediator[] = [];
    public get RightFished(): mediator[] {
        return this._RightFished;
    }
    public set RightFished(value: mediator[]) {
        this._RightFished = value;
    }


    private _CurrentStage: number = 1;
    /**
     * 当前关卡
     */
    public get currentStage() {
        return this._CurrentStage;
    }
    public set currentStage(value: number) {
        this._CurrentStage = value;
    }

    start() {

        this.fetch_MyFishes();
        this.initEnemyFishes();
        this.battleLoop([...this.LeftFishes, ...this.RightFished])
    }

    /**Http   从服务器获取我方鱼的数据  */
    private fetch_MyFishes() {
        const crabUrl = GameTsCfg.Actor[1].prefab;//从配置表读取螃蟹预制体在 resources 下的路径
        for (let i = 0; i < this.MyFishes.length; i++) {//遍历所有我方站位；i 从 0 到 length-1，i 达到 length 时循环结束
            resources.load(crabUrl, Prefab, (erro, prefab) => {//从 resources 资源包异步加载预制体，加载完成后执行回调
                if (prefab) {//如果加载成功，prefab 不为空
                    let crabNode = instantiate(prefab);//根据预制体创建一个新的螃蟹节点
                    this.node.addChild(crabNode);//把新螃蟹挂到 BattleField 节点下，成为它的子节点
                    const mediators = crabNode.getComponent(mediator);//从新敌人节点上，找到它的 mediator 组件
                    this.LeftFishes.push(mediators);
                    crabNode.setPosition(this.MyFishes[i].position);//把新螃蟹放到第 i 个站位节点的位置（局部坐标）
                }
            });

        }
    }

    /**根据配置表初始化敌方鱼的数据 */
    private initEnemyFishes() {
        const Stages = GameTsCfg.Stage;//读取关卡配置表
        if (Stages[this.currentStage]) {//如果当前关卡在配置表里存在，就进入下面的代码
            const Stage = Stages[this.currentStage];//把当前这一关的具体配置取出来，存到 Stage 里。
            const fisheIds = Utils.parseString(Stage.fisheActor);//把这一关的敌人 ID 字符串，解析成数组
            for (let i = 0; i < fisheIds.length; i++) {//遍历敌人列表，一个接一个地处理
                const id = fisheIds[i];//取出当前这个敌人的类型 ID。
                const fishURL = GameTsCfg.Actor[id].prefab;//根据敌人 ID，去角色配置表里找它对应的预制体路径
                resources.load(fishURL, Prefab, (error, prefab) => {//从 resources 资源包里异步加载这个预制体。
                    if (prefab) {//如果加载成功了
                        let fishNode = instantiate(prefab);//根据预制体，创建一个新的敌人节点。
                        this.node.addChild(fishNode);//把这个新敌人挂到 BattleField 节点下面
                        fishNode.setPosition(this.EnemyFishes[i].position);//把新敌人放到第 i 个敌方站位节点的位置
                        const mediators = fishNode.getComponent(mediator);//从新敌人节点上，找到它的 mediator 组件
                        this.RightFished.push(mediators);
                        mediators.isReverse = -1;//让这个敌人转身，面朝左边。
                    }
                })
            }
        }

    }

    update(deltaTime: number) {

    }

    /**只把还活着的人留下 */
    private getAliveActors(targets: mediator[]) {//传入一组角色，返回还活着的角色

        return targets.filter(target => target.isLive == true);//把数组里的元素一个个检查，只留下活的，组成一个新数组。
    }

    /**按速度排队，速度最快的先出手 */
    private getNextActionActor(targets: mediator[]) {
        let aliveActor = this.getAliveActors(targets);//取出还存活的对象
        const sortedActors = aliveActor.sort((a, b) => {//按照速度排序，速度大的排在前面。
            return b.actor.speed - a.actor.speed;
        })
        if (sortedActors) {
            return sortedActors[0];//返回排序后的第一个角色，也就是速度最快的那个。
        }
    }

    /**判断左右阵营 */
    private isActorFromLeft(target: mediator): boolean {
        this.LeftFishes.forEach(element => {//遍历我方角色数组
            if (element.actor.uuid == target.actor.uuid) {
                return true;//如果当前这个角色的 uuid 和目标的 uuid 一样，就返回 true
            } 
        });
         return false;//否则就是flase
    }

    /**判断能不能放技能 */
    private isCanSkill(): boolean {
        //todo
        return true
    }

    /**战斗循环 */
    private battleLoop(targets: mediator[]) {
        let attacker = this.getNextActionActor(targets);//选出下一个出手的人。
        const isLeft = this.isActorFromLeft(attacker);//判断这个人是左边还是右边。
        if (this.isCanSkill()) {//判断能不能放技能

        } else {
            const attackType = attacker.actor.cfg.attackType;//如果不能放技能，就读取普通攻击类型。
        }
    }
}

