"use client";

import React, {
    createContext,
    Dispatch,
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";
import {isDrawing, isReady} from "@/app/paint/page";
import {alertDisplayTime, AlertSetting, eraseDefaultSize, Stage, strokeDefaultSize} from "@/app/paint/config";
import {
    ADD_SCHEME, DesignSchemeType,
    PaintAction,
    PaintState,
    SWITCH_STAGE,
    UPDATE_CURRENT_SCHEME, UPDATE_IMG,
    usePaintContext
} from "@/app/paint/provider";
import {ReactSketchCanvasRef, CanvasPath} from "react-sketch-canvas";
import {Alert, Button, Image, Space} from "antd";
import {LeftOutlined, PlusCircleOutlined, RightOutlined} from "@ant-design/icons/lib/icons";
import classNames from "classnames";
import {Canvas, ReactSketchCanvasProps} from "@/app/paint/(left-side)/canvas";
import {Toolbox} from "@/app/paint/(left-side)/tools";

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvasContext = (): CanvasContextType => {
    return useContext(CanvasContext) as CanvasContextType;
};

export type CanvasContextType = {
    canvasRef: React.MutableRefObject<ReactSketchCanvasRef | undefined>;
    canvasProps: Partial<ReactSketchCanvasProps>;
    setCanvasProps: React.Dispatch<React.SetStateAction<Partial<ReactSketchCanvasProps>>>;
    strokeSize: number;
    setStrokeSize: React.Dispatch<React.SetStateAction<number>>;
    eraseSize: number;
    setEraseSize: React.Dispatch<React.SetStateAction<number>>;
    selectedTool: Tools;
    setSelectedTool: React.Dispatch<React.SetStateAction<Tools>>;
};

export type LeftSideProps = {
    leftSideRef: React.MutableRefObject<any>,
    showLeftAlert: boolean,
    setShowLeftAlert: React.Dispatch<React.SetStateAction<boolean>>;
    showConfirmToConvergenceAlert: boolean,
    setShowConfirmToConvergenceAlert: React.Dispatch<React.SetStateAction<boolean>>;
    setLastActionTimestamp: React.Dispatch<React.SetStateAction<number>>;
    switchToConvergenceStage: (Convergence: Stage.Convergence) => {}
}

export interface LeftSideHandler {
    saveImage: () => Promise<void>;
}

export enum Tools {
    Unable, Pen, Text, Erase, Others,
}

export const LeftSide = forwardRef<LeftSideHandler, LeftSideProps>((props: LeftSideProps, ref) => {
    const {state: paintContext, dispatch} = usePaintContext()
    const {currentScheme, currentStage, designSchemes} = paintContext;
    let paths: CanvasPath[];
    if (currentScheme) {
        // @ts-ignore
        const scheme = designSchemes[currentScheme.stage][currentScheme.index] as DesignSchemeType;
        paths = scheme.paths
    }
    const {leftSideRef: leftSideRef, switchToConvergenceStage, showLeftAlert, setShowLeftAlert, showConfirmToConvergenceAlert, setShowConfirmToConvergenceAlert, setLastActionTimestamp} = props

    // 画布相关状态
    const [selectedTool, setSelectedTool] = useState(Tools.Pen)
    const canvasWrapperRef = useRef(null);
    const canvasRef = useRef<ReactSketchCanvasRef>();
    const [canvasProps, setCanvasProps] = React.useState<Partial<ReactSketchCanvasProps>>({
        strokeWidth: strokeDefaultSize,
        eraserWidth: eraseDefaultSize,
        strokeColor: '#000000',
        canvasColor: '#FFFFFF',
        allowOnlyPointerType: "all",
    });
    const [strokeSize, setStrokeSize] = useState(strokeDefaultSize);
    const [eraseSize, setEraseSize] = useState(eraseDefaultSize);

    // 根据用户对确认收敛Alert的选择，决定是否进入收敛状态
    const handleConfirmToConvergence = async () => {
        setShowConfirmToConvergenceAlert(false);
        switchToConvergenceStage(Stage.Convergence)
    }
    const handleCancelToConvergence = () => {
        setShowConfirmToConvergenceAlert(false)
    }
    useEffect(() => {
        if (isReady(currentStage)) {
            // 重新显示Alert并定时消失
            setShowLeftAlert(true);
            const timer = setTimeout(() => {
                setShowLeftAlert(false);
            }, alertDisplayTime); // 30秒后自动隐藏

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isReady(currentStage)]);

    // 处理左侧点击事件
    const handleClickLeftSide = () => {
        // 处理左侧Alert出现和消失
        setShowLeftAlert(false);
        // 重置上一次动作发生时间为现在
        setLastActionTimestamp(Date.now());
    }

    // 缩略图相关事件
    const saveImage = async () => {
        const exportImage = canvasRef.current?.exportImage;

        if (exportImage) {
            const imageData = await exportImage("png");
            dispatch({
                type: UPDATE_IMG,
                payload: {
                    stage: currentScheme?.stage,
                    schemeIndex: currentScheme?.index,
                    imageData
                }
            })
        }
    }
    // 将该方法暴露给父组件
    useImperativeHandle(ref, () => ({
        saveImage
    }));
    const switchCurrentScheme = async (stage: Stage, index: number) => {
        // 保存当前的方案
        await saveImage()
        // 切换上下文到当前方案
        dispatch({
            type: UPDATE_CURRENT_SCHEME,
            payload: {index, stage}
        })
    }
    // 切换当前画布
    // 根据当前阶段和当前方案更新方案的上下文
    useEffect(() => {
        // 清除画布
        canvasRef.current?.clearCanvas();
        // 更新画布和文本。只需要导入画布内容。
        if (paths) {
            canvasRef.current?.loadPaths(paths);
        }
    }, [currentStage, currentScheme])
    const handleClickAddSchemes = async (stage: Stage) => {
        // 必须为必须当前阶段
        if (stage === currentStage) {
            // 保存当前的方案
            await saveImage()
            // 计算新的索引
            const index = designSchemes[currentStage]?.length ?? 0;
            // 加入新的方案
            dispatch({
                type: ADD_SCHEME,
                payload: {
                    stage: stage
                }
            })
            // 切换上下文到最新方案
            dispatch({
                type: UPDATE_CURRENT_SCHEME,
                payload: {index, stage}
            })
        }
    }

    return (
        <CanvasContext.Provider
            value={{canvasRef, canvasProps, setCanvasProps, strokeSize, setStrokeSize, eraseSize, setEraseSize, selectedTool, setSelectedTool}}>
            <div className="flex-grow relative" ref={leftSideRef} onClick={handleClickLeftSide}>
                <div className="absolute top-[16px] left-[20px] max-w-[53%] z-10">
                    {showLeftAlert && (
                        <div className="alert-animation">
                            <Alert
                                type="info"
                                message={AlertSetting[currentStage as keyof typeof AlertSetting].message}
                                showIcon={true}
                                icon={AlertSetting[currentStage as keyof typeof AlertSetting].icon}
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

                <div className="absolute top-[16px] left-[20px] max-w-[53%] z-10">
                    {showConfirmToConvergenceAlert && (
                        <div className="alert-animation">
                            <Alert
                                type="info"
                                message={AlertSetting.TooFewSchemes.message}
                                showIcon={true}
                                icon={AlertSetting.TooFewSchemes.icon}
                                action={
                                    <Space direction="horizontal">
                                        <Button size="small"
                                                style={{borderColor: '#6001FF', borderWidth: '1px'}}
                                                onClick={handleConfirmToConvergence}>
                                            确认
                                        </Button>
                                        <Button size="small"
                                                style={{borderColor: '#6001FF', borderWidth: '1px'}}
                                                onClick={handleCancelToConvergence}>
                                            取消
                                        </Button>
                                    </Space>}
                                style={{
                                    width: '80%',
                                    borderRadius: "10px",
                                    border: "1px solid #D9D9D9",
                                    background: "#FFF",
                                    boxShadow: "0px 3px 10px -6px rgba(0, 0, 0, 0.10)",
                                    minHeight: "42px"
                                }}
                                className="tip-text flex flex-row"
                            />
                        </div>
                    )}
                </div>

                <div
                    className="max-w-[35%] absolute top-[0px] right-[0px] ">
                    <Toolbox/>
                </div>

                <div
                    className="absolute top-[20%] bottom-[12%] w-full"
                    ref={canvasWrapperRef}
                    style={{overflow: "hidden"}}
                >
                    {isDrawing(currentStage) && currentScheme && <Canvas wrapperRef={canvasWrapperRef}/>}
                </div>

                {currentStage !== Stage.NotReady && (
                    <div
                        className="absolute bottom-[16px] left-[20px] right-[20px] flex items-center justify-between">
                        <LeftOutlined style={{fontSize: '18px', color: "#D8D8D8"}}/>

                        <div className="flex flex-1 justify-start items-center w-[80%] ml-1 mr-1">
                            <div
                                className="flex overflow-x-auto overflow-y-hidden justify-start items-center space-x-2 mr-2"
                                style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                            >
                                {
                                    [Stage.RapidDivergence, Stage.DeepDivergence, Stage.Convergence].map((stage, index) => (
                                        designSchemes[stage]?.length ? (
                                            <>
                                                <div
                                                    key={index}
                                                    className={classNames("flex-shrink-0 w-[32px] h-[40px] flex items-center justify-center rounded-md", {
                                                        "bg-[#F8F3FF]": currentStage === stage,
                                                        "bg-[#F3F4F8]": currentStage !== stage
                                                    })}
                                                >
                                                        <span className={classNames("badge-text", {
                                                            "text-[#6001FF]": currentStage === stage,
                                                            "text-[#8F949B]": currentStage !== stage
                                                        })}
                                                              style={{textAlign: "center"}}>
                                                            {stage}
                                                        </span>
                                                </div>
                                                {
                                                    designSchemes[stage]?.map((scheme, index) => (
                                                        <div
                                                            key={index}
                                                            className={classNames("relative flex-shrink-0 border-[1.5px] w-[40px] h-[40px] rounded-md", {
                                                                "border-[#6001FF]": currentScheme && currentScheme.stage === stage && currentScheme.index === index,
                                                            })}
                                                            onClick={() => switchCurrentScheme(stage, index)}
                                                        >
                                                            <div
                                                                className={classNames("absolute z-[5] top-0 left-0 p-0.5 rounded-tl-md flex items-center justify-center", {
                                                                    "bg-[#F8F3FF]": currentScheme && currentScheme.stage === stage && currentScheme.index === index,
                                                                    "bg-[#F3F4F8]": !(currentScheme && currentScheme.stage === stage && currentScheme.index === index)
                                                                })}>
                                                                        <span
                                                                            className={classNames("text-[4px]", {
                                                                                "text-[#6001FF]": currentScheme && currentScheme.stage === stage && currentScheme.index === index,
                                                                                "text-[#8F949B]": !(currentScheme && currentScheme.stage === stage && currentScheme.index === index)
                                                                            })}
                                                                            style={{
                                                                                lineHeight: "normal",
                                                                                textAlign: "center",
                                                                            }}
                                                                        >
                                                                            {index + 1}
                                                                        </span>
                                                            </div>
                                                            <div
                                                                className="w-full h-full overflow-hidden flex items-center justify-center rounded-md">
                                                                <Image
                                                                    height="100%"
                                                                    src={scheme.canvasImage}
                                                                    preview={false}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                {
                                                    stage !== Stage.Convergence && currentStage === stage && (
                                                        <div onClick={() => handleClickAddSchemes(stage)}>
                                                            <PlusCircleOutlined
                                                                style={{fontSize: '18px', color: '#D8D8D8'}}/>
                                                        </div>
                                                    )
                                                }
                                            </>
                                        ) : <></>
                                    ))
                                }
                            </div>
                        </div>
                        <RightOutlined style={{fontSize: '18px', color: "#D8D8D8"}}/>
                    </div>
                )}
            </div>
        </CanvasContext.Provider>
    )
})