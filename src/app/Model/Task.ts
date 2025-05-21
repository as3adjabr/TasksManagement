export class Task {
  constructor(
    public title: string,
    public desc: string,
    public createdAt: string,
    public priorety: string,
    public assignedTo: string,
    public status: string,
    public id?: string
  ) {}
}
