import {IsEmail, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10)
    @MaxLength(72)
    password: string;

    @IsOptional()
    @IsString()
    name?: string;
}