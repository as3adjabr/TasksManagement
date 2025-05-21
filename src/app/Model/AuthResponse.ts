export class AuthResponse {
  constructor(
    public idToken: string,
    public email: string,
    public refreshToken: string,
    public _expiresIn: string,
    public _localId: string,
    public registered?: string
  ) {}
  get localId() {
    return this._localId;
  }
  get expiresIn() {
    return this._expiresIn;
  }
}
