import {MagicIcon} from "../../public/icons";

export const RoutesConfig = [
    {
        path: '/paint',
        name: '多模态创意刺激',
        icon: MagicIcon
    },
    {
        path: '/compare/paint',
        name: '多模态创意刺激（对照）',
        icon: MagicIcon
    },
]

export const getPageName = (pathname: string) => {
    const ret = RoutesConfig.find(route => route.path === pathname)
    if(ret === undefined) return RoutesConfig[0].name
    return ret.name
}