import { Destroyable } from '../utils/Destroyable'
import { Realm } from '../realm/Realm'

export type SubscribeCallbackParam<T> = {
  /** Update reason */
  reason: string,
  /** Before value */
  before: T,
  /** After value */
  after: T
}
export type SubscribeCallback<T> = (param: SubscribeCallbackParam<T>) => void

export class Signal<T = any> extends Destroyable {
  readonly realm: Realm
  readonly key: string
  readonly _subscribes: SubscribeCallback<T>[]
  value: T

  constructor(realm: Realm, key: string, value: T) {
    super()
    this.realm = realm
    this.key = key
    this.value = value
    this._subscribes = []
  }

  private _checkValid(): void {
    this.checkDestroy()
  }

  private _fire(reason: string, before: T, after: T): void {
    for (const callback of this._subscribes) {
      callback({ reason, before, after })
    }
  }

  private _clearSubscribes(): void {
    this._subscribes.length = 0
  }

  /**
   * Return a signal's value.
   * @returns Signal's value
   */
  get(): T {
    this._checkValid()
    return this.value
  }

  /**
   * Update signal's value.
   * @param value New value
   * @param reason Update reason
   * @returns New Value
   */
  set(value: T, reason: string): T {
    this._checkValid()
    const before = this.value
    const after = value
    if (before !== after) {
      this.value = after
      this._fire(reason, before, after)
    }
    return after
  }

  /**
   * Add Subscribe callback function to signal.
   * When `set` method called, all callbacks will be called by order.
   * @param callback Callback function
   */
  subscribe(callback: SubscribeCallback<T>): void {
    this._checkValid()
    this._subscribes.push(callback)
  }

  /**
   * Remove subscribe callback function from signal.
   * @param callback Added Callback function
   */
  unsubscribe(callback: SubscribeCallback<T>): void {
    this._checkValid()
    const i = this._subscribes.indexOf(callback)
    if (i !== -1) {
      this._subscribes.splice(i, 1)
    }
  }
  
  /**
   * Destroy this instance.
   * You can pass a destruction reason, and this reason will be shown as an error message when signal's method calls after it is destroyed.
   * 
   * **WARNING!** This method doesn't remove the signal instance from the realm. You should use this method when you are sure the signal instance will never be used again.
   * @param reason Destruction reason
   */
  destroy(reason: string): void {
    super.destroy(`The variable '${this.key}' is no longer accessible because it is destroyed: ${reason}`)
    this._clearSubscribes()
  }
}
