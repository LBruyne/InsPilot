import Mock from "mockjs"
import {generateApiResponse} from "@/mocks/utils";

const mockPaint = () => {
    Mock.mock('/api/ping', 'get', (): ApiResponse<any> => {
        const data = Mock.mock({
            data: 'Hi, @cname'  //
        })
        return generateApiResponse(data);
    });
};

export default mockPaint;