# Revix

[![](https://data.jsdelivr.com/v1/package/npm/revix/badge)](https://www.jsdelivr.com/package/npm/revix)

Manage variables with realms, scopes, and reasons.

```typescript
import { openRealm, destroyRealm } from 'revix'

const { use } = openRealm('clock')

const [count, setCount, subsCount, destroyCount] = use('count', 0)

subsCount(({ before, after, reason }) => {
  console.log(`Updated to ${after} from ${before} cause ${reason}`)
})

count() // 0
setCount(count()+1, 'updating test')
// Logging: Updated to 1 from 0 cause updating test
count() // 1
```

## Why use `Revix`?

`Revix` is a JavaScript library that manages variables in units called realms. `Revix` treats variables as plain objects with states, and allows you to subscribe to changes in variable values.

`Revix` helps you to define the scope and dependency of variables clearly, track state changes easily, and improve the readability and maintainability of your code.

### **Manage realm**

`openRealm`(scope: `any`)

Get or create a realm for this scope.
If this realm has never been used before, it will create a new realm with this value. Otherwise, get an existing realm.

```typescript
const { use, exists } = openRealm('realm name')
// or
const actor = new Actor()
const { use, exists } = openRealm(actor)
```

`destroyRealm`(scope: `any`)

Destroy the realm. All variables belonging to this realm are also destroyed.

### **Realm functions**

`use`(key: `string`, initialValue: `T`): [`getter`, `setter`, `destroy`, `subscribe`]

Get or create a variable manager for this realm. If this variable has never been created before, it will create a new variable with a `initialValue`. Otherwise, get an existing variable manager.

```typescript
const [name, setName, subsName, destroyName] = use('name', 'baba')

name() // baba
setName('keke', 'no reason')
name() // keke

subsName(({ before, after, reason }) => {
  console.log(`The name variable did update from ${before} to ${after} because ${reason}`)
})
```

`exists`(key: `string`): `boolean`

Returns `true` if a variable exists in the realm, or `false` if not.

### **Variable manager functions**

The variable manager is an array and each item is the same as the next,

```typescript
[getter, setter, destroy, subscribe] = use(key, value)
```

`getter`(): `T`

Get a value.

`setter`(value: `T`, reason?: `string`): `T`

Set a value.

`destroy`(reason?: `string`): `void`

Destroy a variable.

**WARNING!** You can't use a same name of variable after destroyed. You should use this function when you are sure the variable will never be used again.

`subscribe`(callback: ({ before: `T`, after: `T`, reason: `string` }) => `void`): `Unsubscribe`

You can register subscribe callbacks to watch this variable change.
If the variable is changed, all subscribe callbacks will be called.

This function returns a new function that can be cancel unsubscribed. If you want, just call the returned function.

```typescript
const unsubscribe = subscribe(({ before, after, reason }) => {
  if (reason === 'destroy') {
    unsubscribe()
  }
})
```

## With TypeScript

You can use strict variable types with TypeScript.  
Just use the `openRealm` function with the generic type.

### Simple example

```typescript
interface Member {
  name: string
  age: number
}

const { use } = openRealm<Member>(memberName)
const [name, setName] = use('name', initialName)
const [age, setAge] = use('age', initialAge)
```

### Advanced usage

```typescript
interface IActor {
  hp: number
  mp: number
}

class Actor implements IActor {
  constructor() {
    const { use } = openRealm<IActor>(this)
    const [hp, setHp, subsHp, destroyHp] = use('hp', 100)
    const [mp, setMp, subsMp, destroyMp] = use('mp', 100)

    subsHp(() => {
      // ...TODO
    })
    subsMp(() => {
      // ...TODO
    })
  }

  get hp() {
    const { use } = openRealm<IActor>(this)
    const [hp] = use('hp', 100)
    return hp()
  }

  get mp() {
    const { use } = openRealm<IActor>(this)
    const [mp] = use('mp', 100)
    return mp()
  }

  gotDamage(damage: number) {
    const { use } = openRealm<IActor>(this)
    const [hp, setHp] = use('hp', 100)
    setHp(hp()-damage, 'Got a damage')
  }
}
```

Or, you can create your own store.

```typescript
// store.ts
import { openRealm } from 'revix'

interface Store {
  a: number
  b: string
  c: boolean
}

export const STORE_SYMBOL = Symbol('store')
export const { use } = openRealm<Store>(STORE_SYMBOL)

export const [a, setA, subsA, destroyA] = use('a', 0)

// another.ts
import { destroyRealm } from 'revix'
import { subsA } from './store.ts'

subsA(({ reason }) => {
  if (reason === 'unknown') {
    destroyRealm(STORE_SYMBOL, 'error')
  }
})
```

## Install

|Site|Link|
|---|---|
|**NPM**|[View](https://www.npmjs.com/package/revix)|
|**Github**|[View](https://github.com/izure1/revix)|
|**jsdelivr**|[Download](https://cdn.jsdelivr.net/npm/revix@1.x.x/dist/esm/index.min.js)|

### Node.js (commonjs)

```bash
npm i revix
```

### Browser (esmodule)

```html
<script type="module">
  import { openRealm, destroyRealm } from 'https://cdn.jsdelivr.net/npm/revix@1.x.x/dist/esm/index.min.js'
</script>
```

## License

MIT LICENSE
