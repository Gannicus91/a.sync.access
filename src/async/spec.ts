import async from './index';

describe('async', () => {
	describe('primitive types', () => {
		it('number', () => {
			const number = async(Promise.resolve(100));
			number.toFixed().then((v) => {
				expect(v).toBe('100');
			});
		});

		it('string', () => {
			const str = async(Promise.resolve('foo'));
			str.toUpperCase().toLowerCase().then(v => {
				expect(v).toBe('foo');
			});
			str.toString().then(v => {
				expect(v).toBe('foo');
			});
		});

		it('boolean', () => {
			const bool = async(Promise.resolve(true));
			bool.then(v => {
				expect(v).toBe(true);
			});
		});

		it('symbol', () => {
			const s = Symbol('foo');
			const symbol = async(Promise.resolve(s));
			symbol.then(v => {
				expect(v).toBe(s);
			});
			symbol.description.then(v => {
				expect(v).toBe('foo');
			});
		});

		it('void', () => {
			const empty = async(Promise.resolve());
			empty.then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('undefined', () => {
			const undef = async(Promise.resolve(undefined));
			undef.then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('null', () => {
			const nullish = async(Promise.resolve(null));
			nullish.then(v => {
				expect(v).toBe(null);
			});
		});
	});

	describe('native non primitive types', () => {
		it('function', () => {
			const func = async(Promise.resolve(() => 3));

			func().then(v => {
				expect(v).toBe(3);
			});

			func().toFixed().then(v => {
				expect(v).toBe('3');
			});
		});

		it('array', () => {
			const arr = async(Promise.resolve([1,2,3]));
			arr[0].toFixed().then(v => {
				expect(v).toBe('1');
			});
			arr.slice().push(4).then(v => {
				expect(v).toBe(4);
			});
			arr.concat([4,5,6]).then(v => {
				expect(v).toEqual([1,2,3,4,5,6]);
			});
			arr.slice().then(v => {
				expect(v).toEqual([1,2,3]);
			});
			arr.values().then(v => {
				expect([...v]).toEqual([1,2,3]);
			});
			arr[Symbol.iterator]().next().then(v => {
				expect(v.value).toBe(1);
			});
		});

		it('set', () => {
			const set = async(Promise.resolve(new Set([1,2,3])));
			set.has(2).then(v => {
				expect(v).toBe(true);
			});
			set.add(4).then(v => {
				expect(v).toEqual(new Set([1,2,3,4]));
			});
			set.values().then(v => {
				expect([...v]).toEqual([1,2,3,4]);
			});
			set.keys().then(v => {
				expect([...v]).toEqual([1,2,3,4]);
			});
		});

		it('map', () => {
			const originalMap = new Map([['f', 3], ['a', 2]]);
			const map = async(Promise.resolve(originalMap));
			map.entries().then(v => {
				expect([...v]).toEqual([['f', 3], ['a', 2]]);
			});
			map.values().then(v => {
				expect([...v]).toEqual([3,2]);
			});
			map.keys().then(v => {
				expect([...v]).toEqual(['f', 'a']);
			});

			// eslint-disable-next-line no-prototype-builtins
			map.isPrototypeOf(Object.create(originalMap)).then(v => {
				expect(v).toBe(true);
			});
		});

		it('weak map', () => {
			const obj = {};
			const asyncObj = async(Promise.resolve(new WeakMap([[obj, 3]])));
			asyncObj.get(obj).then(v => {
				expect(v).toEqual(3);
			});
		});
	});

	describe('collision', () => {
		it('primitive', () => {
			const number = async(Promise.resolve(4));
			number.valueOf().then(v => {
				expect(v).toBe(4);
			});
			number.toString().then(v => {
				expect(v).toBe('4');
			});
		});

		it('object', () => {
			const obj = {b:3};
			const asyncObj = async(Promise.resolve(obj));
			asyncObj.valueOf().then(v => {
				expect(v).toEqual({b:3});
			});
			asyncObj.toString().then(v => {
				expect(v).toBe('[object Object]');
			});
			// eslint-disable-next-line no-prototype-builtins
			asyncObj.isPrototypeOf(Object.create(obj)).then(v => {
				expect(v).toBe(true);
			});
			async(Promise.resolve({toString:()=>'my obj'})).toString().then(v => {
				expect(v).toBe('my obj');
			});
		});

		it('promise', () => {
			const promiseLike = async(Promise.resolve({then: () => 3, catch: () => 0}));
			promiseLike.then(v => {
				expect(v).toEqual({then: () => 3});
			});
			promiseLike.then().then(v => {
				expect(v).toBe(3);
			});
			promiseLike.catch().then(v => {
				expect(v).toBe(0);
			});
		});

		it('promise reject', () => {
			const asyncErr = async(Promise.resolve({fn(): void{
				throw 1;
			}}));
			asyncErr.fn().catch(v => {
				expect(v).toBe(1);
			});
			const promise = async(new Promise<void>((_, reject) => {
				reject(0);
			}));
			promise.then().catch(v => {
				expect(v).toBe(0);
			});
		});
	});

	describe('custom types', () => {
		it('object', () => {
			const obj = {
				v: {b:4},
				fn(): {b: number}{
					return this.v;
				},
			};
			const asyncObj = async(Promise.resolve(obj));
			asyncObj.v.b.then(v => {
				expect(v).toBe(4);
			});

			asyncObj.fn().then(v => {
				expect(v).toEqual({b:4});
			});

			asyncObj.v.b.toFixed().toLowerCase().then(v => {
				expect(v).toBe('4');
			});
		});

		it('object fn complicated', () => {
			const obj = {
				v: {b:4},
				fn(a: number): string {
					return this.v.b + a + 'foo';
				},
			};
			const asyncObj = async(Promise.resolve(obj));

			asyncObj.fn(3).then(v => {
				expect(v).toBe('7foo');
			});

			asyncObj.fn(3).toLowerCase().toUpperCase().then(v => {
				expect(v).toBe('7FOO');
			});
		});

		it('object fn returns object', () => {
			const obj = {
				v: {b:4},
				fn(): {a: number, f: () => string}{
					return {
						a: 3,
						f(): string {
							return this.a + 'fff';
						}};
				},
			};
			const asyncObj = async(Promise.resolve(obj));

			asyncObj.fn().f().then(v => {
				expect(v).toBe('3fff');
			});

			asyncObj.fn().f().toLowerCase().toUpperCase().then(v => {
				expect(v).toBe('3FFF');
			});
		});

		it('object undefined', () => {
			const obj = {
				p: undefined,
			};
			const asyncObj = async(Promise.resolve(obj));

			asyncObj.p.then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('object void fn', () => {
			const obj = {
				p(): void {
					console.log(3);
				},
			};

			const asyncObj = async(Promise.resolve(obj));

			asyncObj.p().then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('array in object', () => {
			async(Promise.resolve({user: {name: ['Andrey', 'Kobets']}})).user.name[0].toLowerCase().then(v => {
				expect(v).toBe('andrey');
			});
		});
	});
});
