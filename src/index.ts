import {
    convertToMgdl,
    getLastNightscoutEntry,
    getSibionicsApiKey,
    getSibionicsEntries,
    processDirection,
    uploadNightscoutEntry,
} from "./utils";
import fs from "fs/promises";
import path from "path";

const API_KEY_FILE = path.join(__dirname, "../.api-key");

async function saveApiKey(apiKey: string) {
    await fs.writeFile(API_KEY_FILE, apiKey);
}

async function loadApiKey(): Promise<string | null> {
    try {
        const apiKey = await fs.readFile(API_KEY_FILE, "utf-8");
        return apiKey;
    } catch {
        return null;
    }
}

async function main() {
    let sibionicsApiKey = await loadApiKey();

    if (!sibionicsApiKey) {
        const data = await getSibionicsApiKey();
        sibionicsApiKey = data.accessKey;
        await saveApiKey(sibionicsApiKey);
    }

    const cgmData = await getSibionicsEntries(sibionicsApiKey);

    if (!cgmData) {
        console.error("Couldn't get CGM data from Sibionics.");
        return;
    }

    if (cgmData.code === 401) {
        const data = await getSibionicsApiKey();
        sibionicsApiKey = data.accessKey;
        await saveApiKey(sibionicsApiKey);
        return main();
    }

    const lastNightscoutEntry = await getLastNightscoutEntry();
    const lastTimestamp = lastNightscoutEntry?.date || 0;

    const glucoseInfos = cgmData.data.glucoseInfos;

    const newEntries = glucoseInfos.filter((entry) => {
        const entryTimestamp = Number(entry.t);
        return entryTimestamp > lastTimestamp;
    });

    if (newEntries.length === 0) {
        console.log("No new entries to upload");
        return;
    }

    const dataNs = newEntries.map((entry) => ({
        type: "sgv",
        sgv: convertToMgdl(entry.v),
        direction: processDirection(entry.s) || "Flat",
        device: "Yoru's Sibionics Uploader",
        date: new Date(Number(entry.t)).getTime(),
        dateString: new Date(Number(entry.t)).toISOString(),
    }));

    await uploadNightscoutEntry(dataNs);
}

function scheduleMain() {
    const now = new Date();
    const runSecs = 60;
    const delay = runSecs - now.getSeconds() + 5;
    const nextRun = new Date(now.getTime() + delay * 1000);

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    setTimeout(() => {
        main().catch(console.error);
        setInterval(() => {
            main().catch(console.error);
        }, runSecs * 1000);
    }, timeUntilNextRun);

    console.log(`Next run scheduled for: ${nextRun.toISOString()}`);
}

scheduleMain();
