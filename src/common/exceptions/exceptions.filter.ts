import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";

/**
 * Global filter for handling exceptions.
 * Captures and processes errors, including HTTP exceptions, Prisma errors, and general system failures.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

    /**
     * Helper method to send a standardized JSON response.
     * 
     * @param response - Express response object.
     * @param statusCode - HTTP status code.
     * @param message - Error message.
     * @returns JSON response with a standardized structure.
     */
    private handleResponse(response: Response, statusCode: number, message: string) {
        return response.status(statusCode).json({
            successful: false,
            message,
            statusCode
        });
    }
    /**
     * Main method that captures and processes exceptions.
     * @param exception - The captured exception.
     * @param host - HTTP request context.
     */
    catch(exception: any, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Handle specific HTTP exceptions
        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();

            // Extract the error message, ensuring it is a string
            const message = typeof exceptionResponse === 'object' && 'message' in exceptionResponse
                ? exceptionResponse.message
                : exceptionResponse;

            return response.status(exception.getStatus()).json({
                successful: false,
                message,
                statusCode: exception.getStatus()
            })
        }

        // Handle specific Prisma errors
        if (exception instanceof PrismaClientKnownRequestError) {
            const field = exception?.meta?.target?.toString().split('_');

            const message = exception.code === 'P2002' && field
                ? `The ${field[1]} already exists`
                : 'A unique constraint violation occurred'

            return this.handleResponse(response, 409, message);

        }

        // Debug mode: Log the exception in non-production environments
        if (process.env.NODE_ENV !== 'production') {
            console.error('Exception Debugging =>> ', exception);
        }

        // Handle general errors (500 - Internal Server Error)
        return this.handleResponse(response, 500, 'Internal Server Error');
    }
}