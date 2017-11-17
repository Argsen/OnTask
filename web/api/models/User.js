/**
 * Created by Harry on 8/12/2016.
 */


module.exports = {
//  migrate: "safe",
  attributes: {
    email: {
      type: 'string',
      size: 255,
      minLength: 6,
      maxLength: 255,
      unique: true,
      required: true,
      email: true
    },
    password: {
      type: 'string',
      size: 128,
      minLength: 4,
      maxLength: 128
    },
    firstName: {
      type: 'string',
      size: 255,
      maxLength: 255
    },
    lastName: {
      type: 'string',
      size: 255,
      maxLength: 255
    },
    source: {
      type: 'string',
      size: 255,
      maxLength: 255
    },
    role: {
      model: 'role'
    },
    organisation: {
      type: 'string',
      size: 255,
      maxLength: 255
    },
    data: {
      type: 'text'
    }
  }
}
