declare module 'confetti-js' {
  interface ConfettiSettings {
    target?: string | HTMLElement;
    max?: number;
    size?: number;
    animate?: boolean;
    props?: string[];
    colors?: string[];
  }

  class ConfettiGenerator {
    constructor(settings?: ConfettiSettings);
    render(): void;
    clear(): void;
  }

  export default ConfettiGenerator;
}
