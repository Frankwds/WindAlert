const windDirectionMapping: { [key: string]: { min: number; max: number } } = {
    'N': { min: 337.5, max: 22.5 },
    'NE': { min: 22.5, max: 67.5 },
    'E': { min: 67.5, max: 112.5 },
    'SE': { min: 112.5, max: 157.5 },
    'S': { min: 157.5, max: 202.5 },
    'SW': { min: 202.5, max: 247.5 },
    'W': { min: 247.5, max: 292.5 },
    'NW': { min: 292.5, max: 337.5 }
};

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
