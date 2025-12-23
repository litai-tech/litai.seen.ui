/**
 * Callback function type for handling serial data
 */
export type SerialDataHandler = (data: string) => void;

/**
 * Callback function type for handling serial errors
 */
export type SerialErrorHandler = (error: string) => void;
