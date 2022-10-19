import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC84DsWrQDLvVXVCS01kmeMqFYqmi1z5zfsFOcHECRSyDnGMllGivuuY8boS5OlEkFckhGJsqKEZwOHTvNQV4mltBosyi/X9qi7lRYg0dzG5Fj2Ytgtp24w11TnNx32ZV6/7/tkHNUakSZ6f4yJ8lFcA3Nin9TtIHuDj/Y6hSBGCQIDAQAB'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

