import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12)
    password: string;
}