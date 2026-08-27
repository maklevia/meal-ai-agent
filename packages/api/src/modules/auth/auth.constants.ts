import { CookieOptions } from "express"

export const SALT_ROUNDS = 10;

export const AUTH_CONSTANTS = {
    ACCESS_TOKEN_EXPIRES_IN: "5m",
    REFRESH_TOKEN_EXPIRES_IN: "7d",

    ACCESS_TOKEN_MAX_AGE: 5 * 60 * 1000,
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
}

const BASE_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
}

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE
}

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
    ...BASE_COOKIE_OPTIONS,
    path: '/api/auth/refresh',
    maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE,
}