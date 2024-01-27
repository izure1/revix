import type { SubscribeCallback } from '../signal/Signal'
import { RealmCollection } from '../realm/RealmCollection'
import { Signal } from '../signal/Signal'

interface RealmConnectorList extends Record<string, any> {}
interface DefaultRealmConnectorList extends RealmConnectorList {
  [key: string]: any
}
/**
 * Unsubscribe value updating.
 * If you call this function, the subscript that returned this function will be canceled.
 * @example
 * const unsubscribe = subsVar(({ before, after, reason }) => { ... })
 * unsubscribe()
 */
export declare function Unsubscribe(): void

export declare class IRealmConnector<R extends RealmConnectorList = DefaultRealmConnectorList> {
  /**
   * Get or create a variable for this realm. If this variable has never been used before, it will create a new variable with this value. Otherwise, get an existing variable.
   * @param key Variable name
   * @param initialValue The initial value. If this variable has never been used before, it will create a new variable with this value.
   */
  use<K extends keyof R>(key: K, initialValue: R[K]): [
    /**
     * Get a value
     */
    () => R[K],
    /**
     * Set a value
     * @param value New value
     * @param reason Updating reason. If you are using a `subscribe` function, you can receive a reason when the value is updated.
     */
    (value: R[K], reason?: string) => R[K],
    /**
     * You can register subscribe callbacks to watch this variable change.
     * If the variable is changed, all subscribe callbacks will be called.
     * This function returns a new function that can be cancel unsubscribed. If you want, just call the returned function.
     * @example
     * const unsubscribe = subsVar(({ before, after, reason }) => { ... })
     * unsubscribe()
     * @param callback callback function
     */
    (callback: SubscribeCallback<R[K]>) => typeof Unsubscribe,
    /**
     * Destroy a variable.
     * 
     * **WARNING!** You can't use a same name of variable after destroyed. You should use this function when you are sure the variable will never be used again.
     * @param reason Destruction reason
     */
    (reason?: string) => void
  ]
  /**
   * Returns `true` if a variable exists in the realm, or `false` if not.
   * @param key Variable name
   */
  exists(key: keyof R): boolean
}

/**
 * Get or create a realm for this scope.
 * If this realm has never been used before, it will create a new realm with this value. Otherwise, get an existing realm.
 * @param scope The scope of the realm. You can use both primitive types and plain objects.
 */
export function openRealm<R extends RealmConnectorList = RealmConnectorList>(scope: any): IRealmConnector<R> {
  const realm = RealmCollection.GetOrCreate(scope)

  const _getOrCreateSignal = <K extends keyof R, T>(key: K, initialValue: T) => {
    const k = key as string
    if (!realm.hasSignal(k)) {
      const signal = new Signal<T>(realm, k, initialValue)
      realm.setSignal(signal)
    }
    const signal = realm.getSignal(k) as Signal<T>
    return signal
  }

  const _createCommand = <T>(signal: Signal<T>) => {
    const getter = () => signal.get()
    const setter = (value: T, reason = 'Unknown reason') => signal.set(value, reason)
    const destroyer = (reason = 'Unknown reason') => signal.destroy(reason)
    const subscriber = (callback: SubscribeCallback<T>) => {
      signal.subscribe(callback)
      const cancel = () => signal.unsubscribe(callback)
      return cancel
    }

    return {
      getter,
      setter,
      destroyer,
      subscriber,
    }
  }

  const use = <K extends keyof R, T = R[K]>(key: K, initialValue: T) => {
    const signal = _getOrCreateSignal(key, initialValue)
    const { getter, setter, destroyer, subscriber } = _createCommand(signal)
    return [
      getter,
      setter,
      subscriber,
      destroyer,
    ] as [typeof getter, typeof setter, typeof subscriber, typeof destroyer]
  }

  const exists = (key: keyof R) => realm.hasSignal(key as string)

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
