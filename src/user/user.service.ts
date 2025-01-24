/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LogInDto, SignUpDto, UpdateDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private async getUserById(id: number) {
    if (!id) {
      throw new BadRequestException('User ID cannot be empty!');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found !`);
    }
    return user;
  }

  private handleError(error: unknown): never {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    console.log(error);
    throw new InternalServerErrorException('Unexpected error occurred!');
  }

  async signUp(signUpDto: SignUpDto): Promise<Omit<User, 'password'>> {
    try {
      const { username, password } = signUpDto;

      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        throw new ConflictException(
          `User with username ${username} is already used!`,
        );
      }

      const hashedPassword = await argon2.hash(password);
      const newUser = this.userRepository.create({
        username,
        password: hashedPassword,
      });
      const result = await this.userRepository.save(newUser);
      const { password: _, ...userWithoutPassword } = result;
      return userWithoutPassword;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logIn(
    logInDto: LogInDto,
  ): Promise<Omit<User, 'password'> & { token: string }> {
    try {
      const { username, password } = logInDto;

      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (!existingUser) {
        throw new NotFoundException(
          `User with username ${username} not found!`,
        );
      }

      const isPasswordValid = await argon2.verify(
        existingUser.password,
        password,
      );
      if (!isPasswordValid) {
        throw new ConflictException('Invalid password!');
      }

      const payload = { username: existingUser.username, sub: existingUser.id };
      const access_token = this.jwtService.sign(payload);

      const { password: _, ...userWithoutPassword } = existingUser;
      return { ...userWithoutPassword, token: access_token };
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll(): Promise<User[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      return await this.getUserById(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(UpdateDto: UpdateDto): Promise<Omit<User, 'password'>> {
    try {
      const { id, username, password, token } = UpdateDto;
      const decodedToken: { sub: number; username: string } =
        this.jwtService.verify(token);

      const userIdFromToken = decodedToken.sub;
      if (userIdFromToken !== id) {
        throw new Error('User ID mismatch with token');
      }

      const user = await this.getUserById(id);
      if (username) {
        user.username = username;
      }
      if (password) {
        user.password = await argon2.hash(password);
      }

      const result = await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = result;
      return userWithoutPassword;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.getUserById(id);
      await this.userRepository.delete(user.id);
    } catch (error) {
      this.handleError(error);
    }
  }
}
