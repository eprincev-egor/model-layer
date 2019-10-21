
export default class Walker {
    private _exited: boolean;
    private _continued: boolean;

    public exit(): void {
        this._exited = true;
    }

    public isExited(): boolean {
        return this._exited;
    }

    public continue(): void {
        this._continued = true;
    }

    public isContinued(): boolean {
        return this._continued;
    }
}