import async from './index';

describe('async', () => {
	describe('primitive types', () => {
		it('number', () => {
			const foo = async(Promise.resolve(100));
			foo.toFixed().then((v) => {
				expect(v).toBe('100');
			});
		});

		it('string', () => {
			const foo = async(Promise.resolve('foo'));
			foo.toUpperCase().toLowerCase().then(v => {
				expect(v).toBe('foo');
			});
			foo.toString().then(v => {
				expect(v).toBe('foo');
			});
		});

		it('boolean', () => {
			const foo = async(Promise.resolve(true));
			foo.then(v => {
				expect(v).toBe(true);
			});
		});

		it('symbol', () => {
			const a = Symbol('foo');
			const foo = async(Promise.resolve(a));
			foo.then(v => {
				expect(v).toBe(a);
			});
			foo.description.then(v => {
				expect(v).toBe('foo');
			});
		});

		it('void', () => {
			const foo = async(Promise.resolve());
			foo.then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('undefined', () => {
			const foo = async(Promise.resolve(undefined));
			foo.then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('null', () => {
			const foo = async(Promise.resolve(null));
			foo.then(v => {
				expect(v).toBe(null);
			});
		});
	});

	describe('native non primitive types', () => {
		it('function', () => {
			const foo = async(Promise.resolve(() => 3));

			foo().then(v => {
				expect(v).toBe(3);
			});

			foo().toFixed().then(v => {
				expect(v).toBe('3');
			});
		});

		it('array', () => {
			const a = async(Promise.resolve([1,2,3]));
			a[0].toFixed().then(v => {
				expect(v).toBe('1');
			});
			a.slice().push(4).then(v => {
				expect(v).toBe(4);
			});
			a.concat([4,5,6]).then(v => {
				expect(v).toEqual([1,2,3,4,5,6]);
			});
			a.slice().then(v => {
				expect(v).toEqual([1,2,3]);
			});
			a.values().then(v => {
				expect([...v]).toEqual([1,2,3]);
			});
		});

		it('set', () => {
			const a = async(Promise.resolve(new Set([1,2,3])));
			a.has(2).then(v => {
				expect(v).toBe(true);
			});
			a.add(4).then(v => {
				expect(v).toEqual(new Set([1,2,3,4]));
			});
			a.values().then(v => {
				expect([...v]).toEqual([1,2,3,4]);
			});
			a.keys().then(v => {
				expect([...v]).toEqual([1,2,3,4]);
			});
		});

		it('map', () => {
			const a = async(Promise.resolve(new Map([['f', 3], ['a', 2]])));
			a.entries().then(v => {
				expect([...v]).toEqual([['f', 3], ['a', 2]]);
			});
			a.values().then(v => {
				expect([...v]).toEqual([3,2]);
			});
			a.keys().then(v => {
				expect([...v]).toEqual(['f', 'a']);
			});
		});

		it('weak map', () => {
			const o = {};
			const a = async(Promise.resolve(new WeakMap([[o, 3]])));
			a.get(o).then(v => {
				expect(v).toEqual(3);
			});
		});
	});

	describe('collision', () => {
		it('primitive', () => {
			const a = async(Promise.resolve(4));
			a.valueOf().then(v => {
				expect(v).toBe(4);
			});
			a.toString().then(v => {
				expect(v).toBe('4');
			});
		});

		it('object', () => {
			const o = {b:3};
			const a = async(Promise.resolve(o));
			a.valueOf().then(v => {
				expect(v).toEqual({b:3});
			});
			a.toString().then(v => {
				expect(v).toBe('[object Object]');
			});
			// eslint-disable-next-line no-prototype-builtins
			a.isPrototypeOf(Object.create(o)).then(v => {
				expect(v).toBe(true);
			});
			async(Promise.resolve({toString:()=>'my obj'})).toString().then(v => {
				expect(v).toBe('my obj');
			});
		});

		it('promise', () => {
			const a = async(Promise.resolve({then: () => 3, catch: () => 0}));
			a.then(v => {
				expect(v).toEqual({then: () => 3});
			});
			a.then().then(v => {
				expect(v).toBe(3);
			});
			a.catch().then(v => {
				expect(v).toBe(0);
			});
		});

		it('promise reject', () => {
			const a = async(Promise.resolve({fn(): void{
				throw 1;
			}}));
			a.fn().catch(v => {
				expect(v).toBe(1);
			});
			const p = async(new Promise<void>((_, reject) => {
				reject(0);
			}));
			p.then().catch(v => {
				expect(v).toBe(0);
			});
		});
	});

	describe('custom types', () => {
		it('object', () => {
			const a = {
				v: {b:4},
				fn(): {b: number}{
					return this.v;
				},
			};
			const foo = async(Promise.resolve(a));
			foo.v.b.then(v => {
				expect(v).toBe(4);
			});

			foo.fn().then(v => {
				expect(v).toEqual({b:4});
			});

			foo.v.b.toFixed().toLowerCase().then(v => {
				expect(v).toBe('4');
			});
		});

		it('object fn complicated', () => {
			const b = {
				v: {b:4},
				fn(a: number): string {
					return this.v.b + a + 'foo';
				},
			};
			const foo = async(Promise.resolve(b));

			foo.fn(3).then(v => {
				expect(v).toBe('7foo');
			});

			foo.fn(3).toLowerCase().toUpperCase().then(v => {
				expect(v).toBe('7FOO');
			});
		});

		it('object fn returns object', () => {
			const c = {
				v: {b:4},
				fn(): {a: number, f: () => string}{
					return {
						a: 3,
						f(): string {
							return this.a + 'fff';
						}};
				},
			};
			const foo = async(Promise.resolve(c));

			foo.fn().f().then(v => {
				expect(v).toBe('3fff');
			});

			foo.fn().f().toLowerCase().toUpperCase().then(v => {
				expect(v).toBe('3FFF');
			});
		});

		it('object undefined', () => {
			const o = {
				p: undefined,
			};
			const foo = async(Promise.resolve(o));

			foo.p.then(v => {
				expect(v).toBe(undefined);
			});
		});

		it('object void fn', () => {
			const o = {
				p(): void {
					console.log(3);
				},
			};

			const foo = async(Promise.resolve(o));

			foo.p().then(v => {
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
