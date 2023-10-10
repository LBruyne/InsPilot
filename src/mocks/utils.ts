import {DesignCreativeType} from "@/app/paint/provider";
import {CreativeType, Stage} from "@/app/paint/config";

export const generateApiResponse = <T>(data: T): ApiResponse<T> => {
    return {
        success: true,
        data,
        message: 'successful',
        code: 0
    };
};

const defaultImage = "https://s2.loli.net/2023/10/07/rBEWR8SJ4NPesgt.png"
export const generateMockDesignCreatives = (): DesignCreativeType[] => {
    return [
        {
            type: CreativeType.RapidAbstract,
            displayed: false,
            displayType: "sequence",
            displayIndex: 0,
            items: [
                {
                    type: "abstractImage",
                    image: defaultImage
                },
                {
                    type: "abstractText",
                    text: "一个无绳跳绳，跳绳长度可自由调脂效果。具有计时、计数等功能，可记录每次运动数据。"
                }
            ],
            relatedScheme: 0
        },
        {
            type: CreativeType.RapidAbstract,
            displayed: false,
            displayType: "sequence",
            displayIndex: 0,
            items: [
                {
                    type: "abstractImage",
                    image: defaultImage
                },
                {
                    type: "abstractText",
                    text: "一个无绳跳绳，跳绳长度可自由调脂效果。具有计时、计数等功能，可记录每次运动数据。"
                }
            ],
            relatedScheme: 0
        },
        {
            type: CreativeType.Deep,
            displayed: false,
            displayType: "sequence",
            displayIndex: 0,
            items: [
                {
                    type: "abstractImage",
                    image: defaultImage
                },
                {
                    type: "abstractText",
                    text: "通过跳跃达到锻炼的目的"
                },
                {
                    type: "concreteText",
                    text: "一个无绳跳绳，跳绳长度可自由调节，手柄上的球体可以增加负重，以加强燃脂效果。具有计时、计数等功能，可记录每次运动数据。"
                }
            ],
            relatedScheme: 0
        },
        // {
        //     type: CreativeType.RapidConcrete,
        //     displayed: false,
        //     displayType: "sequence",
        //     displayIndex: 0,
        //     items: [
        //         {
        //             type: "concreteText",
        //             text: "一个无绳跳绳，跳绳长度可自由调脂效果。具有计时、计数等功能，可记录每次运动数据。"
        //         }
        //     ],
        //     relatedSCHEME: 0
        // },
        {
            type: CreativeType.ConvergenceGroupOne,
            displayed: false,
            displayType: "direct",
            displayIndex: 2,
            items: [
                {
                    type: "groupTypeOne",
                    combinations: [
                        {
                            type: "abstractImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteText",
                            text: "一个无绳跳绳，跳绳长度可自由调节，手柄上的球体可以增加负重，以加强燃脂效果。具有计时、计数等功能，可记录每次运动数据。"
                        }
                    ]
                },
                {
                    type: "groupTypeOne",
                    combinations: [
                        {
                            type: "abstractImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteText",
                            text: "一个无绳跳绳，跳绳长度可自由调节，手柄上的球体可以增加负重，以加强燃脂效果。具有计时、计数等功能，可记录每次运动数据。"
                        }
                    ]
                },
                {
                    type: "groupTypeOne",
                    combinations: [
                        {
                            type: "abstractImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteText",
                            text: "一个无绳跳绳，跳绳长度可自由调节，手柄上的球体可以增加负重，以加强燃脂效果。具有计时、计数等功能，可记录每次运动数据。"
                        }
                    ]
                }
            ],
            relatedScheme: 0
        },
        {
            type: CreativeType.ConvergenceGroupTwo,
            displayed: false,
            displayType: "direct",
            displayIndex: 0,
            items: [
                {
                    type: "groupTypeTwo",
                    combinations: [
                        {
                            type: "abstractImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteImage",
                            image: defaultImage
                        },
                        {
                            type: "concreteText",
                            text: "一个无绳跳绳，跳绳长度可自由调节，手柄上的球体可以增加负重，以加强燃脂效果。具有计时、计数等功能，可记录每次运动数据。"
                        }
                    ]
                }
            ],
            relatedScheme: 0
        }
    ]
}