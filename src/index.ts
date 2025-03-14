import {
    convertToMgdl,
    getLastNightscoutEntry,
    getSibionicsEntries,
    processDirection,
    uploadNightscoutEntry,
} from "./utils";

async function main() {
    const cgmData = await getSibionicsEntries();

    if (!cgmData) {
        console.error("Couldn't get CGM data from Sibionics.");
        return;
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
    const delay = 5 - (now.getMinutes() % 5);
    const nextRun = new Date(now.getTime() + delay * 60000);
    nextRun.setSeconds(0, 0);

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    setTimeout(() => {
        main().catch(console.error);
        setInterval(() => {
            main().catch(console.error);
        }, 5 * 60000);
    }, timeUntilNextRun);

    console.log(`Next run scheduled for: ${nextRun.toISOString()}`);
}

scheduleMain();
