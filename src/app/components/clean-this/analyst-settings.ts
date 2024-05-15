
// Define and export the enum and interface directly
export enum AnalysisType {
    Inclusivity = 'inclusivity',
    Grammar = 'grammar',
    TechnicalAccuracy = 'technicalAccuracy',
    Readability = 'readability',
    Formality = 'formality',
    Other = 'other'
}

export interface AnalysisSettings {
    type: AnalysisType;
    temperature: number;
    top_p: number;
    system: (numVersions: number, shouldExplain: boolean, shouldFormat: boolean) => string;
    examples: string[];
}