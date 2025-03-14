import {
    convertToMgdl,
    getNightscoutEntries,
    getSibionicsEntries,
    processDirection,
    uploadNightscoutEntry,
} from "./utils";

async function run() {
    const cgmData = await getSibionicsEntries();

    if (!cgmData) {
        console.error("Couldn't get CGM data from Sibionics.");
        return;
    }

    const glucoseInfos = cgmData.data.glucoseInfos;
    console.log("cgm: ", glucoseInfos[glucoseInfos.length - 1]);

    // const nightscoutEntries = await getNightscoutEntries();
    // console.log(nightscoutEntries);
    //

    const dataNs = glucoseInfos.map((entry) => ({
        type: "sgv",
        sgv: convertToMgdl(entry.v),
        direction: processDirection(entry.s) || "Flat",
        device: "Yoru's Sibionics Uploader",
        date: new Date(Number(entry.t)).getTime(),
        dateString: new Date(Number(entry.t)).toISOString(),
    }));

    await uploadNightscoutEntry(dataNs);

    // await uploadNightscoutEntry([
    //     {
    //         type: "sgv",
    //         sgv: 134,
    //         direction: "Flat",
    //         device: "Yoru's Sibionics Uploader",
    //         date: 1741930201521,
    //         dateString: "2025-03-14T05:30:01.000Z",
    //     },
    // ]);
}

run();
