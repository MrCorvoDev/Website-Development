//=======================================================================================================================================================================================================================================================
/**
 * * Добавляет класс при прокручивании(вверх и вниз(больше чем высота шапки))
 * Доступ к экземпляру element._app_.sticky
 * При форме sticky к body добавляется .js_s-sticky
 */
//=======================================================================================================================================================================================================================================================
import {throttle} from "../exports/lodash.js";
import _header from "../exports/header.js";
import _dom from "../exports/dom.js";
//=======================================================================================================================================================================================================================================================
/**
 * Класс представляющий `Sticky`
 * @class
 */
class Sticky {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.sticky.";
   /** Объект с полными названиями событий */
   static events = {
      onChange: this.#eventPrefix + "onChange",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `Sticky` */
      onChange: new Event(this.events.onChange, {bubbles: true, cancelable: true}),
   };
   /** Функция обрабатывающая прокрутку */
   #handleFunction;
   /** Throttled Функция обрабатывающая прокрутку */
   #throttledFunction;
   /** Новое положения прокрутки на момент тика throttle */
   #newScroll = scrollY;
   /** Последнее положения прокрутки на момент тика throttle */
   #lastScroll;
   /** Флаг, указывающий, является ли статус header sticky сейчас */
   is;
   /** Обрабатывает ли прокрутку */
   isProcessing;
   /** Поменять статус на sticky */
   makeSticky() {
      _dom.el.add("sticky");
      this.is = true;
      dispatchEvent(Sticky.#events.onChange);
   }
   /** Поменять статус на non-sticky */
   makeNonSticky() {
      _dom.el.del("sticky");
      this.is = false;
      dispatchEvent(Sticky.#events.onChange);
   }
   /** Инициирует обработку прокрутки */
   init() {
      this.isProcessing = true;
      this.#throttledFunction = throttle("scroll", 500, this.#handleFunction);
   }
   /** Разрушает обработку прокрутки */
   destroy() {
      this.isProcessing = false;
      removeEventListener("scroll", this.#throttledFunction);
      this.#throttledFunction.cancel();
   }
   /** Создает `Sticky` */
   constructor() {
      _header.self._app_ ??= {};
      _header.self._app_.sticky = this;

      this.#handleFunction = () => {
         this.#lastScroll = scrollY;

         if (this.#newScroll < this.#lastScroll && scrollY > _header.h) this.makeSticky(); // При прокрутке вниз и если прокручено больше чем высота шапки
         else this.makeNonSticky(); // При прокрутке вверх

         this.#newScroll = this.#lastScroll;
      };
      this.init();
   }
}
//=======================================================================================================================================================================================================================================================
new Sticky();
//=======================================================================================================================================================================================================================================================