import React from "react";
import {InfoCircleFilled, WarningFilled} from "@ant-design/icons/lib/icons";

export enum Stage {
    NotReady = "准备",
    Unable = "禁止",
    RapidDivergence = "快速发散",
    DeepDivergence = "深入发散",
    Convergence = "收敛",
    Finish = "完成"
}

export enum CreativeType {
    RapidAbstract,
    RapidConcrete,
    Deep,
    ConvergenceGroupOne,
    ConvergenceGroupTwo
}

export const CreativeMessageSetting = {
    [CreativeType.RapidAbstract]: "没有思路？看看我们提供的创意刺激吧！除了图片，还可以点击看看文本提示哦！",
    [CreativeType.RapidConcrete]: (index: number) => (`根据方案${index + 1}，我为你提供了新的文本提示！`),
    [CreativeType.Deep]: (index: number) => (`没有思路？我根据快速发散的方案${index + 1}为你提供了新的创意刺激！`),
    [CreativeType.ConvergenceGroupOne]: (value: number) => (value > 3 ? "我为你选择了最具新颖性和实用性的三个方案，并生成了相关场景和产品，帮助你进行方案选择和收敛！" : "根据已有方案，我为你生成了相关场景和产品，帮助你进行方案选择和收敛。"),
    [CreativeType.ConvergenceGroupTwo]: "根据你选择的方案，我为你生成了相关的创意刺激！"
}

export const designTextInputW = 220
export const alertDisplayTime = 30000 // ms
export const strokeUpperSize = 20, eraseUpperSize = 20
export const strokeLowerSize = 1, eraseLowerSize = 1
export const strokeDefaultSize = 5, eraseDefaultSize = 5
export const creativeLessLimit = 3, creativeInitNumber = 10
export const convergenceMinimizeSchemeNumber = 3
