import {DesignCreativeItem, DesignCreativeType} from "@/app/paint/provider";
import {Image} from "antd"

export type CreativeDisplayProps = {
    creative: DesignCreativeType
}

export const CreativeDisplay = (props: CreativeDisplayProps) => {

    const {creative} = props

    const displayItem = (item: DesignCreativeItem) => {
        if (item.type === "abstractImage" || item.type === "concreteImage") {
            return (
                <div
                    style={{marginBottom: "12px"}}
                    className="w-full h-[40%] flex justify-center"
                >
                    <Image
                        height="100%"
                        src={item.image}
                        style={{borderRadius: "10px"}}
                    />
                </div>
            )
        } else if (item.type === "abstractText" || item.type === "concreteText") {
            return (
                <div
                    className="w-full h-[20%] flex flex-shrink-0 justify-center items-center text-1 pl-4 pr-4"
                    style={{
                        borderRadius: "10px",
                        border: "1px dashed var(--theme-main, #570DF8)",
                        background: "#FFF",
                        marginBottom: "12px"
                    }}
                >
                    {item.text}
                </div>
            )
        } else if (item.type === "groupTypeOne") {
            // FIXME：这里需要跟数据对齐
            return (
                <div
                    className="w-full h-[33%] flex flex-col p-2"
                    style={{
                        height: "33%",
                        borderRadius: "10px",
                        border: "1px dashed var(--theme-main, #570DF8)",
                        background: "#FFF",
                        marginBottom: "12px"
                    }}
                >
                    <div className="w-full flex gap-2 flex-grow justify-center h-[70%] mb-2">
                        <Image
                            height="100%"
                            src={item.combinations ? item.combinations[0].image : ""}
                            style={{borderRadius: "10px"}}
                        />
                        <Image
                            height="100%"
                            src={item.combinations ? item.combinations[1].image : ""}
                            style={{borderRadius: "10px"}}
                        />
                    </div>
                    <div className="flex flex-grow justify-center items-center h-[20%] text-1">
                        {item.combinations ? item.combinations[2].text : ""}
                    </div>
                </div>
            )
        } else if (item.type === "groupTypeTwo") {
            return (
                <div
                    className="flex flex-1 flex-col w-full h-full"
                >
                    {item.combinations?.map(displayItem)}
                </div>
            )
        }
        // 如果后续有其他类型，添加在这里
    }

    const displayWithType = (creative: DesignCreativeType) => {
        if (creative.displayType === "sequence") {
            return creative.items
                .filter((_, index) => index <= creative.displayIndex)
                .map((item, _) => {
                    return displayItem(item)
                })
        } else if (creative.displayType === "direct") {
            return creative.items
                .map((item, _) => {
                    return displayItem(item)
                })
        }
    }

    const displayContext = () => {
        const defaultContext = (<></>)
        if (!creative) return defaultContext
        if (!creative.displayed) return defaultContext
        return displayWithType(creative)
    }

    return (
        <div className="flex flex-col items-center w-full h-full">
            {displayContext()}
        </div>
    )
}