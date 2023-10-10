import {Stage} from "@/app/paint/config";
import {DesignSchemeType} from "@/app/paint/provider";

export const getSelectSchemeInfo = (index: number, designSchemes: {
    [key in Stage]: DesignSchemeType[] | null;
}): {stage: Stage, schemeIdx: number} => {
    const rapidLength = designSchemes[Stage.RapidDivergence]?.length;
    if(index < (rapidLength as number)) {
        return {
            stage: Stage.RapidDivergence,
            schemeIdx: index
        }
    } else {
        return {
            stage: Stage.DeepDivergence,
            schemeIdx: index - (rapidLength as number)
        }
    }
}