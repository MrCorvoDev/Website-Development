//=======================================================================================================================================================================================================================================================
/**
 * * Создает функционал rating
 * При отправке добавляется .js_s-send-rating
 * ! Если имеет класс js_o-rating-edit тогда rating только можно изменять. Также нужно добавить `rating items`
 * Поддержка AJAX
 * HTML Структура:
 * ---> Нельзя менять: .js_e-rating>(ELEMENT>ELEMENT+ACTIVE_RATING)+VALUE_ELEMENT
 * ---> Можно менять: .js_e-rating.js_o-rating-edit>(ELEMENT>ELEMENT+ACTIVE_RATING+RATING_ITEMS>input[type="radio"])+VALUE_ELEMENT
 */
//=======================================================================================================================================================================================================================================================
import _dom from "../../../exports/dom.js";
import {debounce} from "../../../exports/lodash.js";
//=======================================================================================================================================================================================================================================================
const isFeatEdit = true;
//=======================================================================================================================================================================================================================================================
/**
 * Класс представляющий Rating
 * @class
 */
class Rating {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.rating.";
   /** Объект с полными названиями событий */
   static events = {
      onChange: this.#eventPrefix + "onChange",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `Rating` */
      onChange: new Event(this.events.onChange, {bubbles: true, cancelable: true}),
   };
   static #wasInit;
   static #initialize() {
      if (this.#wasInit) return;
      this.#wasInit = true;

      debounce("mouseup", 250, async e => await this.#setOnEvent(e), true);
      debounce("keyup", 250, async e => e.code === "Space" && await this.#setOnEvent(e), true);
   }
   /**
    * Установка rating при событии
    * @async
    * @param {Event} e Событие
    */
   static async #setOnEvent(e) {
      const input = e.target.closest(".js_e-rating input");
      if (!input) return;

      const rating = input.parentElement.parentElement.parentElement;
      if (!_dom.el.has("rating-edit", rating, 3)) return;

      await rating._app_.rating.setRatingValue(input.value, rating);
   }
   /**
    * Запуск rating
    */
   #init() {
      this.#updateActive();
      if (isFeatEdit && _dom.el.has("rating-edit", this.el, 3)) {
         this.el.addEventListener("mouseover", e => this.setActive(e)); // Вход мыши в звезды
         this.el.addEventListener("focusin", e => this.setActive(e)); // Вход мыши в звезды
         this.el.addEventListener("mouseout", e => this.#updateActive(e)); // Выход мыши с звезды
         this.el.addEventListener("focusout", e => this.#updateActive(e)); // Выход мыши с звезды
      }
   }
   /**
    * Установка ширины
    * @param {(Event|boolean)} [e=false] Событие (для делегации) [false]
    * @param {string} i Индекс\Значение Звезды
    */
   #updateActive(e = false, i = this.valueEl.innerHTML) {
      if (e && !e.target.closest(".js_e-rating input")) return;

      this.activeEl.style.width = `${i / 0.05}%`;
   }
   /**
    * Установить `active` ровняющейся input
    * @param {Event} e Событие
    */
   setActive(e) {
      const ratingItem = e.target.closest(".js_e-rating input");
      if (!ratingItem) return;

      this.#updateActive(false, ratingItem.value);
   }
   /**
    * Отправка
    * @async
    * @param {string} value Значение
    */
   async setRatingValue(value) {
      if (_dom.el.has("send-rating", this.el)) return;

      _dom.el.add("send-rating", this.el);

      const {default: alertify} = await import(/* webpackPrefetch: true */ "alertifyjs");

      try {
         const response = process.env.NODE_ENV !== "production" ? {ok: true, json: () => ({newRating: value})} : await fetch("rating.json", {method: "GET", body: JSON.stringify({userRating: value}), headers: {"content-type": "application/json"}});
         if (response.ok) {
            const result = await response.json();
            this.valueEl.innerHTML = result.newRating; // Установка нового значения
            this.#updateActive();
            this.el.dispatchEvent(Rating.#events.onChange);
            alertify.notify("Sending is successful", "success");
         } else alertify.notify("Sending is failed", "error");
      } catch (error) {
         alertify.notify("Sending is failed", "error");
      }

      _dom.el.del("send-rating", this.el);
   }
   /**
    * Создает Элемент `Rating`
    * @param {Element} el Элемент `Rating`
    * @property {Element} el Элемент `Rating`
    * @property {Element} activeEl Элемент `activeEl Rating`
    * @property {Element} valueEl Элемент `valueEl Rating`
    */
   constructor(el) {
      el._app_ ??= {};
      el._app_.rating = this;

      this.el = el;
      this.activeEl = el.firstElementChild.firstElementChild.nextElementSibling;
      this.valueEl = el.lastElementChild;
      this.#init();

      if (isFeatEdit) Rating.#initialize();
   }
}
//=======================================================================================================================================================================================================================================================
const elements = [..._dom.get.all("rating")];
elements.forEach(element => new Rating(element));
//=======================================================================================================================================================================================================================================================