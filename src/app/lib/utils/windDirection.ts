export const windDirectionMapping: { [key: string]: { min: number; max: number } } = {
    'N': { min: 337.5, max: 22.5 },
    'NE': { min: 22.5, max: 67.5 },
    'E': { min: 67.5, max: 112.5 },
    'SE': { min: 112.5, max: 157.5 },
    'S': { min: 157.5, max: 202.5 },
    'SW': { min: 202.5, max: 247.5 },
    'W': { min: 247.5, max: 292.5 },
    'NW': { min: 292.5, max: 337.5 }
};

export function getWindDirection(windDirection: number): string {
    for (const direction in windDirectionMapping) {
        const range = windDirectionMapping[direction];
        if (range) {
            // Handle the case where the range crosses 360 degrees (e.g., North)
            if (range.min > range.max) {
                if (windDirection >= range.min || windDirection <= range.max) {
                    return direction;
                }
            } else {
                if (windDirection >= range.min && windDirection <= range.max) {
                    return direction;
                }
            }
        }
    }

    return "Unknown";
}
