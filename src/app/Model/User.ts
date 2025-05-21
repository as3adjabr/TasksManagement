export class User {
  constructor(
    public email: string,
    public fullName: string,
    public PhoneNumber: string,
    public address: string,
    public idToken: string,
    public expiresIn: string,
    public localId: string
  ) {}
}
