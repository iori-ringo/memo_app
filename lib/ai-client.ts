"use client";

const MOCK_RESPONSES = {
    abstraction: "これは抽象化のサンプルテキストです（Web版モック）。",
    diversion: "これは転用のサンプルテキストです（Web版モック）。",
    summary: "これは要約のサンプルテキストです（Web版モック）。",
};

export async function generateAbstraction(fact: string): Promise<string> {
    if (typeof window !== "undefined" && window.electronAPI) {
        return window.electronAPI.generateAbstraction(fact);
    }
    // Fallback for Web Dev
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_RESPONSES.abstraction;
}

export async function generateDiversion(fact: string, abstraction: string): Promise<string> {
    if (typeof window !== "undefined" && window.electronAPI) {
        return window.electronAPI.generateDiversion(fact, abstraction);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_RESPONSES.diversion;
}

export async function generateSummary(content: string): Promise<string> {
    if (typeof window !== "undefined" && window.electronAPI) {
        return window.electronAPI.generateSummary(content);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_RESPONSES.summary;
}
