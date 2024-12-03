declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    EMAIL_SERVER_HOST: string
    EMAIL_SERVER_PORT: string
    EMAIL_SERVER_USER: string
    EMAIL_SERVER_PASSWORD: string
    EMAIL_FROM: string
    DATABASE_URL: string
    NODE_ENV: 'development' | 'production' | 'test'
  }
} 