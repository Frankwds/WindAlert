import { windDirectionMapping } from "@/lib/utils/getWindDirection";

export function isWindDirectionGood(windDirection: number, allowedDirections: string[]): boolean {
    if (allowedDirections.length === 0) {
        return true;
    }

    for (const direction of allowedDirections) {
        const range = windDirectionMapping[direction];
        if (range) {
            // Handle the case where the range crosses 360 degrees (e.g., North)
            if (range.min > range.max) {
                if (windDirection >= range.min || windDirection <= range.max) {
                    return true;
                }
            } else {
                if (windDirection >= range.min && windDirection <= range.max) {
                    return true;
                }
            }
        }
    }

    return false;
}
