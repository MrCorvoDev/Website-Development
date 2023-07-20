//=======================================================================================================================================================================================================================================================
import _handleCache from "./cache.js";
//=======================================================================================================================================================================================================================================================
/**
 * Повторять строку
 * @param {string} string Строка для повторения
 * @param {number} number Итерация
 * @returns {string} Повторенная строка
 */
export default function _repeatString(string, number) {
   return _handleCache("repeatStr", (string, number) => {
      let newString = "";
      while (number-- > 0) newString += string;
      return newString;
   }, arguments);
}
//=======================================================================================================================================================================================================================================================