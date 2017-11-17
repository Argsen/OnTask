module.exports = {
  attributes: {
    accessKey: {
      type: 'string'
    },
    secretKey: {
      type: 'string'
    },
    user: {
      model: 'user'
    },
    status: {
      type: 'boolean'
    },
    expireAt: {
      type: 'date'
    },
    refreshToken: {
      type: 'string'
    },

    apiTokenAccess: {
      collection: 'Api_Token_Access',
      via: 'token'
    }
  }
}
