import { createLogger, format, transports } from 'winston';

const { printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        myFormat,
    ),
    defaultMeta: { service: 'volar' },
    transports: [
        new transports.File({ filename: './.volar.error.log', level: 'error' }),
        new transports.File({ filename: './.volar.log'}),
    ]
});

export default logger;
