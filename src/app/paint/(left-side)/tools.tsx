import {EraseIcon, PenIcon, TextIcon, UndoIcon} from "../../../../public/icons";
import {isDrawing, isReady} from "@/app/paint/PaintPage";
import {ClearOutlined, SaveOutlined} from "@ant-design/icons/lib/icons";
import {eraseLowerSize, eraseUpperSize, strokeLowerSize, strokeUpperSize} from "@/app/paint/config";
import {Slider} from "antd";
import React from "react";
import {ReactSketchCanvasProps} from "react-sketch-canvas";
import {CLEAR_DESIGN_TEXTS, UPDATE_IMG, usePaintContext} from "@/app/paint/provider";
import {Tools, useCanvasContext} from "@/app/paint/(left-side)/index";

export const Toolbox = () => {
    const {state: paintContext, dispatch} = usePaintContext()
    const {currentScheme} = paintContext
    const {setSelectedTool, selectedTool, setCanvasProps, setEraseSize, setStrokeSize, eraseSize, canvasRef, strokeSize, canvasProps} = useCanvasContext()

    const {currentStage} = paintContext;

    const penHandler = () => {
        if (isDrawing(currentStage)) {
            if (selectedTool !== Tools.Pen) {
                setSelectedTool(Tools.Pen)
                setCanvasProps(
                    (prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: "all"
                    })
                );
            }

            const eraseMode = canvasRef.current?.eraseMode;
            if (eraseMode) {
                eraseMode(false);
            }
        }
    };
    const textHandler = () => {
        if (isDrawing(currentStage)) {
            if (selectedTool !== Tools.Text) {
                setSelectedTool(Tools.Text)
                setCanvasProps(
                    (prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: "touch"
                    })
                );
            }
        }
    };
    const eraserHandler = () => {
        if (isDrawing(currentStage)) {
            if (selectedTool !== Tools.Erase) {
                setSelectedTool(Tools.Erase)
                setCanvasProps(
                    (prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: "all"
                    })
                );
            }

            const eraseMode = canvasRef.current?.eraseMode;
            if (eraseMode) {
                eraseMode(true);
            }
        }
    };
    const undoHandler = () => {
        if (isDrawing(currentStage)) {
            setSelectedTool(Tools.Others)
            const undo = canvasRef.current?.undo;
            if (undo) {
                undo();
            }
        }
    };
    // const saveSvg = async () => {
    //     const exportSvg = canvasRef.current?.exportSvg;
    //     if (exportSvg) {
    //         const svgCode = await exportSvg();
    //         dispatch({
    //             type: UPDATE_SVG,
    //             payload: {
    //                 stage: currentStage,
    //                 schemeIndex: currentScheme?.index,
    //                 svgCode
    //             }
    //         })
    //     }
    // }
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
    const saveHandler = async () => {
        if (isDrawing(currentStage)) {
            setSelectedTool(Tools.Others)

            // 保存会将当前绘制的图画导出为SVG格式
            // 后续可能加入持久化逻辑
            await saveImage()
        }
    }
    const clearHandler = () => {
        if (isDrawing(currentStage)) {
            setSelectedTool(Tools.Others)
            // 清除笔画
            const clearCanvas = canvasRef.current?.clearCanvas;
            if (clearCanvas) {
                clearCanvas();
            }
            // 清除文本
            dispatch({
                type: CLEAR_DESIGN_TEXTS,
                payload: {
                    stage: currentScheme?.stage,
                    schemeIndex: currentScheme?.index
                }
            })
        }
    }
    const eraserSizeHandler = (value: number) => {
        if (isDrawing(currentStage)) {
            setEraseSize(value)
            setCanvasProps(
                (prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
                    ...prevCanvasProps,
                    eraserWidth: value,
                })
            );
        }
    };
    const strokeSizeHandler = (value: number) => {
        if (isDrawing(currentStage)) {
            setStrokeSize(value)
            setCanvasProps(
                (prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
                    ...prevCanvasProps,
                    strokeWidth: value,
                })
            );
        }
    };

    const tools = [
        {
            tool: Tools.Pen,
            handler: penHandler,
            icon: PenIcon,
            width: 22
        },
        {
            tool: Tools.Text,
            handler: textHandler,
            icon: TextIcon,
            width: 25
        },
        {
            tool: Tools.Erase,
            handler: eraserHandler,
            icon: EraseIcon,
            width: 25
        },
        {
            tool: Tools.Others,
            handler: undoHandler,
            icon: UndoIcon,
            width: 25
        },
        {
            tool: Tools.Others,
            handler: clearHandler,
            icon: ClearOutlined,
            fontSize: 22
        },
        {
            tool: Tools.Others,
            handler: saveHandler,
            icon: SaveOutlined,
            fontSize: 22
        },
    ]

    function ToolBar() {
        return (
            <>
                {tools.map((tool, index) => (
                    <div
                        key={index}
                        className={`w-[32px] h-[32px] flex items-center justify-center ${isDrawing(currentStage) && selectedTool === tool.tool && selectedTool !== Tools.Others ? 'bg-[#F8F3FF] rounded-md' : ''}`}
                        onClick={tool.handler}
                    >
                        {React.createElement(tool.icon, {
                            style: {
                                width: tool.width ? `${tool.width}px` : 'auto',
                                height: tool.width ? `${tool.width}px` : 'auto',
                                fontSize: tool.fontSize ? `${tool.fontSize}px` : '',
                                fill: !isReady(currentStage) ? "#D9D9D9" : isDrawing(currentStage) && selectedTool === tool.tool && selectedTool !== Tools.Others ? "#6001FF" : "#000",
                                color: !isReady(currentStage) ? "#D9D9D9" : isDrawing(currentStage) && selectedTool === tool.tool && selectedTool !== Tools.Others ? "#6001FF" : "#000",
                            },
                        })}
                    </div>
                ))}
            </>
        );
    }

    return (
        <div className="w-[100%] flex flex-col justify-end pr-[16px] pt-[16px]" onClick={e => {
            // 点击事件将不会影响父节点
            e.stopPropagation();
        }}>
            <div
                className="mb-[8px] z-10 w-[100%] h-[42px] flex items-center justify-around space-x-1 pl-2 pr-2"
                style={{
                    borderRadius: "10px",
                    border: "1px solid #D9D9D9",
                    background: "#FFF",
                    boxShadow: "0px 3px 10px -6px rgba(0, 0, 0, 0.10)"
                }}
            >
                <ToolBar/>
            </div>
            {/* Slider for tools */}
            {isDrawing(currentStage) && selectedTool === Tools.Pen ? (
                <div
                    className="z-10 h-[32px] flex items-center justify-between"
                    style={{
                        padding: '0 8px',
                        background: "#FFF",
                        borderRadius: "10px",
                        border: "1px solid #D9D9D9",
                        boxShadow: "0px 3px 10px -6px rgba(0, 0, 0, 0.10)"
                    }}
                >
                    <span className="text-[12px] leading-[19.2px] font-normal mr-1">{strokeLowerSize}px</span>
                    <Slider
                        min={strokeLowerSize}
                        max={strokeUpperSize}
                        style={{flex: 1}}
                        trackStyle={{
                            background: '#6001FF'
                        }}
                        className="my-slider"
                        onChange={strokeSizeHandler}
                        value={strokeSize}
                    />
                    <span
                        className="text-[12px] leading-[19.2px] font-normal">{strokeUpperSize}px</span>
                </div>
            ) : isDrawing(currentStage) && selectedTool === Tools.Erase ? (
                <div
                    className="z-10 h-[32px] flex items-center justify-between"
                    style={{
                        padding: '0 8px',
                        background: "#FFF",
                        borderRadius: "10px",
                        border: "1px solid #D9D9D9",
                        boxShadow: "0px 3px 10px -6px rgba(0, 0, 0, 0.10)"
                    }}
                >
                    <span className="text-[12px] leading-[19.2px] font-normal mr-1">{eraseLowerSize}px</span>
                    <Slider
                        min={eraseLowerSize}
                        max={eraseUpperSize}
                        style={{flex: 1}}
                        trackStyle={{
                            background: '#6001FF'
                        }}
                        className="my-slider"
                        onChange={eraserSizeHandler}
                        value={eraseSize}
                    />
                    <span className="text-[12px] leading-[19.2px] font-normal">{eraseUpperSize}px</span>
                </div>
            ) : <></>
            }
        </div>
    )
}