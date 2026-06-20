export interface User {
    username: string;
    password?: string;
    email?: string;
}
export interface UserStorage extends Required<User> {}
