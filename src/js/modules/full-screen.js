//=======================================================================================================================================================================================================================================================
/**
 * * Устанавливает высоту блокам относительно высоты экрана(VH)
 * Скрипт создает CSS переменную с высотой и именем указанным в [data-vh="NAME"]
 * Группа по-умолчанию: vh (Ровняется 100vh (Если шапка фиксированная тогда 100vh - {@link _header.sh}))
 * `Вычитаемая высота` Принимающие значения(можно совмещать знаком "&"):
 * ---> "px: `значение в пикселях`": Будет преобразовано в rem
 * ---> "headerH": Ровняется {@link _header.h}
 * ---> "headerSH": Ровняется {@link _header.sh}
 * ---> "`css selector`": Получает высоту элемента
 * HTML Структура:
 * ---> По Умолчанию: .js_e-vh
 * ---> Доп. Настройки: .js_e-vh[data-vh="NAME,VH,MINUS_HEIGHT"]
 */
//=======================================================================================================================================================================================================================================================
import {debounce} from "../exports/lodash.js";
import _header from "../exports/header.js";
import _number from "../exports/number.js";
import _dom from "../exports/dom.js";
import _is from "../exports/is.js";
//=======================================================================================================================================================================================================================================================
const isFeatResizeWithAddressBar = false;
/**
 * Класс представляющий FullScreen
 * @class
 */
class FullScreen {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.fullScreen.";
   /** Объект с полными названиями событий */
   static events = {
      onChange: this.#eventPrefix + "onChange",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /**
       * Вызывается после любого изменения в `FullScreen`
       * @param {object} [detail={}] Объект для event.detail [{}]
       */
      onChange: (detail = {}) => new CustomEvent(FullScreen.events.onChange, {bubbles: true, cancelable: true, detail}),
   };
   /** Уникальные ID групп */
   static #groups = [];
   /** Найденные элементы */
   static #foundedSelectors = {};
   /**
    * Получить высоту селекторов
    * @param {string} selectorsString Строка с селекторами
    * @returns {number} Высота Селекторов
    */
   static #getSelectorsHeight(selectorsString) {
      const selectors = selectorsString.split("&"); // Получения массива с селекторами

      return selectors.reduce((height, unformattedSelector) => {
         const selector = unformattedSelector.trim();
         const isSpecial = keyword => selector.indexOf(keyword) !== -1;

         // Получение пикселей которые будут переведены в REM
         if (isSpecial("px:")) return height += _number.keepRem(+selector.match(/\d+/)[0]);

         // Высота header
         if (isSpecial("headerH")) return height += _header.h;

         // Высота header в форме sticky
         if (isSpecial("headerSH")) return height += _header.sh;

         // Высота элемента DOM
         this.#foundedSelectors[selector] ??= _dom.get.one(selector, 4);
         return height += this.#foundedSelectors[selector].offsetHeight;
      }, 0);
   }
   /**
    * Применения новой группы (создание CSS переменной)
    * @param {string|undefined} [name] Имя группы (Если undefined - название переменной --vh)
    * @param {string|undefined} [selectors] Селекторы отнимаемой высоты
    * @param {number} [dataVh=100] Высота[100]
    */
   static applyNewGroup(name, selectors, dataVh = 100) {
      debounce("resize", _is.touch ? 50 : 250, (function fn() {
         const selectorsHeight = selectors ? FullScreen.#getSelectorsHeight(selectors) : 0;
         const value = Math.max(_number.round(((dataVh * innerHeight) / 100) - selectorsHeight), 0);

         document.body.style.setProperty(`--vh${name ? "-" + name : ""}`, `${value}px`);
         dispatchEvent(FullScreen.#events.onChange({name, selectors, dataVh}));

         return fn;
      }()), {defaultResize: isFeatResizeWithAddressBar});
   }
   /**
    * Создает Элемент `FullScreen` с настройками
    * @param {Element} el Элемент `FullScreen`
    * @property {Element} el - Элемент `FullScreen`
    */
   constructor(el) {
      el._app_ ??= {};
      el._app_.fullScreen = this;

      this.el = el;
      const attribute = _dom.el.attr.get("vh", el); // Получение настроек
      const groupID = attribute.replace(/ /g, "");

      if (FullScreen.#groups.indexOf(groupID) === -1) { // Проверка на уникальность настройки
         const [group, dataVh, selectors] = attribute.split(",");

         FullScreen.#groups.push(groupID); // Добавление в массив
         FullScreen.applyNewGroup(group.trim(), selectors?.trim(), dataVh?.trim()); // Установка переменных для элементов с настройками
      }
   }
}
//=======================================================================================================================================================================================================================================================
// Установка CSS переменной для обычных элементов с 100vh
if (_header.isLP) FullScreen.applyNewGroup(undefined, "headerSH"); // Если у header есть пространство тогда CSS переменная должна учитывать его
else FullScreen.applyNewGroup(); // Установка CSS переменной без учета пространство header

const vhElements = _dom.get.all("vh", 2); // Элементы с настройками
vhElements.forEach(element => new FullScreen(element));
//=======================================================================================================================================================================================================================================================