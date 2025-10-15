import Cookies from 'js-cookie'
import Config from '@/settings'

const tokenKey = Config.tokenKey

export function getToken() {
  return Cookies.get(tokenKey)
}

export function setToken(token, rememberMe) {
  if (rememberMe) {
    return Cookies.set(tokenKey, token, { expires: Config.tokenExpires })
  } else {
    return Cookies.set(tokenKey, token)
  }
}

export function removeToken() {
  return Cookies.remove(tokenKey)
}
