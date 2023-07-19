//=======================================================================================================================================================================================================================================================
import _handleCache from "./cache.js";
import _number from "./number.js";
//=======================================================================================================================================================================================================================================================
/**
 * Взаимодействие с медиа запросами
 * @namespace
 * @property {Function} md {@link _mediaQuery.md} Breakpoints
 * @property {Function} list {@link _mediaQuery.list} Создать Медиа Запрос
 * @property {Function} handler {@link _mediaQuery.handler} Обрабатывать Медиа Запрос
 */
const _mediaQuery = {};
/**
 * Breakpoints
 * @type {Array}
 */
_mediaQuery.md = [1440, 1270, 1024, 768, 480];
/**
 * Создать Медиа Запрос
 * @param {(number|string)} [value=md3] Значение срабатывания breakpoint (Можно указывать md1 - md4 как в SCSS) [md3]
 * @param {string} [type=max] Тип("max"|"min") ["max"]
 * @param {boolean} [isWidth=true] Breakpoint по ширине? [true]
 * @returns {MediaQueryList} Медиа Запрос
 */
_mediaQuery.list = function (value = "md3", type = "max", isWidth = true) {
   return _handleCache("mdLst", function (value = "md3", type = "max", isWidth = true) {
      if (typeof value === "string") value = _mediaQuery.md[value.slice(-1)]; // Если строка то взять значение из массива

      return matchMedia(`(${type}-${isWidth ? "width" : "height"}: ${_number.rem(value + (type === "max" ? 0 : 1))})`);
   }, arguments);
};
/**
 * Обрабатывать Медиа Запрос
 * @param {Function} func Функция для вызова
 * @param {Array} [functionArguments=[]] Массив с аргументами к `func`[[]]
 * @param {(Array|string)} [mediaQueryValue=[md3]] Массив с настройками к {@link _mediaQuery.list} или строка медиа запроса [["md3"]]
 * @param {boolean} [listener=true] Добавлять ли listener для события [true]
 */
_mediaQuery.handler = function (func, functionArguments = [], mediaQueryValue = ["md3"], listener = true) {
   const mediaQueryList = (Array.isArray(mediaQueryValue)) ? _mediaQuery.list.apply(null, mediaQueryValue) : matchMedia(mediaQueryValue); // Создать Медиа Запрос через встроенную функцию или нет
   const callFunction = () => func.apply(null, functionArguments); // Добавить аргументы к функции

   if (listener) mediaQueryList.addEventListener("change", callFunction);
   functionArguments.unshift(mediaQueryList); // Для ручного вызова первым аргументом поставить Медиа Запрос
   callFunction();
};
//=======================================================================================================================================================================================================================================================
export default _mediaQuery;
//=======================================================================================================================================================================================================================================================