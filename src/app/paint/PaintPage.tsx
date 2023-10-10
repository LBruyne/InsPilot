"use client";

import React, {ReactNode, useEffect, useRef, useState} from "react";
import {RouteConfig} from "@/constant/route-config";
import {Alert, Button, Input, Select} from 'antd';
import {
    InfoCircleFilled,
    LeftCircleOutlined,
    LeftOutlined,
    RightCircleOutlined,
    RightOutlined,
    WarningFilled
} from "@ant-design/icons/lib/icons";
import {EllipseIcon} from "@/../public/icons";
import classNames from "classnames";
import {
    ADD_SCHEME,
    DesignCreativeType,
    NEXT_CREATIVE_ITEM,
    SWITCH_STAGE, UPDATE_CURRENT_SCHEME,
    UPDATE_DESIGN_TASK,
    UPDATE_SELECTED_SCHEMES,
    usePaintContext
} from "@/app/paint/provider";
import "./page.css"
import {
    alertDisplayTime, convergenceMinimizeSchemeNumber,
    CreativeMessageSetting,
    CreativeType,
    Stage
} from "@/app/paint/config";
import {CreativeDisplay} from "@/app/paint/(right-side)/display";
import {LeftSide, LeftSideHandler} from "./(left-side)";
import {RightSide} from "@/app/paint/(right-side)";

const {TextArea} = Input;

export const AlertSetting = {
    [Stage.NotReady]: {
        icon: <WarningFilled style={{color: "#FCC400"}}/>,
        message: "请先在左侧输入设计任务，并点击“完成”！",
    },
    [Stage.RapidDivergence]: {
        icon: <InfoCircleFilled style={{color: '#6001FF'}}/>,
        message: `你的设计任务正处于「${Stage.RapidDivergence}阶段」，现在就开始构思设计方案吧！`
    },
    [Stage.DeepDivergence]: {
        icon: <InfoCircleFilled style={{color: '#6001FF'}}/>,
        message: `你的设计任务正处于「${Stage.DeepDivergence}阶段」，现在就开始构思设计方案吧！`
    },
    [Stage.Convergence]: {
        icon: <InfoCircleFilled style={{color: '#6001FF'}}/>,
        message: `你的设计任务正处于「${Stage.Convergence}阶段」，现在就开始构思设计方案吧！`
    },
    TooFewSchemes: {
        icon: <InfoCircleFilled style={{color: '#6001FF'}}/>,
        message: "您的方案数量较少，确定要进入收敛阶段吗？",
    },
    CreativeStimulus: {
        icon: <InfoCircleFilled style={{color: '#6001FF'}}/>,
        message: "这里是创意刺激区域，如果没有灵感，我们会为你提供帮助！"
    },
}

interface HeaderProps {
    children: ReactNode;
}

const Header: React.FC<HeaderProps> = ({children}) => {
    return (
        <div className="relative flex items-center h-[50px] justify-between border-b border-[#F3F4F8]">
            {children}
        </div>
    )
};

// 重要的控制判断函数
export function isReady(stage: Stage) {
    return (stage !== Stage.NotReady);
}

export function isAble(stage: Stage) {
    return (stage !== Stage.Unable);
}

export function notFinish(stage: Stage) {
    return (stage !== Stage.Finish);
}

export function isDrawing(stage: Stage) {
    return isReady(stage) && isAble(stage) && notFinish(stage);
}

export default function PaintPage() {
    const [selectedPage, setSelectedPage] = useState(RouteConfig[0].name);
    const [selectedIcon, setSelectedIcon] = useState(RouteConfig[0].icon);
    // const routeOptions = RouteConfig.map(route => ({
    //     value: route.path,
    //     label: route.name
    // }));

    // 获取全局状态数据　
    const {state: paintContext, dispatch} = usePaintContext()
    const {currentStage, designTask, designSchemes, designCreatives, selectedSchemes} = paintContext;
    // 页面用到的内容 / 辅助变量
    const [currentDesignTaskInput, setCurrentDesignTaskInput] = useState(designTask);
    const leftSideRef = useRef(null);
    const leftSideContainerRef = useRef<LeftSideHandler | null>(null);
    const rightSideRef = useRef(null);
    const [lastActionTimestamp, setLastActionTimestamp] = useState<number>(Date.now);
    const [showLeftAlert, setShowLeftAlert] = useState(true);
    const [showConfirmToConvergenceAlert, setShowConfirmToConvergenceAlert] = useState(false);
    const [showSelect, setShowSelect] = useState<boolean>(false);
    const totalSchemes = () => {
        // 返回前两个阶段一共方案数量
        // @ts-ignore
        return designSchemes[Stage.RapidDivergence]?.length as number + designSchemes[Stage.DeepDivergence]?.length as number;
    }

    // 初始化
    useEffect(() => {

    }, []);

    // 切换当前阶段
    const switchStage = async (toStage: Stage) => {
        // 如果当前在画画，保存当前进度
        if (isDrawing(currentStage)) {
            if(leftSideContainerRef.current) {
                await leftSideContainerRef.current?.saveImage()
            }
        }
        // 如果切换到前两个阶段，直接切换
        if (toStage === Stage.RapidDivergence || toStage === Stage.DeepDivergence) {
            dispatch({
                type: SWITCH_STAGE,
                payload: {
                    stage: toStage
                }
            })
            setShowSelect(false)
            setShowConfirmToConvergenceAlert(false)
        }
        // 如果切换到收敛阶段，需要进行判断
        else if (toStage === Stage.Convergence) {
            if (totalSchemes() === 0) {
                // 不可能发生
            }
            if (totalSchemes() === 1) {
                // 若方案数=1，则默认选中该方案：即快速收敛的的第一个方案
                setShowSelect(true)
                updateSelectedSchemes([0])
                dispatch({
                    type: SWITCH_STAGE,
                    payload: {
                        stage: Stage.Convergence
                    }
                })
            } else {
                // 否则将选择方案，无法绘画
                setShowSelect(true)
                dispatch({
                    type: SWITCH_STAGE,
                    payload: {
                        stage: Stage.Unable
                    }
                })
            }
        }
    }
    // 切换阶段后
    useEffect(() => {
        if (isDrawing(currentStage)) {
            // 如果目标阶段方案数量为0（第一次切换到该阶段），加入一个方案
            if (designSchemes[currentStage]?.length === 0) {
                dispatch({
                    type: ADD_SCHEME,
                    payload: {
                        stage: currentStage
                    }
                })
            }
            dispatch({
                type: UPDATE_CURRENT_SCHEME,
                payload: {index: 0, stage: currentStage}
            })
            // 重置时间
            setLastActionTimestamp(Date.now());
        }
    }, [currentStage]);
    // 更新收敛阶段中被选择的方案
    const updateSelectedSchemes = (schemes: number[]) => {
        dispatch({
            type: UPDATE_SELECTED_SCHEMES,
            payload: {
                schemes: schemes
            }
        })

        if (schemes.length > 0) {
            // 如果当前有选择方案，自动切换到收敛状态
            dispatch({
                type: SWITCH_STAGE,
                payload: {
                    stage: Stage.Convergence
                }
            })
        } else {
            dispatch({
                type: SWITCH_STAGE,
                payload: {
                    stage: Stage.Unable
                }
            })
        }
    }

    // 设计目标填写
    const handleClickFinishInputButton = async () => {
        if (currentDesignTaskInput && currentDesignTaskInput.length > 0) {
            // 改变阶段
            await switchStage(Stage.RapidDivergence)
            // 改变设计任务
            dispatch({
                type: UPDATE_DESIGN_TASK,
                payload: {
                    designTask: currentDesignTaskInput
                }
            })
        }
    };

    return (
        <div className="flex flex-col w-[100%] md:flex-row mt-[2%] mb-[2%] mr-[2%] bg-white">
            {/* Left Navigation */}
            <div className="md:w-[15%] md:mr-[0.75%] border-r border-ebecf2 rounded-r-lg shadow-custom">
                <Header>
                    <div className="flex items-center jzustify-center space-x-2 pl-[12px]">
                        <span className="navi-title">{selectedPage}</span>
                    </div>
                </Header>
                <div className="p-[12px]">
                    <span className='sub-title mb-[12px]'>设计任务描述</span>
                    {(currentStage === Stage.NotReady && !designTask?.length) ? (
                        <>
                            <TextArea
                                className="rounded-md border border-[#F3F4F8] text-2 w-[100%]"
                                value={currentDesignTaskInput}
                                onChange={(e) => setCurrentDesignTaskInput(e.target.value)}
                                placeholder="请输入设计任务"
                                bordered={false}
                                style={{height: "120px", resize: 'none', backgroundColor: "#F4F5F8"}}
                            />
                            <Button
                                style={{
                                    borderRadius: '6px',
                                    border: '1px solid #6001FF',
                                    background: '#FFF',
                                    color: '#6001FF'
                                }}
                                onClick={handleClickFinishInputButton}
                                className="w-[100%] h-[28px] text-2 mt-2"
                            >
                                完成
                            </Button>
                        </>
                    ) : (
                        <div className="text-2 text-[#8F949B] mt-[12px] mb-[48px]">
                            {designTask}
                        </div>
                    )}

                    {(isReady(currentStage) && showSelect) && (
                        <>
                            <span className='sub-title mt-[12px]'>方案收敛</span>
                            <Select
                                className='my-multiple-select'
                                value={selectedSchemes}
                                placeholder="请选择方案"
                                mode="multiple"
                                allowClear
                                style={{width: "100%"}}
                                maxTagTextLength={7}
                                onChange={updateSelectedSchemes}
                                options={[
                                    {
                                        label: `${Stage.RapidDivergence}阶段`,
                                        options: designSchemes[Stage.RapidDivergence]?.map((scheme, idx) => ({
                                            label: `方案${idx + 1}：` + scheme.name,
                                            value: idx,
                                        }))
                                    },
                                    {
                                        label: `${Stage.DeepDivergence}阶段`,
                                        options: designSchemes[Stage.DeepDivergence]?.map((scheme, idx) => ({
                                            label: `方案${idx + 1 + designSchemes[Stage.RapidDivergence]?.length}：` + scheme.name,
                                            value: idx + designSchemes[Stage.RapidDivergence]?.length,
                                        }))
                                    },
                                ]}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col md:flex-row w-full md:ml-[0.75%]">
                {/* Drawing Canvas */}
                <div className="flex-1 flex flex-col border border-ebecf2 rounded-lg shadow-custom md:mr-[0.75%]">
                    <Header>
                        <div className="flex items-center justify-center pl-[22px]">
                            <span className={classNames("title", {
                                "text-grey": !isReady(currentStage)
                            })}>草图绘制</span>
                        </div>
                        {
                            isReady(currentStage) && (
                                <div className="absolute right-[20px] flex items-center justify-center">
                                    <button className="h-[32px] flex items-center justify-center tip-text p-4" style={{
                                        borderRadius: "10px",
                                        background: currentStage === Stage.RapidDivergence ? "#F3F4F8" : "#FFF"
                                    }} onClick={() => {
                                        isReady(currentStage) && switchStage(Stage.RapidDivergence)
                                    }}>{Stage.RapidDivergence}
                                    </button>
                                    <button className="h-[32px] flex items-center justify-center tip-text p-4" style={{
                                        borderRadius: "10px",
                                        background: currentStage === Stage.DeepDivergence ? "#F3F4F8" : "#FFF"
                                    }} onClick={() => {
                                        isReady(currentStage) && switchStage(Stage.DeepDivergence)
                                    }}>{Stage.DeepDivergence}
                                    </button>
                                    <button className="h-[32px] flex items-center justify-center tip-text p-4" style={{
                                        borderRadius: "10px",
                                        background: currentStage === Stage.Convergence ? "#F3F4F8" : "#FFF"
                                    }} onClick={() => {
                                        const enoughSchemeForConvergence = () => {
                                            return totalSchemes() <= convergenceMinimizeSchemeNumber
                                        }
                                        if (isReady(currentStage)) {
                                            if (enoughSchemeForConvergence()) {
                                                setShowConfirmToConvergenceAlert(true);
                                                setShowLeftAlert(false)
                                            } else {
                                                switchStage(Stage.Convergence)
                                            }
                                        }
                                    }}>{Stage.Convergence}
                                    </button>
                                </div>
                            )
                        }
                    </Header>

                    <LeftSide ref={leftSideContainerRef}
                              leftSideRef={leftSideRef}
                              setShowConfirmToConvergenceAlert={setShowConfirmToConvergenceAlert}
                              setShowLeftAlert={setShowLeftAlert}
                              showConfirmToConvergenceAlert={showConfirmToConvergenceAlert}
                              showLeftAlert={showLeftAlert} setLastActionTimestamp={setLastActionTimestamp}
                              switchToConvergenceStage={switchStage}/>
                </div>

                {/* Backend Output */}
                <div className="flex-1 flex flex-col border border-ebecf2 rounded-lg shadow-custom md:ml-[0.75%]">
                    <Header>
                        <div className="flex items-center justify-center pl-[22px]">
                            <span className={classNames("title", {
                                "text-grey": !isReady(currentStage)
                            })}>创意刺激</span>
                        </div>
                    </Header>

                    <RightSide rightSideRef={rightSideRef} setLastActionTimestamp={setLastActionTimestamp}
                               lastActionTimestamp={lastActionTimestamp}/>
                </div>
            </div>
        </div>
    );

};

