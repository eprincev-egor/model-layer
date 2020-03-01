
export default class Walker {
    private exited: boolean;
    private continued: boolean;

    exit(): void {
        this.exited = true;
    }

    isExited(): boolean {
        return this.exited;
    }

    continue(): void {
        this.continued = true;
    }

    isContinued(): boolean {
        return this.continued;
    }
}
