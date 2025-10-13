declare class SGuideStepDataRaw {
    /** */
    public stepId:number;
    /**步骤类型 */
    public type:number;
    /**对话类型参数 */
    public msgkey:string;
    /**主引导控件节点链 */
    public path:any;
    /**选择对象偏移值 */
    public offset:any[];
    /**动画偏移值 */
    public aniOffset:any[];
    /**动画旋转值 */
    public aniRotate:any;
    /**动画类型 */
    public aniType:any;
    /**对话框位置 */
    public talkPos:any[];
    /**拖拽参数 */
    public drags:any[];
    /**列表索引 */
    public listIndex:any;
    /**引导延时 */
    public time:any;
    /**是否固定位置(只在拖拽時使用) */
    public fixed:number;
}