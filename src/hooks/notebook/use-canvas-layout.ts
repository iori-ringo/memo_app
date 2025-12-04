import { useState, useEffect } from "react";
import { NotePage } from "@/types/note";
import { DEFAULT_LAYOUT } from "@/lib/constants";

export function useCanvasLayout(page: NotePage, onUpdate: (id: string, updates: Partial<NotePage>) => void) {
    const [titleHeight, setTitleHeight] = useState(DEFAULT_LAYOUT.TITLE_HEIGHT);
    const [centerPosition, setCenterPosition] = useState(DEFAULT_LAYOUT.CENTER_POSITION);
    const [diversionPosition, setDiversionPosition] = useState(DEFAULT_LAYOUT.DIVERSION_POSITION);

    // Load layout from page data
    useEffect(() => {
        setTitleHeight(page.layout?.titleHeight ?? DEFAULT_LAYOUT.TITLE_HEIGHT);
        setCenterPosition(page.layout?.centerPosition ?? DEFAULT_LAYOUT.CENTER_POSITION);
        setDiversionPosition(page.layout?.diversionPosition ?? DEFAULT_LAYOUT.DIVERSION_POSITION);
    }, [page.id, page.layout]);

    const handleBoundaryChange = (boundary: "title" | "center" | "diversion", value: number) => {
        const newLayout = {
            titleHeight: boundary === "title" ? value : titleHeight,
            centerPosition: boundary === "center" ? value : centerPosition,
            diversionPosition: boundary === "diversion" ? value : diversionPosition,
        };

        if (boundary === "title") {
            setTitleHeight(value);
        } else if (boundary === "center") {
            setCenterPosition(value);
        } else if (boundary === "diversion") {
            setDiversionPosition(value);
        }

        // Save to page
        onUpdate(page.id, { layout: newLayout });
    };

    return {
        titleHeight,
        centerPosition,
        diversionPosition,
        handleBoundaryChange,
    };
}
