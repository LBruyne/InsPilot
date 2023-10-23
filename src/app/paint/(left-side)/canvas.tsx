import {Input} from "antd";
const {TextArea} = Input
import {EllipseIcon, EraseIcon, PenIcon, TextIcon, UndoIcon} from "../../../../public/icons";
import {
    designTextInputW
} from "@/app/paint/config";
import {ReactSketchCanvas, } from "react-sketch-canvas";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {isReady} from "@/app/paint/page";
import {
    ADD_DESIGN_TEXT,
    CLEAR_DESIGN_TEXTS,
    DesignTextType, REMOVE_DESIGN_TEXT,
    TextPosition,
    UPDATE_IMG,
    UPDATE_PATHS,
    UPDATE_SVG, usePaintContext
} from "@/app/paint/provider";
import {CanvasPath} from "react-sketch-canvas/src/types";
import {Tools, useCanvasContext} from "@/app/paint/(left-side)/index";

export interface ReactSketchCanvasProps {
    id?: string;
    ref?: React.MutableRefObject<any>;
    width?: string;
    height?: string;
    className?: string;
    strokeColor?: string;
    canvasColor?: string;
    backgroundImage?: string;
    exportWithBackgroundImage?: boolean;
    preserveBackgroundImageAspectRatio?: string;
    strokeWidth?: number;
    eraserWidth?: number;
    allowOnlyPointerType?: string;
    onChange?: (updatedPaths: CanvasPath[]) => void;
    onStroke?: (path: CanvasPath, isEraser: boolean) => void;
    style?: React.CSSProperties;
    svgStyle?: React.CSSProperties;
    withTimestamp?: boolean;
}

export type CanvasProps = {
    wrapperRef: React.MutableRefObject<any>
}

export const Canvas = (props: CanvasProps) => {
    const {state: paintContext, dispatch} = usePaintContext()
    const {currentScheme} = paintContext
    const {selectedTool, canvasRef, canvasProps} = useCanvasContext()
    const {currentStage, designSchemes} = paintContext;
    const {texts = [], paths} = designSchemes[currentScheme!.stage]?.[currentScheme!.index] || {};
    const {wrapperRef: canvasWrapperRef} = props

    // 以下内容是一个trick：
    // 由于canvas组件存在一个Bug，即height设置为百分比时，橡皮擦会存在异常。
    // 所以需要动态获取canvasWrapper的高度并将其给到canvas。
    const [canvasH, setCanvasH] = useState<number | undefined>();
    useLayoutEffect(() => {
        const updateCanvasH = () => {
            if (canvasWrapperRef.current) {
                // @ts-ignore
                const height = canvasWrapperRef.current.getBoundingClientRect().height;
                setCanvasH(height);
            }
        }
        updateCanvasH();
        window.addEventListener('resize', updateCanvasH);
        return () => {
            window.removeEventListener('resize', updateCanvasH);
        };
    }, []);

    // 输入文本功能
    const [showDesignTextInput, setShowDesignTextInput] = useState<boolean | null>(false); // 控制文本输入
    const [currentDesignTextInputValue, setCurrentDesignTextInputValue] = useState('');
    const [currentDesignTextInputPosition, setCurrentDesignTextInputPosition] = useState<TextPosition>({x: 0, y: 0});
    const handleClickCanvas = (e: any) => {
        if (isReady(currentStage) && selectedTool === Tools.Text && !showDesignTextInput) {
            // 当前可以输入，且没有正在进行的输入
            if (!canvasWrapperRef.current) {
                return
            }
            // @ts-ignore
            const {left, width} = canvasWrapperRef.current.getBoundingClientRect();
            // 判断当前点击区域生成的输入框是否会超过画布
            const minX = left + designTextInputW / 2;
            const maxX = left + width - designTextInputW / 2;
            if (
                e.clientX >= minX && e.clientX <= maxX
            ) {
                const x = e.clientX; // x position relative to the viewport
                const y = e.clientY; // y position relative to the viewport
                setCurrentDesignTextInputPosition({x, y});
                setShowDesignTextInput(true);
            }
        } else if (showDesignTextInput) {
            if (currentDesignTextInputValue === "") {
                handleCancelTextInput();
            } else {
                handleConfirmTextInput();
            }
        }
    }
    const addDesignText = (newText: DesignTextType) => {
        dispatch({
            type: ADD_DESIGN_TEXT,
            payload: {
                stage: currentStage,
                schemeIndex: currentScheme?.index,
                text: newText
            }
        })
    }
    const removeDesignText = (index: number) => {
        dispatch({
            type: REMOVE_DESIGN_TEXT,
            payload: {
                stage: currentStage,
                schemeIndex: currentScheme?.index,
                textIndex: index
            }
        })
    }
    const handleConfirmTextInput = () => {
        // 如果是新的文本，将文字保存到状态中
        addDesignText({text: currentDesignTextInputValue, position: currentDesignTextInputPosition});
        setShowDesignTextInput(false)
        setCurrentDesignTextInputPosition({x: 0, y: 0})
        setCurrentDesignTextInputValue('')
    }
    const handleCancelTextInput = () => {
        setShowDesignTextInput(false)
        setCurrentDesignTextInputPosition({x: 0, y: 0})
        setCurrentDesignTextInputValue('')
    }
    const handleClickTexts = (index: number, text: DesignTextType) => {
        // 首先去除正在编辑的文本框
        removeDesignText(index)
        setCurrentDesignTextInputValue(text.text);
        setCurrentDesignTextInputPosition(text.position);
        setShowDesignTextInput(true);
    }
    // 绘画
    const onSketchCanvasChange = (updatedPaths: CanvasPath[]): void => {
        dispatch({
            type: UPDATE_PATHS,
            payload: {
                stage: currentScheme?.stage,
                schemeIndex: currentScheme?.index,
                updatedPaths
            }
        })
    };

    return (
        <div
            className="h-full w-full"
            onClick={handleClickCanvas}
        >
            <ReactSketchCanvas
                style={{ borderTop: "2px dashed #D8D8D8", borderBottom: "2px dashed #D8D8D8" }}
                ref={canvasRef}
                onChange={onSketchCanvasChange}
                height={`${canvasH}px`}
                {...canvasProps}
            />
            {showDesignTextInput && (
                <div style={{
                    top: `${currentDesignTextInputPosition.y}px`,
                    left: `${currentDesignTextInputPosition.x}px`,
                    maxWidth: `${designTextInputW}px`
                }}
                     className="fixed transform -translate-x-1/2 -translate-y-1/2 ]"
                     onClick={e => {
                         // 点击事件将不会影响父节点
                         e.stopPropagation();
                     }}
                >
                    <div
                        className="absolute left-[-6px] top-1/2 transform -translate-y-1/2 z-10">
                        <EllipseIcon
                            style={{
                                width: '12px',
                                height: "12px",
                                fill: "#6001FF"
                            }}/>
                    </div>
                    <div
                        className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 z-10">
                        <EllipseIcon
                            style={{
                                width: '12px',
                                height: "12px",
                                fill: "#6001FF"
                            }}/>
                    </div>
                    <TextArea
                        value={currentDesignTextInputValue}
                        onChange={(e) => setCurrentDesignTextInputValue(e.target.value)}
                        autoSize={{minRows: 1, maxRows: 4}}
                        className='design-text my-design-text-textarea'
                    />
                </div>
            )}
            {texts.map((text, index) => (
                <div key={index}
                     onClick={e => {
                         // 点击事件将不会影响父节点
                         e.stopPropagation();
                         handleClickTexts(index, text);
                     }}
                     className="design-text fixed transform -translate-x-1/2 -translate-y-1/2
                                                 border border-dashed px-[11px] py-[4px]"
                     style={{
                         borderColor: "#8F949B",
                         top: `${text.position.y}px`,
                         left: `${text.position.x}px`,
                         minWidth: `${designTextInputW / 2}px`,
                         maxWidth: `${designTextInputW}px`
                     }}>
                    {text.text}
                </div>
            ))}
        </div>
    )
}