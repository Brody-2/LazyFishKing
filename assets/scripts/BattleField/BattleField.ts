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
        const crabUrl = GameTsCfg.Actor[1].prefab;//从配置表读取螃蟹预制体在 resources 下的路径
        for (let i = 0; i < this.MyFishes.length; i++) {//遍历所有我方站位；i 从 0 到 length-1，i 达到 length 时循环结束
            resources.load(crabUrl, Prefab, (erro, prefab) => {//从 resources 资源包异步加载预制体，加载完成后执行回调
                if (prefab) {//如果加载成功，prefab 不为空
                    let crabNode = instantiate(prefab);//根据预制体创建一个新的螃蟹节点
                    this.node.addChild(crabNode);//把新螃蟹挂到 BattleField 节点下，成为它的子节点
                    crabNode.setPosition(this.MyFishes[i].position);//把新螃蟹放到第 i 个站位节点的位置（局部坐标）
                }
            });

        }
        this.fetch_MyFishes();
        this.initEnemyFishes();
    }

    /**Http   从服务器获取我方鱼的数据  */
    private fetch_MyFishes() {

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
                        mediators.isReverse = -1;//让这个敌人转身，面朝左边。
                    }
                })
            }
        }

    }

    update(deltaTime: number) {

    }
}

