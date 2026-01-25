import * as fs from 'fs';

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

export class PassportManager {
    private storagePath: string;

    constructor(storagePath: string = './privacy-passport.json') {
        this.storagePath = storagePath;
    }

    /**
     * Load or create a new privacy passport for the given wallet.
     */
    public getPassport(address: string): PrivacyPassport {
        if (!fs.existsSync(this.storagePath)) {
            return this.initializePassport(address);
        }
        const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
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
        let allData: any = {};
        if (fs.existsSync(this.storagePath)) {
            allData = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
        }
        allData[address] = passport;
        fs.writeFileSync(this.storagePath, JSON.stringify(allData, null, 2));
    }
}
