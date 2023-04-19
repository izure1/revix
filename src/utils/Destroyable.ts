export class Destroyable {
  protected _isDestroyed: boolean
  protected _destructionMessage: string

  constructor() {
    this._isDestroyed = false
    this._destructionMessage = ''
  }

  /**
   * Is this instance are destroy?
   */
  get isDestroyed(): boolean {
    return this._isDestroyed
  }

  /**
   * check the instance is destroyed.
   * If an instance is destroyed by the `destroy` method, throw the destruction reason as an error message.
   */
  protected checkDestroy(): void {
    if (this._isDestroyed) {
      throw new Error(this._destructionMessage)
    }
  }

  /**
   * Destroy this instance with reason.
   * @param message reason message
   */
  protected destroy(message: string): void {
    this.checkDestroy()
    this._isDestroyed = true
    this._destructionMessage = message
  }
}
