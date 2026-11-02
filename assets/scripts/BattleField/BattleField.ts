import { _decorator, Component, instantiate, Node, Prefab, resources, Vec3 } from 'cc';
import GameTsCfg from '../data/client/GameTsCfg';
import { Utils } from '../Utils';
import { mediator } from '../Mediator/mediator';
import { AttackType } from '../Actor/Actor';
import { AttackCommand, CommandQueue, MoveCommand } from '../Command/Command';
import { Constants } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('BattleField')
export class BattleField extends Component {
    @property(Node)
    public MyFishes: Node[] = [];//我方螃蟹的站位节点数组

    @property(Node)
    public EnemyFishes: Node[] = [];//敌方鱼的站位节点数组

    private _allPrefabCount:number = 1;//本局需要加载的预制体总数，用于判断是否全部加载完成
    private _prefabLodingCount:number = 0;//当前读取到的数量
    private _isBattleBegin:boolean = false;//战斗是否已经开始，用于防止 update 中重复启动战斗

    private _LeftFishes: mediator[] = [];
    public get LeftFishes(): mediator[] {
        return this._LeftFishes;
    }
    public set LeftFishes(value: mediator[]) {
        this._LeftFishes = value;
    }

    private _RightFishes: mediator[] = [];
    public get RightFishes(): mediator[] {
        return this._RightFishes;
    }
    public set RightFishes(value: mediator[]) {
        this._RightFishes = value;
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
                    this._prefabLodingCount += 1;//每成功加载并实例化一个螃蟹，已加载数量就加1
                }
            });
        }
        this._allPrefabCount = this.MyFishes.length;//我方一共有 5 个螃蟹需要加载。
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
                        this.RightFishes.push(mediators);
                        mediators.isReverse = -1;//让这个敌人转身，面朝左边。
                        this._prefabLodingCount += 1;//已经加载完成的数量加1
                    }
                })
            }
            this._allPrefabCount += fisheIds.length;//把这一关敌人数量的总数，加到“总加载数量”里。
        }

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

    /**从存活的角色中，选出嘲讽值最高的角色作为防御方 */
    private getNextDefender(targets: mediator[]) {
        let aliveActor = this.getAliveActors(targets);//取出还存活的对象
        const sortedActors = aliveActor.sort((a, b) => {//按照嘲讽值排序，嘲讽值大的排在前面优先被攻击。
            return b.actor.taunt - a.actor.taunt;
        })
        if (sortedActors) {
            return sortedActors[0];//返回排序后的第一个角色，也就是嘲讽值最大的那个。
        }
    }

    /**判断左右阵营 */
    private isActorFromLeft(target: mediator): boolean {
        return this.LeftFishes.some(element =>element.actor.uuid === target.actor.uuid);
        //遍历数组，只要有一个元素满足条件，就返回 true；如果全部都不满足，就返回 false。
    }

    /**判断能不能放技能 */
    private isCanSkill(): boolean {
        //todo
        return false;
    }

    /**战斗循环 */
    private battleLoop(targets: mediator[]) {
        //寻找攻击方和防御方
        let attacker = this.getNextActionActor(targets);//选出下一个出手的人。
        if(!attacker){//如果没有可选的攻击方就不执行下面逻辑
            return;
        }
        let defender:mediator;//先声明一个变量，用来保存防御方
        const isAttackerLeft = this.isActorFromLeft(attacker);//判断这个人是左边还是右边。
    
        if (isAttackerLeft) {
            defender = this.getNextDefender(this.RightFishes);//如果攻击方在左边，就从右边阵营选防御方；
        } else {
            defender = this.getNextDefender(this.LeftFishes);//如果攻击方在右边，就从左边阵营选防御方；
        }

        if(!defender){//如果没有可选的防御方就不执行下面逻辑
            return;
        }

        let commandQueue = new CommandQueue();//创建一个命令队列，用来按顺序执行移动、攻击、移动回来等动作。

        if (this.isCanSkill()) {//判断能不能放技能

        } else {
            let attackType = attacker.actor.cfg.attackType;//如果不能放技能，就读取普通攻击类型。
            if (attackType == AttackType.Healing) {//如果是治疗


            } else if (attackType == AttackType.MeleeAttack) {//如果是近战攻击，就走近敌人再攻击
                const movePos = new Vec3(defender.node.worldPosition.x + defender.crabWidth() * defender.isReverse, defender.node.worldPosition.y, defender.node.worldPosition.z);//计算近战攻击者要走到防御方哪一侧。
                /**
                 * defender.node.worldPosition.x：防御方的 x 坐标
                    defender.crabWidth()：防御方的实际宽度
                    defender.isReverse：防御方的朝向 1：朝右， - 1：朝左
                 */
                const move = new MoveCommand(attacker, movePos, Constants.MoveDuration);//创建"移动命令"：让攻击方用 MoveDuration 秒走到 movePos。
                const atk = new AttackCommand(attacker, defender);//创建"攻击命令"：让攻击方攻击防御方。
                const moveBack = new MoveCommand(attacker, attacker.node.worldPosition.clone(), Constants.MoveDuration);//创建"返回命令"：让攻击方回到原来的位置。
                commandQueue.addcommand(move);//走过去
                commandQueue.addcommand(atk);//攻击
                commandQueue.addcommand(moveBack);//走回来

            } else if (attackType == AttackType.Shooting) {//如果是远程


            }
            commandQueue.execute();//开始执行命令
        }
    }

    update(deltaTime: number) {
            if(this._prefabLodingCount == this._allPrefabCount && (this._isBattleBegin == false)){//已经加载完成的数量，是不是等于总数量？
            //如果7个角色没加载完，条件不成立，继续等，全部加载完成，条件成立，而且战斗还没开始，就启动战斗；
            this._isBattleBegin = true;//把战斗标记为"已经开始"
            this.battleLoop([...this.LeftFishes, ...this.RightFishes]);//把左边和右边的角色合并成一个数组，传给战斗逻辑。
        }
    }
}

