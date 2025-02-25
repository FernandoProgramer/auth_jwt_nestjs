import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";

/**
 * Filtro global para manejar excepciones en NestJS.
 * Captura y maneja errores de NestJS, Prisma y errores generales del sistema.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

    /**
    * Método auxiliar para enviar respuestas JSON uniformes.
    * @param response - Objeto de respuesta de Express.
    * @param statusCode - Código de estado HTTP.
    * @param message - Mensaje de error.
    * @returns Respuesta JSON con la estructura estandarizada.
   */
    private handleResponse(response: Response, statusCode: number, message: string) {
        return response.status(statusCode).json({
            successful: false,
            message,
            statusCode
        });
    }

    /**
    * Método principal que captura y maneja las excepciones.
    * @param exception - Excepción capturada.
    * @param host - Contexto de la solicitud HTTP.
    */
    catch(exception: any, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Manejo de excepciones específicas de NestJS
        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();

            // Extrae el mensaje de error asegurando que sea una cadena de texto
            const message = typeof exceptionResponse === 'object' && 'message' in exceptionResponse
                ? exceptionResponse.message
                : exceptionResponse;

            return response.status(exception.getStatus()).json({
                successful: false,
                message,
                statusCode: exception.getStatus()
            })
        }

        // Manejo de errores específicos de Prisma
        if (exception instanceof PrismaClientKnownRequestError) {
            const field = exception?.meta?.target?.toString().split('_');

            const message = exception.code === 'P2002' && field
                ? `The ${field[1]} already exists`
                : 'A unique constraint violation occurred'

            return this.handleResponse(response, 409, message);

        }

        // Modo Debug: imprime la excepción solo en entornos de desarrollo
        if (process.env.NODE_ENV !== 'production') {
            console.error('Exception Debugging =>> ', exception);
        }

        // // Manejo de errores generales (500 - Internal Server Error)
        return this.handleResponse(response, 500, 'Internal Server Error');

    }
}