
export default class Walker {
    private exited: boolean = false;
    private continued: boolean = false;

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
