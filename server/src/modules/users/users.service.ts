import {Injectable, Logger} from "@nestjs/common";
import {User} from "./entities/user.entity";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    private readonly users: User[] = [];

    async create(createUserDto: CreateUserDto): Promise<User> {
        const newUser: User = {
            id: Date.now().toString(),
            ...createUserDto,
        };
        this.users.push(newUser);
        return newUser;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find((user) => user.email === email);
    }

    async findById(id: string): Promise<User | undefined> {
        return this.users.find((user) => user.id === id);
    }
}