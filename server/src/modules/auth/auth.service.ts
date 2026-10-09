import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {UsersService} from "../users/users.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService) {}

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST);
        }

        const user = await this.userService.create(registerDto);
        const {password, ...result} = user;

        return {
            user: result,
            token: `mock-jwt-token-${user.id}`,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user || user.password !== loginDto.password) {
            throw new HttpException("Wrong email or password", HttpStatus.BAD_REQUEST);
        }

        const { password, ...result } = user;
        return {
            user: result,
            token: `mock-jwt-token-${user.id}`,
        };
    }
}