//=======================================================================================================================================================================================================================================================
import debounceFunction from "lodash/debounce.js";
import throttleFunction from "lodash/throttle.js";
import _is from "./is.js";
//=======================================================================================================================================================================================================================================================
const isFeatDoNotResizeWithAddressBar = true;
//=======================================================================================================================================================================================================================================================
/**
 * Создает обработчик `debounceFunction` событий. Подробнее про {@link debounceFunction}
 * @param {string} eventType Тип События
 * @param {number} wait Задержка в миллисекундах
 * @param {Function} func Функция
 * @param {(object|boolean)} options Объект параметров. Если установлен true тогда object = {leading: true, trailing: false}
 * @param {boolean|number} [options.leading=false] Запускать ли `func` в начале `wait`.
 * @param {boolean|number} [options.defaultResize=false] Слушать resize по умолчанию(Не игнорировать скрытие address bar)[false].
 * @param {number} [options.maxWait] Максимальное время функции до того как будет вызвана.
 * @param {boolean|number} [options.trailing=true]  Запускать ли `func` в конце `wait`.
 * @param {Element} element Элемент на кого вешать событие
 * @returns {Function} debounced Функция
 */
export function debounce(eventType, wait, func, options = {}, element) {
   if (eventType === "resize") {
      const originalFunction = func;
      let lastHeight = innerHeight;
      func = () => {
         if (!options.defaultResize && isFeatDoNotResizeWithAddressBar && _is.touch) {
            const difference = Math.abs(lastHeight - innerHeight);
            const offset = lastHeight / 3;
            lastHeight = innerHeight;

            if (difference !== 0 && difference <= offset) return;
         }

         originalFunction();
      };
   }

   if (typeof options !== "object" && options) options = {leading: true, trailing: false};

   const debounced = debounceFunction(func, wait, options);

   if (element) element.addEventListener(eventType, debounced);
   else addEventListener(eventType, debounced);

   return debounced;
}
//=======================================================================================================================================================================================================================================================
/**
 * Создает обработчик `throttleFunction` событий. Подробнее про {@link throttleFunction}
 * @param {string} eventType Тип События
 * @param {number} wait Задержка в миллисекундах
 * @param {Function} func Функция
 * @param {(object|boolean)} options Объект параметров.
 * @param {boolean|number} [options.leading=false] Запускать ли `func` в начале `wait`.
 * @param {boolean|number} [options.defaultResize=false] Слушать resize по умолчанию(Не игнорировать скрытие address bar)[false].
 * @param {boolean|number} [options.trailing=true] Запускать ли `func` в конце `wait`.
 * @param {Element} element Элемент на кого вешать событие
 * @returns {Function} throttled Функция
 */
export function throttle(eventType, wait, func, options = {}, element) {
   if (eventType === "resize") {
      const originalFunction = func;
      let lastHeight = innerHeight;
      func = () => {
         if (!options.defaultResize && isFeatDoNotResizeWithAddressBar && _is.touch) {
            const difference = Math.abs(lastHeight - innerHeight);
            const offset = lastHeight / 3;
            lastHeight = innerHeight;

            if (difference !== 0 && difference <= offset) return;
         }

         originalFunction();
      };
   }

   const throttled = throttleFunction(func, wait, options);

   if (element) element.addEventListener(eventType, throttled);
   else addEventListener(eventType, throttled);

   return throttled;
}
//=======================================================================================================================================================================================================================================================
export {debounceFunction, throttleFunction};
//=======================================================================================================================================================================================================================================================