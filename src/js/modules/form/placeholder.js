//=======================================================================================================================================================================================================================================================
/**
 * * Установка "true placeholder"
 * Поддерживает Клавиатуру
 * HTML Структура:
 * ---> Функционал ввода формы(фокус и т.д. (ОБЯЗАТЕЛЕН)): .js_e-input
 * ---> placeholder: [data-placeholder]
 * ---> Пароль(требует выключения): [data-type=pass]
 * ---> Выбор даты: input.js_e-datepicker
 */
//=======================================================================================================================================================================================================================================================
import _dom from "../../exports/dom.js";
import _form from "../../exports/form.js";
//=======================================================================================================================================================================================================================================================
const isFeat = {
   datepicker: true,
   password: true,
};
/**
 * Класс представляющий Input
 * @class
 */
class Input {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.input.";
   /** Объект с полными названиями событий */
   static events = {
      onTogglePlaceholder: this.#eventPrefix + "onTogglePlaceholder",
      onTogglePassword: this.#eventPrefix + "onTogglePassword",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `Input` */
      onTogglePlaceholder: new Event(this.events.onTogglePlaceholder, {bubbles: true, cancelable: true}),
      onTogglePassword: new Event(this.events.onTogglePassword, {bubbles: true, cancelable: true}),
   };
   /** Флаг, указывающий, был ли инициирован */
   static #wasInit;
   /** Инициировать */
   static #init() {
      if (this.#wasInit) return;
      this.#wasInit = true;

      addEventListener("focusin", e => {
         const input = e.target.closest(".js_e-input");
         if (!input) return;

         const local = input._app_.input;

         _form.foc.add(input);
         _form.err.remove(input);
         if (isFeat.datepicker && input._app_.datePicker) _form.err.remove(input._app_.datePicker.getSiblingInput(input));

         if (!local.placeholder) return;

         local.togglePassword();
         local.togglePlaceholder();
      });
      addEventListener("focusout", e => {
         const input = e.target.closest(".js_e-input");
         if (!input) return;

         const local = input._app_.input;

         _form.foc.remove(input);

         if (!local.placeholder || input.value) return;

         local.togglePlaceholder();
         if (isFeat.datepicker && input._app_.datePicker) input._app_.datePicker.getSiblingInput(input)._app_.input.togglePlaceholder(true);
         local.togglePassword();
      });
   }
   /**
    * Переключить placeholder
    * @param {boolean} applyCondition Условие [если значение пустое и есть placeholder]
    * @param {boolean} loseCondition Условие [если значение равно placeholder]
    */
   togglePlaceholder(applyCondition = !this.el.value && this.placeholder, loseCondition = this.el.value === this.placeholder) {
      if (applyCondition) this.el.value = this.placeholder; // Установка placeholder
      else if (loseCondition) this.el.value = "";

      this.el.dispatchEvent(Input.#events.onTogglePlaceholder);
   }
   /**
    * Переключить password
    * @param {boolean} condition Условие [если тип password]
    */
   togglePassword(condition = this.el.getAttribute("type") === "password") {
      if (!isFeat.password || !this.isPassword) return;
      if (condition) this.el.setAttribute("type", "text");
      else this.el.setAttribute("type", "password");

      this.el.dispatchEvent(Input.#events.onTogglePassword);
   }
   /**
    * Создает Элемент `Input`
    * @param {Element} el Элемент `Input`
    * @property {Element} el Элемент `Input`
    * @property {boolean} isPassword Флаг, указывающий, это Password
    * @property {string} placeholder `Placeholder`
    */
   constructor(el) {
      el._app_ ??= {};
      el._app_.input = this;

      this.el = el;
      this.isPassword = _dom.el.attr.get("type", this.el) === "pass";
      this.placeholder = _dom.el.attr.get("placeholder", el);
      this.togglePlaceholder();

      Input.#init();
   }
}
//=======================================================================================================================================================================================================================================================
const elements = [..._dom.get.all("input")];
elements.forEach(element => new Input(element));
//=======================================================================================================================================================================================================================================================