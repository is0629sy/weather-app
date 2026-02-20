import {
    Sun,
    CloudSun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Snowflake,
    HelpCircle,
} from "lucide-react";

export function getWeatherIcon(code: number) {
    switch (code) {
        case 0:
            return Sun; // 快晴
        case 1:
        case 2:
            return CloudSun; // 晴れ時々曇り、曇り
        case 3:
            return Cloud; // どん曇り
        case 45:
        case 48:
            return CloudFog; // 霧
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
            return CloudDrizzle; // 霧雨
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
        case 82:
            return CloudRain; // 雨、にわか雨
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            return CloudSnow; // 雪
        case 95:
        case 96:
        case 99:
            return CloudLightning; // 雷雨
        default:
            return HelpCircle; // 不明
    }
}

export function getWeatherDescription(code: number): string {
    switch (code) {
        case 0: return "快晴";
        case 1: return "概ね晴れ";
        case 2: return "一部曇り";
        case 3: return "曇り";
        case 45: return "霧";
        case 48: return "着氷性の霧";
        case 51: return "弱い霧雨";
        case 53: return "霧雨";
        case 55: return "強い霧雨";
        case 56: return "弱い着氷性の霧雨";
        case 57: return "強い着氷性の霧雨";
        case 61: return "弱雨";
        case 63: return "雨";
        case 65: return "強雨";
        case 66: return "弱い着氷性の雨";
        case 67: return "強い着氷性の雨";
        case 71: return "小雪";
        case 73: return "雪";
        case 75: return "大雪";
        case 77: return "霧雪";
        case 80: return "弱いにわか雨";
        case 81: return "にわか雨";
        case 82: return "激しいにわか雨";
        case 85: return "弱いにわか雪";
        case 86: return "強いにわか雪";
        case 95: return "雷雨";
        case 96: return "雷雨（弱ひょう）";
        case 99: return "雷雨（強ひょう）";
        default: return "不明";
    }
}
