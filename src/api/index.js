import axios from 'axios'

// 请求登录
export const reqLogin = (loginForm) => axios.post('login', loginForm)
// 请求菜单列表
export const reqMenuList = () => axios.get('menus')
// 请求用户列表
export const reqUsers = (queryInfo) => axios.get('users', { params: queryInfo })
// 请求修改用户状态
export const reqChangeUserState = (userInfo) => axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
// 请求添加用户
export const reqAddUser = (addForm) => axios.post('users', addForm)
// 请求用户信息
export const reqUserInfoById = (id) => axios.get(`users/${id}`)
// 请求修改用户信息
export const reqEditUserInfo = (editForm) => axios.put(
  `users/${editForm.id}`,
  { email: editForm.email, mobile: editForm.mobile }
)
// 请求删除用户
export const reqDeleteUserById = (id) => axios.delete(`users/${id}`)
