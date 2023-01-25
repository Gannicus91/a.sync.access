/**
 * Тип описывает пересечение переданного типа `T` и `Promise<T>`
 */
export type Promisify<T> =
	T extends Null
		? PromisifyNull<T>
		: T extends string
			? PromisifyString
			: T extends number
				? PromisifyNumber
				: T extends boolean
					? PromisifyBoolean
					: T extends symbol
						? PromisifySymbol
						: T extends (...args: any) => any
							? PromisifyFunction<T>
							: T extends any[]
								? PromisifyArray<T>
								: PromisifyObject & {[K in Keys<T>]: Promisify<T[K]>} & Promise<T>;

/**
 * Тип прототипа `Object`
 */
type Obj = typeof Object.prototype

/**
 * Тип обобщающий синонимы null
 */
type Null = undefined | null | void

/**
 * Тип описывает объединение ключей T
 */
type Keys<T> = keyof T;

/**
 * Хелпер выводит тип элементов массива
 */
type GetElementType<T extends any[]> = T extends (infer U)[] ? U : never;

/**
 * Обертка `Promise` над `Null` типом
 */
type PromisifyNull<T extends Null> = Promise<T>

/**
 * Пересечение `Number` и `Promise`
 */
type PromisifyNumber = {
	[K in Keys<number>]: Promisify<number[K]>
} & Promise<number>

/**
 * Пересечение `String` и `Promise`
 */
type PromisifyString = {
	[K in Keys<string>]: Promisify<string[K]>
} & Promise<string>

/**
 * Пересечение `Boolean` и `Promise`
 */
type PromisifyBoolean = {
	[K in Keys<boolean>]: Promisify<boolean[K]>
} & Promise<boolean>

/**
 * Пересечение `Symbol` и `Promise`
 */
type PromisifySymbol = {
	[K in Keys<symbol>]: Promisify<symbol[K]>
} & Promise<symbol>

/**
 * Модифицирует возвращаемое значение функции с `Promisify`
 */
type PromisifyFunction<T extends (...args: any) => any> = (...args: Parameters<T>) => Promisify<ReturnType<T>>

/**
 * Пересечение `Array` и `Promise`
 */
type PromisifyArray<T extends any[]> = {
	[K in Keys<Array<GetElementType<T>>>]: Promisify<Array<GetElementType<T>>[K]>
} & Promise<Array<GetElementType<T>>>

/**
 * Обертка полей и свойств `Object.prototype` в `Promisify`
 */
type PromisifyObject = {
	[K in Keys<Obj>]: Promisify<Obj[K]>
}
