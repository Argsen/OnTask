/**
 * Created by Harry on 8/12/2016.
 */

module.exports = {
//  migrate: "safe",
  attributes: {
    name: {
      type: 'string',
      size: 255,
      maxLength: 255,
      required: true
    },
    description: {
      type: 'text'
    },
    transfer: {
      type: 'text'
    },
    data: {
      type: 'text'
    }
  }
}
