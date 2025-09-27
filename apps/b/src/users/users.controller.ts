import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  getAll() {
    return this.users.findAll();
  }

  @Post()
  create(@Body() body: { email: string; name?: string }) {
    return this.users.create(body);
  }
}
