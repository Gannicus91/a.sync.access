import {Promisify} from './interface';

/**
 * Возвращает обертку над промисом, которая позволяет обращаться к свойствам значения,
 * с которым должен зарезолвиться промис, так, будто это значение у нас уже есть.
 * Каждое обращение к свойству или вызов метода на результате работы этой функции -
 * будет возвращать промис (также обернутый в `async`), который будет резолвиться со значением свойства или
 * рузультатом вызова метода
 *
 * @example
 * ```ts
 * async(Promise.resolve('foo')).toUpperCase().then(v => {...}) // v === 'FOO'
 * ```
 *
 * Обращение к методам, которые НЕ(!)специфичны для промисов (все кроме `then`, `catch`, `finally`)
 * не будут вызываться в контексте промиса. Такие вызовы будут возвращать промис, который будет резолвиться
 * вызовом данного метода на результате `async`
 *
 * @example
 * ```
 * // `toString()` вернет промис, который зарезолвится вызовом `({}).toString()`
 * async(Promise.resolve({})).toString().then(v => {...}) // v === '[object Object]'
 * ```
 *
 * @param value
 */
export default function async<T>(value: Promise<T>): Promisify<T> {
	return <Promisify<T>><unknown>(new Proxy(() => value, {
		get(_, prop) {
			if (
				hasKey(value, prop) &&
				typeof prop !== 'symbol' &&
				['then', 'catch', 'finally'].includes(prop)
			) {
				const propVal = getProperty(value, prop);

				if (typeof propVal === 'function') {
					return propVal.bind(value);
				}

				return propVal;
			}

			return async(value.then((v) => {
				if (v == null) {
					throw new Error(`can not read property '${String(prop)}' of ${v}`);
				}

				if (hasKey(v, prop)) {
					const val = getProperty(v, prop);

					if (typeof val === 'function') {
						return val.bind(v);
					}

					return val;
				}
			}));
		},
		apply(_, thisArg, argArray) {
			return async(value.then(v => {
				if (typeof v === 'function') {
					return v.bind(thisArg, ...argArray)();
				}

				throw new Error('Requested prop is not a function');
			}));
		},
	}));
}

/**
 * True, если `k` - свойство `obj`
 *
 * @param obj
 * @param k
 */
const hasKey = <T>(obj: T, k: string | number | symbol): k is keyof T =>
	k in Object(obj);

/**
 * Возвращает `obj[k]` если `k` - свойство `obj`
 * Иначе выбрасывает исключение
 *
 * @param obj
 * @param key
 */
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
	if (hasKey(obj, key)) { return obj[key]; }
	throw new Error(`Invalid object member "${String(key)}"`);
}
