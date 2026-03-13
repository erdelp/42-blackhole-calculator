export interface MilestoneData {
  milestone: number;
  days: number;
}

export interface User {
  id?: string;
  login?: string;
  name?: string;
  authenticated?: boolean;
}
