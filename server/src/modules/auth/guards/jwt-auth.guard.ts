import {
    CanActivate,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from "@nestjs/common";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token is required');
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new InternalServerErrorException('JWT_SECRET is not configured on server');
        }

        try {
            const decoded = jwt.verify(token, secret) as unknown as { sub: string; email: string };
            request.user = { id: decoded.sub, email: decoded.email };
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}