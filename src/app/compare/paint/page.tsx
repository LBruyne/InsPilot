"use client";

import {PaintProvider} from "@/app/compare/paint/provider";
import ComparePaint from "@/app/compare/paint/ComparePaint";

export default function ComparePaintPageWrapper() {

    return (
        <PaintProvider>
            <ComparePaint />
        </PaintProvider>
    );
};

