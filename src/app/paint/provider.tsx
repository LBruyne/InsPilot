'use client';

import {createContext, Dispatch, useContext, useReducer} from "react";
import {CreativeType, Stage} from "@/app/paint/config";
import {CanvasPath} from "react-sketch-canvas"

export type TextPosition = {
    x: number,
    y: number
}

export type DesignTextType = {
    text: string
    position: TextPosition
}

export type DesignSchemeType = {
    name: string // 方案名字
    canvasSvg?: string, // SVG code
    canvasImage?: string, // image type的URI
    paths: CanvasPath[], // 当前绘画内容
    texts: DesignTextType[] // 用户文本输入
}

export type DesignCreativeItem = {
    type: "abstractText" | "concreteText" | "abstractImage" | "concreteImage" | "groupTypeOne" | "groupTypeTwo"
    text?: string,
    image?: string,
    combinations?: DesignCreativeItem[]
}

export type DesignCreativeType = {
    type: CreativeType
    items: DesignCreativeItem[], // 内部包含的item
    displayType: "sequence" | "direct", // 展示的方式
    displayed: boolean, // 是否被使用进行展示
    displayIndex: number, // 当前展示的item
    relatedScheme?: number // 当前刺激关联的方案
}

export type PaintState = {
    // 用户信息
    username: string
    currentScheme?: {
        index: number,
        stage: Stage
    }
    currentStage: Stage // TODO 每次切换后，传输当前阶段数据给后端，用于生成图像时判断阶段。
    // 用户输入的任务目标
    designTask?: string // TODO 传输设计任务给后端
    // 所有方案
    designSchemes: {
        [key in Stage]: DesignSchemeType[] | null;
    }
    // 用户最终选择的方案，只能从前两个阶段的方案中选
    // 保存方案的idx，两个阶段的方案会以接连的形式表达
    selectedSchemes: number[]
    // 创意刺激
    designCreatives: DesignCreativeType[]
};

export type PaintContextType = {
    state: PaintState;
    dispatch: Dispatch<PaintAction>;
};

export const ADD_SCHEME = "ADD_SCHEME", SWITCH_STAGE = "SWITCH_STAGE", ADD_DESIGN_TEXT = "ADD_DESIGN_TEXT",
    REMOVE_DESIGN_TEXT = "REMOVE_DESIGN_TEXT", UPDATE_DESIGN_TASK = "UPDATE_DESIGN_TASK", UPDATE_PATHS = "UPDATE_PATHS",
    UPDATE_SVG = "UPDATE_SVG", UPDATE_IMG = "UPDATE_IMG", NEXT_CREATIVE_ITEM = "NEXT_CREATIVE_ITEM",
    NEXT_CREATIVE = "NEXT_CREATIVE", CLEAR_DESIGN_TEXTS = "CLEAR_DESIGN_TEXTS",
    UPDATE_SELECTED_SCHEMES = "UPDATE_SELECTED_SCHEMES",
    UPDATE_CURRENT_SCHEME = "UPDATE_CURRENT_SCHEME", ADD_CREATIVES = "ADD_CREATIVES",
    UPDATE_SCHEMES_NAME = "UPDATE_SCHEMES_NAME", UPDATE_USER_NAME = "UPDATE_USER_NAME",
    LOAD_STATE = "LOAD_STATE"
export type PaintAction = { type: string; payload: any }

const initialState: PaintState = {
    username: "",
    selectedSchemes: [],
    designCreatives: [],
    currentStage: Stage.NotReady,
    designSchemes: {
        [Stage.NotReady]: null,
        [Stage.RapidDivergence]: [],
        [Stage.DeepDivergence]: [],
        [Stage.Convergence]: [],
        [Stage.Finish]: null,
        [Stage.Unable]: null
    },
    designTask: ""
}

function paintReducer(state: PaintState, action: PaintAction): PaintState {
    switch (action.type) {
        case ADD_SCHEME:
            const newScheme: DesignSchemeType = {
                name: "",
                paths: [],          // 初始为空数组
                texts: []           // 初始为空数组
            };
            return {
                ...state,
                designSchemes: {
                    ...state.designSchemes,
                    [action.payload.stage]: state.designSchemes[action.payload.stage]
                        ? [...state.designSchemes[action.payload.stage]!, newScheme]
                        : [newScheme]
                }
            };
        case UPDATE_CURRENT_SCHEME:
            return {
                ...state,
                currentScheme: action.payload
            }
        case UPDATE_DESIGN_TASK:
            return {
                ...state,
                designTask: action.payload.designTask
            };
        case SWITCH_STAGE:
            return {
                ...state,
                currentStage: action.payload.stage
            };
        case ADD_DESIGN_TEXT: {
            const updatedDesignSchemes = {...state.designSchemes};
            const updatedStageSchemes: DesignSchemeType[] = [...updatedDesignSchemes[action.payload.stage]];
            if (updatedStageSchemes.length <= action.payload.schemeIndex) {
                return state
            }
            const updatedScheme: DesignSchemeType = {...updatedStageSchemes[action.payload.schemeIndex]};
            updatedScheme.texts = [...updatedScheme.texts, action.payload.text];
            updatedStageSchemes[action.payload.schemeIndex] = updatedScheme;
            updatedDesignSchemes[action.payload.stage] = updatedStageSchemes;
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case REMOVE_DESIGN_TEXT: {
            const updatedDesignSchemes = {...state.designSchemes};
            const updatedStageSchemes: DesignSchemeType[] = [...updatedDesignSchemes[action.payload.stage]];
            if (updatedStageSchemes.length <= action.payload.schemeIndex) {
                return state
            }
            const updatedScheme: DesignSchemeType = {...updatedStageSchemes[action.payload.schemeIndex]};
            updatedScheme.texts.splice(action.payload.textIndex, 1);
            updatedStageSchemes[action.payload.schemeIndex] = updatedScheme;
            updatedDesignSchemes[action.payload.stage] = updatedStageSchemes;
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case CLEAR_DESIGN_TEXTS: {
            const updatedDesignSchemes = {...state.designSchemes};
            const updatedStageSchemes: DesignSchemeType[] = [...updatedDesignSchemes[action.payload.stage]];
            if (updatedStageSchemes.length <= action.payload.schemeIndex) {
                return state
            }
            const updatedScheme: DesignSchemeType = {...updatedStageSchemes[action.payload.schemeIndex]};
            updatedScheme.texts.splice(0, updatedScheme.texts.length)
            updatedStageSchemes[action.payload.schemeIndex] = updatedScheme;
            updatedDesignSchemes[action.payload.stage] = updatedStageSchemes;
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case UPDATE_PATHS: {
            const updatedDesignSchemes = {...state.designSchemes};
            const updatedStageSchemes: DesignSchemeType[] = [...updatedDesignSchemes[action.payload.stage]];
            if (updatedStageSchemes.length <= action.payload.schemeIndex) {
                return state
            }
            const updatedScheme: DesignSchemeType = {...updatedStageSchemes[action.payload.schemeIndex]};
            updatedScheme.paths = action.payload.updatedPaths
            updatedStageSchemes[action.payload.schemeIndex] = updatedScheme;
            updatedDesignSchemes[action.payload.stage] = updatedStageSchemes;
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case UPDATE_SVG: {
            const updatedDesignSchemes = {...state.designSchemes};
            const updatedStageSchemes: DesignSchemeType[] = [...updatedDesignSchemes[action.payload.stage]];
            if (updatedStageSchemes.length <= action.payload.schemeIndex) {
                return state
            }
            const updatedScheme: DesignSchemeType = {...updatedStageSchemes[action.payload.schemeIndex]};
            updatedScheme.canvasSvg = action.payload.svgCode
            updatedStageSchemes[action.payload.schemeIndex] = updatedScheme;
            updatedDesignSchemes[action.payload.stage] = updatedStageSchemes;
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case UPDATE_IMG: {
            const updatedDesignSchemes = {...state.designSchemes};
            const updatedStageSchemes: DesignSchemeType[] = [...updatedDesignSchemes[action.payload.stage]];
            if (updatedStageSchemes.length <= action.payload.schemeIndex) {
                return state
            }
            const updatedScheme: DesignSchemeType = {...updatedStageSchemes[action.payload.schemeIndex]};
            updatedScheme.canvasImage = action.payload.imageData
            updatedStageSchemes[action.payload.schemeIndex] = updatedScheme;
            updatedDesignSchemes[action.payload.stage] = updatedStageSchemes;
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case UPDATE_SELECTED_SCHEMES: {
            return {
                ...state,
                selectedSchemes: action.payload.schemes
            };
        }
        case NEXT_CREATIVE_ITEM: {
            const updatedCreatives = [...state.designCreatives];
            const updatedCreative: DesignCreativeType = {...updatedCreatives[action.payload.creativeIndex]}
            updatedCreative.displayIndex += 1;
            updatedCreatives[action.payload.creativeIndex] = updatedCreative
            return {...state, designCreatives: updatedCreatives}
        }
        case NEXT_CREATIVE: {
            const updatedCreatives = [...state.designCreatives];
            const updatedCreative: DesignCreativeType = {...updatedCreatives[action.payload.nextIndex]}
            updatedCreative.displayed = true
            if (updatedCreative.displayType === 'direct') {
                updatedCreative.displayIndex = updatedCreative.items.length - 1
            }
            updatedCreatives[action.payload.nextIndex] = updatedCreative
            return {...state, designCreatives: updatedCreatives}
        }
        case ADD_CREATIVES: {
            let updatedCreatives = [...state.designCreatives];
            if (action.payload.type === CreativeType.RapidAbstract || action.payload.type === CreativeType.Deep || action.payload.type === CreativeType.ConvergenceGroupTwo) {
                const data: [] = action.payload.data
                data.map((c: DesignCreativeType) => {
                    updatedCreatives = [...updatedCreatives, {
                        ...c,
                        displayed: false,
                        displayIndex: 0,
                        relatedScheme: action.payload.schemeId
                    }]
                })
            } else if (action.payload.type === CreativeType.ConvergenceGroupOne) {
                const c = action.payload.data
                if (c) {
                    updatedCreatives = [...updatedCreatives, {
                        ...c,
                        displayed: false,
                        displayIndex: 0,
                    }]
                }
            }
            return {...state, designCreatives: updatedCreatives}
        }
        case UPDATE_SCHEMES_NAME: {
            const updatedDesignSchemes = {...state.designSchemes};
            const rapidNum = updatedDesignSchemes[Stage.RapidDivergence]?.length as number
            const names: [] = action.payload.names
            for(let i = 0; i < names.length; i++) {
                if(i < rapidNum) {
                    updatedDesignSchemes[Stage.RapidDivergence]![i].name = names[i]
                } else {
                    updatedDesignSchemes[Stage.DeepDivergence]![i - rapidNum].name = names[i]
                }
            }
            return {...state, designSchemes: updatedDesignSchemes};
        }
        case UPDATE_USER_NAME: {
            return {
                ...state,
                username: action.payload.username
            };
        }
        case LOAD_STATE: {
            return {
                ...state,
                ...action.payload.data,
                username: action.payload.username,
                designSchemes: {
                    [Stage.NotReady]: null,
                    [Stage.RapidDivergence]: action.payload.data.rapidDivergenceSchemes,
                    [Stage.DeepDivergence]: action.payload.data.deepDivergenceSchemes,
                    [Stage.Convergence]: action.payload.data.convergenceSchemes,
                    [Stage.Finish]: null,
                    [Stage.Unable]: null
                }
            }
        }
        default:
            return state;
    }
}

const PaintContext = createContext<PaintContextType | undefined>(undefined);

export const PaintProvider: React.FC = ({children}) => {

    const [state, dispatch] = useReducer(paintReducer, initialState);

    return (
        <PaintContext.Provider value={{state, dispatch}}>
            {children}
        </PaintContext.Provider>
    );
}

export const usePaintContext = (): PaintContextType => {
    const context = useContext(PaintContext);
    return context as PaintContextType;
};