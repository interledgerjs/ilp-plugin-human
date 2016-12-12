'use strict'
const EventEmitter = require('events')
const uuid = require('uuid4')

// for validating transfer fields
class InvalidFieldsError extends Error {
  constructor () {
    super()
    this.name = 'InvalidFieldsError'
  }
}

const checkTransfer = (transfer) => {
  checkAmount(transfer.amount)
  if (!transfer.account) {
    throw new InvalidFieldsError('transfer must have an "account"')
  } else if (!transfer.id) {
    throw new InvalidFieldsError('transfer must have an "id"')
  } else if (transfer.executionCondition || transfer.expiresAt) {
    throw new InvalidFieldsError('this plugin only supports optimistic mode')
  }
}

const checkAmount = (amount) => {
  if (isNaN(+amount)) {
    throw new InvalidFieldsError('amount "' + amount + '" is not a valid number')
  } else if (+amount <= 0) {
    throw new InvalidFieldsError('amount "' + amount + '" must be greater than 0')
  }
}

class PluginHuman extends EventEmitter {
  constructor (opts) {
    super()

    this._connected = false

    this._account = opts.account
    this._prefix = opts.prefix
    this._info = opts.info
  }

  connect () {
    this._connected = true
    return Promise.resolve(null)
  }

  disconnect () {
    this._connected = false
    return Promise.resolve(null)
  }

  isConnected () {
    return this._connected
  }

  getInfo () {
    return Promise.resolve(this._info)    
  }

  getPrefix () {
    return Promise.resolve(this._prefix)
  }

  getAccount () {
    return Promise.resolve(this._prefix + this._account)
  }

  getBalance () {
    return Promise.resolve('0')
  }

  send (transfer) {
    return new Promise((resolve) => {
      checkTransfer(transfer)
      this.emit('outgoing_transfer', transfer)
      resolve(null)
    })
  }

  // special method to simulate incoming funds
  receiveAmount (amount) {
    return new Promise((resolve) => {
      checkAmount(amount)
      this.emit('incoming_transfer', {
        id: uuid(),
        amount: amount,
        // there is only one account on plugin human
        account: this._account
      })
      resolve(null)
    })
  }
}

module.exports = PluginHuman