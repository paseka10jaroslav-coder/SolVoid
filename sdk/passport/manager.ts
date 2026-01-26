
export interface ScoreSnapshot {
    timestamp: number;
    score: number;
}

export interface PrivacyBadge {
    name: string;
    icon: string;
    description: string;
    dateEarned: number;
}

export interface PrivacyPassport {
    walletAddress: string;
    overallScore: number;
    scoreHistory: ScoreSnapshot[];
    badges: PrivacyBadge[];
    recommendations: string[];
}

const isBrowser = typeof window !== 'undefined';

export class PassportManager {
    private storagePath: string;
    private memoryCache: Record<string, any> = {};

    constructor(storagePath: string = './privacy-passport.json') {
        this.storagePath = storagePath;
    }

    private readStorage(): any {
        if (isBrowser) {
            const data = localStorage.getItem('solvoid_passport');
            return data ? JSON.parse(data) : {};
        } else {
            try {
                const fs = require('fs');
                if (fs.existsSync(this.storagePath)) {
                    return JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
                }
            } catch (e) {
                // fs not available or file error
            }
            return this.memoryCache;
        }
    }

    private writeStorage(data: any) {
        if (isBrowser) {
            localStorage.setItem('solvoid_passport', JSON.stringify(data));
        } else {
            try {
                const fs = require('fs');
                fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
            } catch (e) {
                this.memoryCache = data;
            }
        }
    }

    /**
     * Load or create a new privacy passport for the given wallet.
     */
    public getPassport(address: string): PrivacyPassport {
        const data = this.readStorage();
        return data[address] || this.initializePassport(address);
    }

    /**
     * Update history and trigger badge checks based on latest audit.
     */
    public updateScore(address: string, newScore: number) {
        const passport = this.getPassport(address);
        passport.overallScore = newScore;
        passport.scoreHistory.push({
            timestamp: Date.now(),
            score: newScore
        });

        this.checkBadges(passport);
        this.savePassport(address, passport);
    }

    private initializePassport(address: string): PrivacyPassport {
        return {
            walletAddress: address,
            overallScore: 100,
            scoreHistory: [],
            badges: [],
            recommendations: ["Perform your first privacy scan to earn the 'First Contact' badge."]
        };
    }

    /**
     * Milestone-based badge logic.
     */
    private checkBadges(passport: PrivacyPassport) {
        const badgesToAdd: PrivacyBadge[] = [];

        if (passport.overallScore >= 95 && !passport.badges.some(b => b.name === "Zero-Trace Master")) {
            badgesToAdd.push({
                name: "Zero-Trace Master",
                icon: "🛡️",
                description: "Maintained a privacy score above 95.",
                dateEarned: Date.now()
            });
        }

        if (passport.scoreHistory.length > 5 && !passport.badges.some(b => b.name === "Consistent Ghost")) {
            badgesToAdd.push({
                name: "Consistent Ghost",
                icon: "👻",
                description: "Performed more than 5 successful privacy audits.",
                dateEarned: Date.now()
            });
        }

        passport.badges.push(...badgesToAdd);
    }

    private savePassport(address: string, passport: PrivacyPassport) {
        const allData = this.readStorage();
        allData[address] = passport;
        this.writeStorage(allData);
    }
}
