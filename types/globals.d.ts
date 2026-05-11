export {}

export type Roles = "admin" | "user";

declare module "*.css";

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles;
        }
    }
}
