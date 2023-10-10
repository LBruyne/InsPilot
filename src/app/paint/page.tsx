"use client";

import {PaintProvider} from "@/app/paint/provider";
import Paint from "@/app/paint/Paint";

export default function PaintPageWrapper() {

    return (
        <PaintProvider>
            <Paint />
        </PaintProvider>
    );
};

