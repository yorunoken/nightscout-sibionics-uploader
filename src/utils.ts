import { nightscoutHeaders, nightscoutUrl, sibionicsHeaders, sibionicsUrl } from "./consts";
import type { NightscoutEntry, SibionicsAuth, SibionicsEntry } from "./types";

const unitConvert = 18.018;

export async function getSibionicsEntries(sibionicsApiKey: string): Promise<SibionicsEntry | null> {
    const data = await fetch(`${sibionicsUrl}/user/app/follow/deviceGlucose`, {
        method: "POST",
        headers: {
            authorization: sibionicsApiKey,
            ...sibionicsHeaders,
        },
        body: JSON.stringify({
            range: "24",
            id: process.env.SIBIONICS_USER_ID?.toString(),
        }),
    });

    if (!data.ok) {
        return null;
    }

    return data.json() as Promise<SibionicsEntry>;
}

export async function getSibionicsApiKey() {
    const res = await fetch(`${sibionicsUrl}/auth/app/user/login`, {
        method: "POST",
        headers: {
            lang: "en_US",
            timezone: "Europe/Istanbul",
            "content-type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
            email: process.env.SIBIONICS_LOGIN,
            password: process.env.SIBIONICS_PASSWORD,
        }),
    });

    const data = (await res.json()) as SibionicsAuth;

    return {
        accessKey: data.data.access_token,
        expiresIn: data.data.expires_in,
    };
}

export async function getLastNightscoutEntry() {
    const url = `${nightscoutUrl}api/v1/slice/entries/dateString/sgv/.*/.*?count=1`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: nightscoutHeaders,
        });

        console.log("Nightscout get last entry date:", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as Array<NightscoutEntry>;

        if (data.length === 0) {
            console.log("No entries found in Nightscout");
            return null;
        }

        const firstEntry = data[0]!;
        const lastDate = firstEntry.date;

        console.log("Last entry date:", lastDate, "( GMT", new Date(lastDate).toISOString(), ")");

        return firstEntry;
    } catch (error) {
        console.error("Failed to get last entry date:", error);
        throw error;
    }
}

export async function uploadNightscoutEntry(entries: NightscoutEntry[]): Promise<void> {
    // console.log("entries: ", entries);
    const url = `${nightscoutUrl}api/v1/entries`;

    try {
        console.log("before");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                ...nightscoutHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(entries),
        });
        console.log("after");

        if (response.ok) {
            console.log("Nightscout post entries:", response.status, response.statusText);
            console.log(`${entries.length} entries uploaded.`);
        } else {
            console.error("POST Failed.", response.status, response.statusText);
            throw new Error(`Upload failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to upload entries:", error);
        throw error;
    }
}

type Directions = -2 | -1 | 0 | 1 | 2;
export function processDirection(direction: Directions) {
    switch (direction) {
        case -2:
            return "SingleDown";
        case -1:
            return "FortyFiveDown";
        case 0:
            return "Flat";
        case 1:
            return "FortyFiveUp";
        case 2:
            return "SingleUp";
    }
}

export function convertToMgdl(mmol: number) {
    return Math.round(mmol * unitConvert);
}

export function convertToMmol(mgdl: number) {
    return Math.round(mgdl / unitConvert);
}
