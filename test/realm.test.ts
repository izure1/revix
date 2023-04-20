import { openRealm, destroyRealm } from '../src/index'

describe('Realm', () => {
  let a: ReturnType<typeof openRealm>
  let b: ReturnType<typeof openRealm>
  beforeEach(() => {
    if (a) destroyRealm('a', 'test done')
    if (b) destroyRealm('b', 'test done')
    a = openRealm('a')
    b = openRealm('b')
  })

  test('signal update', () => {
    const [av, setAV] = a.use('v', 1)
    const [bv, setBV] = b.use('v', 2)

    expect(av()).toBe(1)
    expect(setAV(av()+1)).toBe(2)

    expect(bv()).toBe(2)
    expect(setBV(bv()+2)).toBe(4)
  })

  test('signal destroy', () => {
    const [_av, setAV, destroyAV] = a.use('v', 1)
    const [bv] = b.use('v', 2)

    destroyAV()
    expect(() => setAV(0)).toThrowError()
    expect(bv()).toBe(2)
  })

  test('signal exists', () => {
    expect(a.exists('v')).toBe(false)
    a.use('v', 1)
    expect(a.exists('v')).toBe(true)
  })

  test('destroy', () => {
    const [av] = a.use('v', 1)
    destroyRealm('a', 'realm down')
    expect(() => av()).toThrowError()
  })

  test('subscribe', () => {
    const [v, setV, destroyV, subsV] = a.use('v', 1)

    subsV(({ before, after, reason }) => {
      expect(before).toBe(1)
      expect(after).toBe(2)
      expect(reason).toBe('test')
    })
    setV(2, 'test')
  })

  test('cancel subscribe', () => {
    const [v, setV, destroyV, subsV] = a.use('v', 1)
    let acc = 0
    const cancelSubsV = subsV(({ after }) => {
      acc = after
      if (after === 5) {
        cancelSubsV()
      }
    })
    for (let i = 0; i < 10; i++) {
      setV(i, 'test')
    }
    expect(acc).toBe(5)
  })
})
