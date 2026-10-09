import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

@Injectable()
export class AuthService {
    constructor(private readonly users: UsersService) {}

    async register(dto: RegisterDto) {
        const email = dto.email.toLowerCase();

        if (await this.users.findByEmail(email)) {
            throw new ConflictException('Email already exists');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.users.create({ email, passwordHash, name: dto.name });
        return this.toAuthResponse(user);
    }

    async login(dto: LoginDto) {
        const email = dto.email.toLowerCase();
        const user = await this.users.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const matches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!matches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return this.toAuthResponse({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }

    private toAuthResponse(user: { id: string; email: string; name: string | null }) {
        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        return {
            user: {
                id: user.id,
                username: user.name ?? '',
                email: user.email,
            },
            token,
        };
    }
}
