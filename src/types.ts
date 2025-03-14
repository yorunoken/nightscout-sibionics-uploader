interface SibionicsData {
    userId: string;
    userNickName: string;
    drType: number;
    deviceId: string;
    deviceName: string;
    blueToothNum: string;
    deviceEnableTime: string;
    deviceStatus: number;
    deviceAlarmStatus: number;
    latestIndex: number;
    latestGlucoseValue: number;
    bloodGlucoseTrend: number;
    latestGlucoseTime: string;
    deviceAbnormalTime: string | null;
    deviceLastTime: string;
    glucoseInfos: Array<{
        i: number; // minutes passed since device insertion
        t: string; // timestamp
        v: number; // glucose value (mmol?)
        s: -2 | -1 | 0 | 1 | 2; // bg direction
        ast: number; // idk
        bl: number; // idk
        name: string | null; // idk
    }>;
    target: {
        upper: number;
        lower: number;
        isRec: number;
        drType: number;
    };
    errorData: any | null;
    success: boolean;
}

interface SibionicsSuccessResponse {
    timestamp: bigint;
    code: 200;
    msg: string;
    data: SibionicsData;
    errorData: any;
    success: boolean;
}

interface SibionicsUnauthorizedResponse {
    code: 401;
    msg: "Login state has expired";
}

export type SibionicsEntry = SibionicsSuccessResponse | SibionicsUnauthorizedResponse;

export interface SibionicsAuth {
    timestamp: number;
    code: number;
    msg: string;
    data: {
        access_token: string;
        expires_in: number;
    };
    errorData: null;
    success: boolean;
}

export interface NightscoutEntry {
    type: string; // "sgv"
    sgv: number; // bg I think?
    direction: string;
    device: string;
    date: number;
    dateString: string;
}
