import { Realm } from './Realm'

export class RealmCollection {
  private static readonly _List = new Map<any, Realm>()

  static Has(scope: any): boolean {
    return RealmCollection._List.has(scope)
  }

  static Get(scope: any): Realm|undefined {
    return RealmCollection._List.get(scope)
  }

  static Set(scope: any, realm: Realm): void {
    RealmCollection._List.set(scope, realm)
  }

  static GetOrCreate(scope: any): Realm {
    if (!RealmCollection.Has(scope)) {
      RealmCollection.Set(scope, new Realm(scope))
    }
    return RealmCollection.Get(scope) as Realm
  }

  static Remove(scope: any): boolean {
    return RealmCollection._List.delete(scope)
  }
}
