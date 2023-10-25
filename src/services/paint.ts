import {baseUrl} from "@/configs/env";

const PAINT_APP_ID = 0

export async function start({username}: {
    username: string;
}) {
    try {
        const res = await fetch(`${baseUrl}/paint/start`, {
            method: "POST",
            body: JSON.stringify({
                username
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        if (!result.success) return undefined;
        return result.data;
    } catch (error: any) {
        throw new Error(`获取用户信息失败: ${error.message}`);
    }
}

export async function save({username, data}: {
    username: string;
    data: object;
}) {
    try {
        const res = await fetch(`${baseUrl}/paint/save`, {
            method: "POST",
            body: JSON.stringify({
                username, data
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        if (!result.success) {
           throw new Error("保存数据失败：" + result.message)
        }
    } catch (error: any) {
        throw new Error(`${error.message}`);
    }
}

export async function getRapidDivergenceStimulus({task, num}: {
    task: string;
    num: number;
}) {
    try {
        const res = await fetch(`${baseUrl}/generate`, {
            method: "POST",
            body: JSON.stringify({
                appid: PAINT_APP_ID,
                type: 0,
                prompts: {
                    task, num
                }
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        if (!result.success) return [];
        return result.data.result;
    } catch (error: any) {
        throw new Error(`生成刺激失败: ${error.message}`);
    }
}

export async function getDeepDivergenceStimulus({designTexts, schemeId}: {
    designTexts: string[];
    schemeId: number;
}) {
    try {
        const res = await fetch(`${baseUrl}/generate`, {
            method: "POST",
            body: JSON.stringify({
                appid: PAINT_APP_ID,
                type: 1,
                prompts: {
                    designTexts, schemeId
                }
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        if (!result.success) return [];
        return result.data.result;
    } catch (error: any) {
        throw new Error(`生成刺激失败: ${error.message}`);
    }
}

export async function getConvergenceOneStimulus({selectNum, schemes}: {
    selectNum: number
    schemes: {designTexts: []}[]
}) {
    try {
        const res = await fetch(`${baseUrl}/generate`, {
            method: "POST",
            body: JSON.stringify({
                appid: PAINT_APP_ID,
                type: 2,
                prompts: {
                    selectNum,
                    schemes
                }
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        if (!result.success) return {
            names: [],
            selected: []
        };
        return result.data;
    } catch (error: any) {
        throw new Error(`生成刺激失败: ${error.message}`);
    }
}

export async function getConvergenceTwoStimulus({selectedSchemes, num}: {
    selectedSchemes: {designTexts: []}[],
    num: number
}) {
    try {
        const res = await fetch(`${baseUrl}/generate`, {
            method: "POST",
            body: JSON.stringify({
                appid: PAINT_APP_ID,
                type: 3,
                prompts: {
                    selectedSchemes,
                    num
                }
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        if (!result.success) return [];
        return result.data.result;
    } catch (error: any) {
        throw new Error(`生成刺激失败: ${error.message}`);
    }
}