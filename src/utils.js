import * as url from 'url';
import bcrypt from 'bcrypt';

export const createHash = password => bcrypt.hashSync(password,bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)
export const generateToken = (payload, duration) => jwt.sign(payload, PRIVATE_KEY, { expiresIn: duration })

export const __filename = url.fileURLToPath(import.meta.url)
export const __dirname = url.fileURLToPath(new URL('.', import.meta.url))