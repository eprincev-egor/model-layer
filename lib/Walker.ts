
export default class Walker {
    private exited: boolean;
    private continued: boolean;

    public exit(): void {
        this.exited = true;
    }

    public isExited(): boolean {
        return this.exited;
    }

    public continue(): void {
        this.continued = true;
    }

    public isContinued(): boolean {
        return this.continued;
    }
}
