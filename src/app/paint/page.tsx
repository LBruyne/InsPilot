"use client";

import {PaintProvider} from "@/app/paint/provider";
import PaintPage from "@/app/paint/PaintPage";

export default function PaintPageWrapper() {

    return (
        <PaintProvider>
            <PaintPage />
        </PaintProvider>
    );
};

