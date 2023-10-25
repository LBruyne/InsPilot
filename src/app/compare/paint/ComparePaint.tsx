"use client";

import React, {ReactNode, useEffect, useRef, useState} from "react";
import {Button, Input, Select} from 'antd';
import classNames from "classnames";
import {
    ADD_CREATIVES,
    ADD_SCHEME, LOAD_STATE,
    SWITCH_STAGE,
    UPDATE_CURRENT_SCHEME,
    UPDATE_DESIGN_TASK, UPDATE_SCHEMES_NAME,
    UPDATE_SELECTED_SCHEMES, UPDATE_USER_NAME,
    usePaintContext
} from "@/app/compare/paint/provider";
import "./page.css"
import {
    convergenceMinimizeSchemeNumber,
    Stage
} from "@/app/compare/paint/config";
import {LeftSide, LeftSideHandler} from "./(left-side)";
import NavBar from "@/components/NavBar";
import {start} from "@/services/paint";

const {TextArea} = Input;

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

export default function ComparePaint() {
    // 获取全局状态数据　
    const {state: paintContext, dispatch} = usePaintContext()
    const {username, currentStage, designTask, designSchemes, designCreatives, selectedSchemes} = paintContext;
    // 页面用到的内容 / 辅助变量
    const [currentUsername, setCurrentUsername] = useState(username);
    const [currentDesignTaskInput, setCurrentDesignTaskInput] = useState(designTask);
    const leftSideRef = useRef(null);
    const leftSideContainerRef = useRef<LeftSideHandler | null>(null);
    const [showLeftAlert, setShowLeftAlert] = useState(true);
    const [showConfirmToConvergenceAlert, setShowConfirmToConvergenceAlert] = useState(false);
    const [showSelect, setShowSelect] = useState<boolean>(false);
    const [recommendedSchemes, setRecommendedSchemes] = useState<string[]>([])
    const totalSchemes = () => {
        // 返回前两个阶段一共方案数量
        // @ts-ignore
        return designSchemes[Stage.RapidDivergence]?.length as number + designSchemes[Stage.DeepDivergence]?.length as number;
    }

    // 切换当前阶段
    const switchStage = async (toStage: Stage) => {
        // 如果当前在画画，保存当前进度
        if (isDrawing(currentStage)) {
            if (leftSideContainerRef.current) {
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
                if(selectedSchemes.length === 0) {
                    // 否则将选择方案，无法绘画
                    setShowSelect(true)
                    dispatch({
                        type: SWITCH_STAGE,
                        payload: {
                            stage: Stage.Unable
                        }
                    })
                } else {
                    setShowSelect(true)
                    dispatch({
                        type: SWITCH_STAGE,
                        payload: {
                            stage: Stage.Convergence
                        }
                    })
                }
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
        }
    }, [currentStage]);
    // 更新收敛阶段中被选择的方案
    const updateSelectedSchemes = async (schemes: number[]) => {
        const preSchemes = selectedSchemes
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

    // 用户信息填写
    const handleClickInputUsernameButton = async () => {
        if (currentUsername && currentUsername.length > 0) {
            // 改变设计任务
            dispatch({
                type: UPDATE_USER_NAME,
                payload: {
                    username: currentUsername
                }
            })
            // 获取用户信息
            const userInfo = await start({username: currentUsername})
            // 更新操作信息
            if(userInfo) {
                dispatch({
                    type: LOAD_STATE,
                    payload: {
                        username: currentUsername,
                        data: userInfo
                    }
                })
            }
        }
    };
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
    useEffect(() => {
        if(designTask && designTask.length) {
            switchStage(Stage.RapidDivergence)
        }
    }, [designTask]);

    return (
        <div className="flex flex-col w-[100%] md:flex-row mt-[2%] mb-[2%] mr-[2%] bg-white">
            {/* Left Navigation */}
            <div className="md:w-[15%] md:mr-[0.75%] border-r border-ebecf2 rounded-r-lg shadow-custom">
                <NavBar />
                <div className="p-[12px]">
                    <span className='sub-title mb-[12px]'>用户信息（管理员输入）</span>
                    {!username?.length ? (
                        <>
                            <TextArea
                                className="rounded-md border border-[#F3F4F8] text-2 w-[100%]"
                                value={currentUsername}
                                onChange={(e) => setCurrentUsername(e.target.value)}
                                placeholder="请输入用户信息"
                                bordered={false}
                                style={{height: "28px", resize: 'none', backgroundColor: "#F4F5F8"}}
                            />
                            <Button
                                style={{
                                    borderRadius: '6px',
                                    border: '1px solid #6001FF',
                                    background: '#FFF',
                                    color: '#6001FF'
                                }}
                                size={"small"}
                                onClick={handleClickInputUsernameButton}
                                className="w-[100%] text-2 mt-2 mb-[48px]"
                            >
                                确认
                            </Button>
                        </>
                    ) : (
                        <div className="text-2 text-[#8F949B] mt-[12px] mb-[48px]">
                            {username}
                        </div>
                    )}
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
                                className="w-[100%] text-2 mt-2"
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
                            {
                                recommendedSchemes && recommendedSchemes.length > 0 ? (
                                    <div className="my-[12px] text-[#8F949B] text-2 min-h-[90px] flex items-center" style={{whiteSpace: "pre-line"}}>
                                        以下是我为你选择的三个最具新颖性和实用性的方案：{"\n"}{recommendedSchemes.map(r => "·" + r + "\n")}
                                    </div>
                                ) : (
                                    <div className="my-[12px] text-[#8F949B] text-2 min-h-[90px] flex items-center">
                                        请稍等，我正在为你选择最具新颖性和实用性的方案...
                                    </div>
                                )
                            }
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
                                            label: `方案${idx + 1 + designSchemes[Stage.RapidDivergence]?.length!}：` + scheme.name,
                                            value: idx + designSchemes[Stage.RapidDivergence]?.length!,
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
                              showLeftAlert={showLeftAlert}
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
                </div>
            </div>
        </div>
    );

};

