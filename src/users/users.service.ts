import { Injectable } from '@nestjs/common';

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 1,
      name: 'Marius',
      email: 'marius@gmai.com',
      password: 'sosecure',
    },
    {
      id: 1,
      name: 'Daniel',
      email: 'daniel@gmail.com',
      password: 'password',
    },
    {
      id: 1,
      name: 'Romeo',
      email: 'romeo@gmail.com',
      password: 'password',
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
