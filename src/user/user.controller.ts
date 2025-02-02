import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Request, Response } from 'express';

interface RequestWithCookies extends Request {
  cookies: {
    token: string;
  };
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(
    @Body() body: { username: string; password: string },
  ): Promise<Omit<User, 'password'>> {
    return this.userService.signUp(body);
  }

  @Post('login')
  async logIn(
    @Body() body: { username: string; password: string },
    @Res() response: Response,
  ) {
    const user = await this.userService.logIn(body);
    response
      .status(200)
      .cookie('token', user.token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        path: '/',
      })
      .send(user);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(
    @Req() request: RequestWithCookies,
    @Param('id') id: number,
    @Body() body: { username: string; password: string },
  ): Promise<Omit<User, 'password'>> {
    const cookies = request.cookies;
    const accessToken = cookies.token;
    const user = {
      id,
      username: body.username,
      password: body.password,
      token: accessToken,
    };
    return this.userService.update(user);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
