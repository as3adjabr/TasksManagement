export class AuthResponse {
  constructor(
    public idToken: string,
    public email: string,
    public refreshToken: string,
    private _expiresIn: string,
    private _localId: string,
    public registered?: string
  ) {}
  get localId() {
    return this._localId;
  }
  get expiresIn() {
    return this._expiresIn;
  }
}
