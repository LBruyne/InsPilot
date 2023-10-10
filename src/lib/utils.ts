// 从selectedSCHEME中获取id代表的真正方案
import {Stage} from "@/app/paint/config";
import {DesignSCHEMEType} from "@/app/paint/provider";

export const getSelectSCHEMEInfo = (index: number, designSCHEMEs: {
    [key in Stage]: DesignSCHEMEType[] | null;
}): {stage: Stage, SCHEMEIdx: number} => {
    const rapidLength = designSCHEMEs[Stage.RapidDivergence]?.length;
    const deepLength = designSCHEMEs[Stage.DeepDivergence]?.length;
    if(index < rapidLength) {
        return {
            stage: Stage.RapidDivergence,
            SCHEMEIdx: index
        }
    } else {
        return {
            stage: Stage.DeepDivergence,
            SCHEMEIdx: index - rapidLength
        }
    }
}