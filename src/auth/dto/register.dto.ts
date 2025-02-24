import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {

    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    @MaxLength(20, { message: 'El nombre de usuario no puede tener más de 20 caracteres' })
    username: string;

    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(30, { message: 'La contraseña no puede tener más de 30 caracteres' })
    @Matches(/(?=.*[A-Z])(?=.*\d)/, {
        message: 'La contraseña debe contener al menos una letra mayúscula y un número'
    })
    password: string;
}
