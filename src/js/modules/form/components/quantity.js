//=======================================================================================================================================================================================================================================================
/**
 * * Создает функционал quantity
 * HTML Структура: BLOCK>.js_e-quant[data-quant="+"]+input+.js_e-quant[data-quant="-"]
 */
//=======================================================================================================================================================================================================================================================
import _dom from "../../../exports/dom.js";
import {debounce} from "../../../exports/lodash.js";
//=======================================================================================================================================================================================================================================================
/**
 * Класс представляющий Quantity
 * @class
 */
class Quantity {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.quantity.";
   /** Объект с полными названиями событий */
   static events = {
      onChange: this.#eventPrefix + "onChange",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `Quantity` */
      onChange: new Event(this.events.onChange, {bubbles: true, cancelable: true}),
   };
   /** Флаг, указывающий, был ли инициирован */
   static #wasInit;
   /** Инициировать */
   static #init() {
      if (this.#wasInit) return;
      this.#wasInit = true;

      debounce("click", 150, e => {
         const button = e.target.closest(".js_e-quant");
         if (!button) return;

         const quantity = button.parentElement._app_.quantity;
         const isIncrease = _dom.el.attr.get("quant", button) === "+";

         isIncrease ? quantity.increase() : quantity.decrease();
      }, true);
   }
   /** Увеличить */
   decrease() {
      if (+this.input.value === 1) return;

      this.input.value = --this.input.value;
      this.el.dispatchEvent(Quantity.#events.onChange);
   }
   /** Уменьшить */
   increase() {
      this.input.value = ++this.input.value;
      this.el.dispatchEvent(Quantity.#events.onChange);
   }
   /**
    * Создает Элемент `Quantity`
    * @param {Element} el Элемент `Quantity`
    * @property {Element} plusButton Элемент `Plus Button Quantity`
    * @property {Element} input Элемент `Input Quantity`
    * @property {Element} minusButton Элемент `Minus Button Quantity`
    */
   constructor(el) {
      el._app_ ??= {};
      el._app_.quantity = this;

      this.el = el;
      this.plusButton = el.children[0];
      this.input = el.children[1];
      this.minusButton = el.children[2];

      Quantity.#init();
   }
}
//=======================================================================================================================================================================================================================================================
const elements = [..._dom.get.all("[data-quant='+']", 3)];
elements.forEach(element => new Quantity(element.parentElement));
//=======================================================================================================================================================================================================================================================