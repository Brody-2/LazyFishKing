/**工具箱 */
export class Utils {

    /**
     * 把用逗号隔开的字符串，拆成一个数组。如果数组里全是数字
     * 就把它们转成真正的数字；
     * 只要有一个不是数字，就保持原来的字符串。
     */

    /*
     * - static：静态方法，可以直接用 Utils.parseString(...) 调用，不需要 new Utils()
        - parseString：方法名，意思是"解析字符串"
        - input: string：传入的参数必须是字符串
        - : (number | string)[]：返回一个数组，数组里的每一项要么是数字，要么是字符串
        number | string 里那个 | 可以读成"或"：
     */
    static parseString(input: string): (number | string)[] {
        const parts = input.split(",");//用逗号把字符串切开，变成一个数组。
        const isNumberArray = parts.every(part => !isNaN(Number(part)));//every：数组里每一个元素都满足条件，才返回 true。只要有一个不满足，就返回 false。
        //检查 parts 里的每一段，是不是都能转成有效数字
        if (isNumberArray) {
            return parts.map(part => (Number(part)));//map：把数组里的每一个元素，按照规则转换一遍，得到一个新数组
            //如果每一段都是数字，就把它们全部转换成真正的数字，然后返回。
        } else {
            return parts;//如果里面有不属于数字的内容，就保持原来的字符串数组，不转换
        }
    }
}

