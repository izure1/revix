import { Destroyable } from '../utils/Destroyable'
import { Signal } from '../signal/Signal'

export class Realm extends Destroyable {
  readonly scope: any
  readonly signals: Map<string, Signal>

  constructor(scope: any) {
    super()
    this.scope = scope
    this.signals = new Map()
  }

  /**
   * Set signal into realm.
   * @param signal The signal instance
   */
  setSignal(signal: Signal): void {
    this.checkDestroy()
    if (this.signals.has(signal.key)) {
      throw new Error(`The signal '${signal.key}' is already existing.`)
    }
    this.signals.set(signal.key, signal)
  }
  
  /**
   * If signal is existing in realm, it will be returns `true`, otherwise `false`.
   * @param key Signal's key
   */
  hasSignal(key: string): boolean {
    this.checkDestroy()
    return this.signals.has(key)
  }

  /**
   * Return a signal instance if it already exists. Otherwise, it returns `undefined`.
   * @param key Signal's key
   */
  getSignal(key: string): Signal|undefined {
    this.checkDestroy()
    return this.signals.get(key)
  }

  /**
   * Destroy this realm instance. It will be removed from realm collections.
   * @param reason Destruction reason
   */
  destroy(reason: string): void {
    this.checkDestroy()
    super.destroy(`This realm is no longer accessible because it is destroyed: ${reason}`)
    for (const signal of this.signals.values()) {
      if (signal.isDestroyed) {
        continue
      }
      signal.destroy(reason)
    }
  }
}
