import { NextApiRequest, NextApiResponse } from 'next';
import {fetchData, postData} from "@/app/api/helper";
import {NextResponse} from "next/server";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error });
    }
}