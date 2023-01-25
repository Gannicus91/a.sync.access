
/**
 * True, если `k` - свойство `obj`
 *
 * @param obj
 * @param k
 */
export const hasKey = <T>(obj: T, k: string | number | symbol): k is keyof T =>
	k in Object(obj);

/**
 * Возвращает `obj[k]` если `k` - свойство `obj`
 * Иначе выбрасывает исключение
 *
 * @param obj
 * @param key
 */
export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
	if (hasKey(obj, key)) { return obj[key]; }
	throw new Error(`Invalid object member "${String(key)}"`);
}
