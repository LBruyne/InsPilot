import {LeftCircleOutlined, LeftOutlined, RightCircleOutlined, RightOutlined} from "@ant-design/icons/lib/icons";
import {EllipseIcon} from "../../../../public/icons";
import {alertDisplayTime, AlertSetting, CreativeMessageSetting, CreativeType, Stage} from "@/app/paint/config";
import {Alert} from "antd";
import {CreativeDisplay} from "@/app/paint/(right-side)/display";
import classNames from "classnames";
import React, {useEffect, useRef, useState} from "react";
import {isReady} from "@/app/paint/page";
import {DesignCreativeType, NEXT_CREATIVE, NEXT_CREATIVE_ITEM, usePaintContext} from "@/app/paint/provider";

export type RightSideProps = {
    rightSideRef: React.MutableRefObject<any>,
    lastActionTimestamp: number,
    setLastActionTimestamp: React.Dispatch<React.SetStateAction<number>>
}

export const RightSide = (props: RightSideProps) => {
    const {state: paintContext, dispatch} = usePaintContext()
    const {designSchemes, currentStage, designCreatives, selectedSchemes} = paintContext;
    const {rightSideRef: ref, lastActionTimestamp, setLastActionTimestamp} = props

    const [showRightAlert, setShowRightAlert] = useState(true);
    const [rightAlertMessage, setRightAlertMessage] = useState(AlertSetting.CreativeStimulus.message);
    const [creativeThumbnails, setCreativeThumbnails] = useState<number[]>([]);
    const [currentCreativeThumbnailIndex, setCurrentCreativeThumbnailIndex] = useState<number | undefined>();
    // 控制显示下一个刺激的逻辑
    const noActionTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 创意刺激相关功能
    // 输入设计任务并点击“完成”后即开始生成
    // useEffect(() => {
    //     if (designTask && designTask.length > 0) {
    //         // TODO 生成该阶段刺激
    //     }
    // }, [designTask])
    // 刺激数量不足时，进行补充
    // useEffect(() => {
    //     // const left = designCreatives.filter(
    //     //     (creative) => creative.stage === currentStage && !creative.displayed
    //     // ).length;
    //     // if (left <= creativeLessLimit) {
    //     //     // TODO 生成该阶段刺激
    //     // }
    // }, [currentCreativeIndex])

    function findNextCreative(creativeType: CreativeType): {
        nextIndex: number,
        creative: DesignCreativeType
    } | null {
        for (let i = 0; i < designCreatives.length; i++) {
            const creative = designCreatives[i];
            if (creative.type === creativeType && !creative.displayed) {
                return {nextIndex: i, creative};  // 返回找到的项
            }
        }
        return null;  // 如果没有找到匹配项，返回null
    }

    const handleNextCreative = (creativeType: CreativeType) => {
        // 找到下一个符合要求的刺激
        const nextCreative = findNextCreative(creativeType)
        if (nextCreative !== null) {
            dispatch({
                type: NEXT_CREATIVE,
                payload: {
                    nextIndex: nextCreative.nextIndex
                }
            })
            setCreativeThumbnails((preThumbnails) => [...preThumbnails, nextCreative.nextIndex])
            setCurrentCreativeThumbnailIndex(creativeThumbnails.length)
        }
        // 重置上一次动作发生时间为现在
        clearInterval(noActionTimerRef.current!)
        setLastActionTimestamp(Date.now());
    };
    // 根据未操作时间来判断是否需要下一个提示
    // FIXME：完全按照PRD设定相应逻辑，如果PRD发生修改，这里需要相应修改
    useEffect(() => {
        const checkInactivity = () => {
            const checkCurrentCreativeFinished = () => {
                const currentCreative = designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]];
                // 如果当前刺激的 displayIndex 是最后一个，则说明当前刺激已经全部播放完，应该切换到下一个
                return !currentCreative || (currentCreative && currentCreative.displayIndex === currentCreative.items.length - 1)
            }

            if (!checkCurrentCreativeFinished()) {
                return;
            }
            // 当前刺激已经播放完
            const duration = Date.now() - lastActionTimestamp;
            const schemeNumber = designSchemes[currentStage]?.length as number
            console.log(duration)
            // 根据当前的时间差，判断是否满足下一刺激出现的条件；根据当前的阶段和条件，寻找和切换到显示下一个刺激
            if (currentStage === Stage.RapidDivergence) {
                if (schemeNumber < 8) {
                    if ((schemeNumber === 1 && duration > 25000)
                        || (schemeNumber > 1 && duration > 15000)) {
                        // 只有一个方案且25秒无操作，或者 多于一个方案且15秒无操作
                        handleNextCreative(CreativeType.RapidAbstract);
                    }
                }
                // else {
                //     if (schemeNumber === 1 && duration > 15000) {
                //         // 15秒无操作
                //         handleNextCreative(CreativeType.RapidConcrete);
                //     }
                // }
            } else if (currentStage === Stage.DeepDivergence) {
                if ((schemeNumber === 1 && duration > 20000)
                    || (schemeNumber > 1 && duration > 12000)) {
                    // 无方案 & 20秒无操作 或者 有方案 & 12秒无操作
                    handleNextCreative(CreativeType.Deep)
                }
            } else if (currentStage === Stage.Unable) {
                if (selectedSchemes.length === 0 && duration > 30000) {
                    // 未选择方案 & 30秒无操作
                    handleNextCreative(CreativeType.ConvergenceGroupOne);
                }
            } else if (currentStage === Stage.Convergence) {
                if (selectedSchemes.length > 0 && duration > 12000) {
                    // 已选择方案 & 12秒无操作
                    handleNextCreative(CreativeType.ConvergenceGroupTwo)
                }
            }
        };

        if (isReady(currentStage)) {
            noActionTimerRef.current = setInterval(checkInactivity, 1000);  // 每秒检查一次
            return () => clearInterval(noActionTimerRef.current!);
        }
    }, [lastActionTimestamp]);
    const canClickNextCreative = () => {
        // 如当前为收敛阶段且未选择方案，则下一张不可点击
        return !(currentStage == Stage.Convergence && selectedSchemes.length === 0)
    }
    const canClickLastCreative = () => {
        // 如当前无创意刺激 或当前创意刺激为第一张，则该按钮置灰无法点击
        return !(creativeThumbnails.length === 0 || currentCreativeThumbnailIndex === 0)
    }
    const onClickNextCreative = () => {
        const currentCreative = designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]];
        // 当前刺激是否播放完
        if (currentCreative && currentCreative.displayIndex < currentCreative.items.length - 1) {
            // 未播放完，播放下一个刺激小项
            dispatch({
                type: NEXT_CREATIVE_ITEM,
                payload: {
                    creativeIndex: creativeThumbnails[currentCreativeThumbnailIndex as number]
                }
            })

            // 重置上一次动作发生时间为现在
            clearInterval(noActionTimerRef.current!)
            setLastActionTimestamp(Date.now());
            return;
        }

        // 已播放完，切换到下一个刺激。
        // 当前是否为展示出的最后一个刺激
        if (currentCreativeThumbnailIndex !== undefined && currentCreativeThumbnailIndex !== creativeThumbnails.length - 1) {
            // 不为最后一个刺激，切换到下一个缩略图
            setCurrentCreativeThumbnailIndex(currentCreativeThumbnailIndex + 1);
        } else {
            // 为最后一个刺激，寻找新的符合条件的刺激
            // FIXME：完全按照PRD设定相应逻辑，如果PRD发生修改，这里需要相应修改
            if (currentStage === Stage.RapidDivergence) {
                // @ts-ignore
                if (designSchemes[Stage.RapidDivergence]?.length < 8) {
                    handleNextCreative(CreativeType.RapidAbstract);
                }
                // else if (designSchemes[Stage.RapidDivergence]?.length >= 8) {
                //     handleNextCreative(CreativeType.RapidConcrete);
                // }
            } else if (currentStage === Stage.DeepDivergence) {
                handleNextCreative(CreativeType.Deep);
            } else if (currentStage === Stage.Unable) {
                if (selectedSchemes.length === 0) {
                    handleNextCreative(CreativeType.ConvergenceGroupOne);
                }
            } else if (currentStage === Stage.Convergence) {
                if (selectedSchemes.length > 0) {
                    handleNextCreative(CreativeType.ConvergenceGroupTwo);
                }
            }
        }
    }
    const onClickLastCreative = () => {
        // 因为已经在判断是否可以点击的时候检查过是否为第一个，所以不会出现越界
        setCurrentCreativeThumbnailIndex(currentCreativeThumbnailIndex as number - 1)
    }

    // 处理右侧点击事件
    const handleClickRightSide = () => {
        // 处理Alert出现和消失
        setShowRightAlert(false);
        // 重置上一次动作发生时间为现在
        setLastActionTimestamp(Date.now());
    }

    // 更新右侧的提示语
    useEffect(() => {
        if (isReady(currentStage)) {
            setShowRightAlert(true);

            const timer = setTimeout(() => {
                setShowRightAlert(false);
            }, alertDisplayTime); // 30秒后自动隐藏

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isReady(currentStage), rightAlertMessage, currentCreativeThumbnailIndex]);
    useEffect(() => {
        if (currentCreativeThumbnailIndex !== undefined) {
            const currentCreative = designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]];
            const message = CreativeMessageSetting[currentCreative.type];
            if (currentCreative.type === CreativeType.ConvergenceGroupOne) {
                if (typeof (message) === "function") {
                    setRightAlertMessage(message(selectedSchemes.length))
                } else {
                    setRightAlertMessage(message)
                }
            } else {
                if (typeof (message) === "function") {
                    setRightAlertMessage(message(currentCreative.relatedScheme))
                } else {
                    setRightAlertMessage(message)
                }
            }
        }
    }, [currentCreativeThumbnailIndex])

    return (
        <div ref={ref} className="flex-grow relative" onClick={handleClickRightSide}>
            <div
                className="absolute top-[16px] right-[20px] z-10 flex flex-col items-end justify-around"
            >
                <div className="flex items-center justify-around h-[42px] space-x-1 pl-2 pr-2"
                     style={{
                         borderRadius: "10px",
                         border: "1px solid #D9D9D9",
                         background: "#FFF",
                         boxShadow: "0px 3px 10px -6px rgba(0, 0, 0, 0.10)"
                     }}
                >
                    {/* Icons */}
                    <div className="w-[32px] h-[32px] flex items-center justify-center" onClick={() => {
                        if (isReady(currentStage) && canClickLastCreative()) {
                            onClickLastCreative()
                        }
                    }}>
                        <LeftCircleOutlined style={{
                            fontSize: '20px',
                            color: isReady(currentStage) && canClickLastCreative() ? "#000" : "#D9D9D9"
                        }}/>
                    </div>
                    <div className="w-[32px] h-[32px] flex items-center justify-center" onClick={() => {
                        if (isReady(currentStage) && canClickNextCreative()) {
                            onClickNextCreative()
                        }
                    }}>
                        <RightCircleOutlined style={{
                            fontSize: '20px',
                            color: isReady(currentStage) && canClickNextCreative() ? "#000" : "#D9D9D9"
                        }}/>
                    </div>
                </div>
                {
                    isReady(currentStage) &&
                    <div className="flex flex-row justify-center items-center space-x-2 mt-3">
                        {
                            currentCreativeThumbnailIndex !== undefined && designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]].displayed ? (
                                designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]].items.map((_, index) => (
                                    <EllipseIcon style={{
                                        width: '12px',
                                        height: "12px",
                                        fill: index <= designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]].displayIndex ? "#6001FF" : "#E2E2E2"
                                    }}/>
                                ))
                            ) : <></>
                        }
                    </div>
                }
            </div>

            {
                currentStage !== Stage.NotReady && (
                    <>
                        <div className="absolute top-[16px] left-[20px] max-w-[65%] z-10">
                            {showRightAlert && (
                                <div className="alert-animation">
                                    <Alert
                                        type="info"
                                        message={rightAlertMessage}
                                        showIcon={true}
                                        icon={AlertSetting.CreativeStimulus.icon}
                                        style={{
                                            borderRadius: "10px",
                                            border: "1px solid #D9D9D9",
                                            background: "#FFF",
                                            boxShadow: "0px 3px 10px -6px rgba(0, 0, 0, 0.10)",
                                            minHeight: "42px"
                                        }}
                                        className="tip-text"
                                    />
                                </div>
                            )}
                        </div>

                        {
                            isReady(currentStage) && (
                                <div
                                    className="flex flex-1 flex-col items-center absolute top-[10%] bottom-[12%] w-full pl-[20px] pr-[20px]"
                                >
                                    <CreativeDisplay
                                        creative={designCreatives[creativeThumbnails[currentCreativeThumbnailIndex as number]]}/>
                                </div>
                            )
                        }

                        <div
                            className="absolute bottom-[16px] left-[20px] right-[20px] flex items-center justify-between">
                            <LeftOutlined style={{fontSize: '18px', color: "#D8D8D8"}}/>

                            <div className="flex flex-1 justify-start items-center w-[80%] ml-1 mr-1">
                                <div
                                    className="flex overflow-x-auto overflow-y-hidden justify-start items-center space-x-2 mr-2"
                                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                                >
                                    {
                                        creativeThumbnails.filter((thumbnail) => designCreatives[thumbnail].displayed)
                                            .map((_, index) => (
                                                <div
                                                    className={classNames("relative flex-shrink-0 bg-white border-[1.5px] w-[40px] h-[40px] rounded-md",
                                                        {"border-[#6001FF]": index === currentCreativeThumbnailIndex})
                                                    }
                                                    onClick={() => setCurrentCreativeThumbnailIndex(index)}
                                                >
                                                    <div
                                                        className="w-full h-full overflow-hidden flex items-center justify-center rounded-md"
                                                        style={{
                                                            fontSize: "16px",
                                                            color: index === currentCreativeThumbnailIndex ? "#6001FF" : "#D8D8D8"
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))
                                    }
                                </div>
                            </div>

                            <RightOutlined style={{fontSize: '18px', color: "#D8D8D8"}}/>
                        </div>
                    </>
                )
            }
        </div>

    )
}