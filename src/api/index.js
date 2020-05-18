import ajax, { TYPE_POST } from './ajax'

export const reqLogin = (loginForm) => ajax('login', loginForm, TYPE_POST)
