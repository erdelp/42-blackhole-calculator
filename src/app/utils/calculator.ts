import { milestoneData, WARNING_THRESHOLD } from './constants';

export const validateNumberInput = (value: string): number => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(cleanValue) || 0;
    return numValue > 180 ? 180 : numValue;
};

interface CalculationInput {
    cursusBeginDate: string;
    milestone: string;
    freezeDays: number | string;
    campusName: string;
}

interface CalculationResult {
    deadlineDate: Date;
    daysRemaining: number;
    isOverdue: boolean;
    isInDanger: boolean;
}

export const calculateBlackholeData = ({
    cursusBeginDate,
    milestone,
    freezeDays,
    campusName
}: CalculationInput): CalculationResult | null => {
    if (!cursusBeginDate || !milestone || isNaN(parseInt(milestone))) {
        return null;
    }

    const milestoneNum = parseInt(milestone);
    if (milestoneNum < 0 || milestoneNum > 6) {
        return null;
    }

    const targetData = milestoneData.find(m => m.milestone === milestoneNum);

    if (!targetData) return null;

    const today = new Date();

    // Check if user joined before July 2025 for 42UP Move bonus (Paris campus only)
    const cursusStart = new Date(cursusBeginDate);
    const july2025 = new Date('2025-07-01');
    const isParisStudent = campusName === 'Paris';
    const isEligibleFor42UPMove = cursusStart < july2025 && isParisStudent;
    const bonusDays = isEligibleFor42UPMove ? 10 : 0;

    const freezeDaysNum = typeof freezeDays === 'string' ? (freezeDays === '' ? 0 : parseInt(freezeDays)) : freezeDays;
    const deadlineDate = new Date(cursusBeginDate);
    deadlineDate.setDate(deadlineDate.getDate() + targetData.days + freezeDaysNum + bonusDays);
    deadlineDate.setHours(23, 59, 59, 999);

    const daysRemaining = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;
    const isInDanger = daysRemaining <= WARNING_THRESHOLD && daysRemaining >= 0;

    return {
        deadlineDate,
        daysRemaining,
        isOverdue,
        isInDanger
    };
};
