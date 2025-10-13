declare class SSuitDataRaw {
    /**套装id */
    public id:number;
    /**套装名称 */
    public name:string;
    /**套装
组合该套装需要的装备和兵书，最少2件，最多5件 */
    public suit:number[];
    /**是谁的套装 */
    public hero:number[];
    /**满足2件 */
    public up2:number[];
    /**满足3件 */
    public up3:number[];
    /**满足4件 */
    public up4:number[];
    /**满足5件 */
    public up5:number[];
    /**全部满足后可额外加成的属性 */
    public allUp:number[];
    /**套装满装属性显示 */
    public txt:string;
}