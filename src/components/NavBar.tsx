import {Select} from "antd";
import React, {useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {getPageName, RoutesConfig} from "@/configs/routes";


export default function NavBar() {
    const router = useRouter()
    const pathname = usePathname()
    const [selectedPage, setSelectedPage] = useState(getPageName(pathname));
    const routeOptions = RoutesConfig.map(route => ({
        value: route.path,
        label: route.name
    }));

    return (
        <div className="relative flex items-center h-[50px] justify-between border-b border-[#F3F4F8]">
            <Select
                defaultValue={selectedPage}
                bordered={false}
                options={routeOptions}
                className="pl-[12px] w-[100%] space-x-2"
                onChange={(value) => {
                    router.push(value)
                }}
            />
        </div>
    )
}