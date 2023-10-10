import { NextApiRequest, NextApiResponse } from 'next';
import {fetchData, postData} from "@/app/api/helper";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    // 获取数据
    const data = await fetchData();  // 假设 fetchDataFromBackend 是你从后端获取数据的函数
    res.status(200).json(data);
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    const requestData = req.body;
    const responseData = await postData(requestData);  // 假设 postDataToBackend 是你将数据发送到后端的函数
    res.status(201).json(responseData);
}