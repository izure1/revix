import type { SubscribeCallback } from '../signal/Signal'
import { RealmCollection } from '../realm/RealmCollection'
import { Signal } from '../signal/Signal'

declare class RealmConnector {
  /**
   * Get or create a variable for this realm. If this variable has never been used before, it will create a new variable with this value. Otherwise, get an existing variable.
   * @param key Variable name
   * @param initialValue The initial value. If this variable has never been used before, it will create a new variable with this value.
   */
  use<T>(key: string, initialValue: T): [
    /**
     * Get a value
     */
    () => T,
    /**
     * Set a value
     * @param value New value
     * @param reason Updating reason. If you are using a `subscribe` function, you can receive a reason when the value is updated.
     */
    (value: T, reason?: string) => T,
    /**
     * Destroy a variable.
     * 
     * **WARNING!** You can't use a same name of variable after destroyed. You should use this function when you are sure the variable will never be used again.
     * @param reason Destruction reason
     */
    (reason?: string) => void,
    /**
     * You can register subscribe callbacks to watch this variable change.
     * If the variable is changed, all subscribe callbacks will be called.
     * @param callback callback function
     */
    (callback: SubscribeCallback<T>) => void
  ]
  /**
   * Returns `true` if a variable exists in the realm, or `false` if not.
   * @param key Variable name
   */
  exists(key: string): boolean
}

/**
 * Get or create a realm for this scope.
 * If this realm has never been used before, it will create a new realm with this value. Otherwise, get an existing realm.
 * @param scope The scope of the realm. You can use both primitive types and plain objects.
 */
export function openRealm(scope: any): RealmConnector {
  const realm = RealmCollection.GetOrCreate(scope)

  const _getOrCreateSignal = <T>(key: string, initialValue: T) => {
    if (!realm.hasSignal(key)) {
      const signal = new Signal<T>(realm, key, initialValue)
      realm.setSignal(signal)
    }
    const signal = realm.getSignal(key) as Signal<T>
    return signal
  }

  const _createCommand = <T>(signal: Signal<T>) => {
    const getter = () => signal.get()
    const setter = (value: T, reason = 'Unknown reason') => signal.set(value, reason)
    const destroyer = (reason = 'Unknown reason') => signal.destroy(reason)
    const subscriber = (callback: SubscribeCallback<T>) => signal.subscribe(callback)

    return {
      getter,
      setter,
      destroyer,
      subscriber,
    }
  }

  const use = <T>(key: string, initialValue: T) => {
    const signal = _getOrCreateSignal(key, initialValue)
    const { getter, setter, destroyer, subscriber } = _createCommand(signal)
    return [
      getter,
      setter,
      destroyer,
      subscriber
    ] as [typeof getter, typeof setter, typeof destroyer, typeof subscriber]
  }

  const exists = (key: string) => realm.hasSignal(key)

  return {
    use,
    exists,
  }
}

/**
 * Destroy the realm. All variables belonging to this realm are also destroyed.
 * @param scope The scope of the realm. You can use both primitive types and plain objects.
 * @param reason Destruction reason
 */
export function destroyRealm(scope: any, reason: string): boolean {
  if (!RealmCollection.Has(scope)) {
    return false
  }
  RealmCollection.Get(scope)!.destroy(reason)
  RealmCollection.Remove(scope)
  return true
}