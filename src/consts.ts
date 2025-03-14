export const unitConvert = 18.018;

export const nightscoutHeaders = {
    "api-secret": process.env.NIGHTSCOUT_API_KEY!,
    "User-Agent": "Sibionics Nightscout Uploader",
    "Content-Type": "application/json",
    Accept: "application/json",
};
export const nightscoutUrl = process.env.NIGHTSCOUT_URL!;

export const sibionicsHeaders = {
    lang: "en_US",
    timezone: "Europe/Istanbul",
    "content-type": "application/json; charset=utf-8",
};
export const sibionicsUrl = "https://cgm-ce.sisensing.com";
