//=======================================================================================================================================================================================================================================================
/**
 * * Создает функционал menu(burger)
 * При открытии добавляется .js_s-act-menu
 * Также элемент для закрытия меню: .js_e-menu-close
 * HTML Структура: #js_e-header>*>MENU>.js_e-burger
 */
//=======================================================================================================================================================================================================================================================
import {debounce} from "../../exports/lodash.js";
import _header from "../../exports/header.js";
import _is from "../../exports/is.js";
import _lock from "../../exports/lock.js";
import _dom from "../../exports/dom.js";
import _mediaQuery from "../../exports/media-query.js";
//=======================================================================================================================================================================================================================================================
const debug = false && process.env.NODE_ENV === "development";
/**
 * Класс представляющий Menu
 * @class
 */
class Menu {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.menu.";
   /** Объект с полными названиями событий */
   static events = {
      onToggle: this.#eventPrefix + "onToggle",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `Menu` */
      onToggle: new Event(this.events.onToggle, {bubbles: true, cancelable: true}),
   };
   /**
    * Управлять событием клик
    * @param {Event} e Event
    */
   #handleClick(e) {
      if (!e.target.closest(".js_e-menu-close, .js_e-burger")) return;

      this.toggle();

      if (debug) console.log("Toggle menu", e.type);
   }
   /**
    * Закрыть при медиа запросе
    * @param {MediaQueryList} md MediaQueryList
    */
   #closeOnMediaQuery(md) {
      if (md.matches || !_is.hide(this.burger) || !this.is) return;

      this.toggle();

      if (debug) console.log("Closing menu");
   }
   /**
    * Управлять событие focus out
    * @param {Event} e Event
    */
   #handleFocusOut(e) {
      if (_is.hide(this.burger) || !this.is) return;

      if (!e.target.closest("#js_e-header")) return; // Если шапка теряет фокус продолжить
      if (!e.relatedTarget) return; // Если фокус получает нечего остановить
      if (e.relatedTarget?.closest("#js_e-header")) return; // Если фокус получает другой элемент на странице продолжить

      this.toggle();

      if (debug) console.log("Closing menu", e.type);
   }
   /** Открыть\Закрыть меню */
   toggle() {
      if (_lock.is) return;

      _lock.toggle(500);
      this.is = _dom.el.tgl("act-menu", _header.menu);
      this.el.dispatchEvent(Menu.#events.onToggle);
   }
   /**
    * Создает Элемент `Menu`
    * @param {Element} el Элемент `Menu`
    * @property {Element} el Элемент `Menu`
    * @property {boolean} is Открыт? `Menu`
    * @property {Element} burger Элемент `Menu Burger`
    */
   constructor(el) {
      el._app_ ??= {};
      el._app_.menu = this;

      this.el = el;
      this.is = false;
      this.burger = _header.menuBD.previousElementSibling;

      debounce("click", 500, e => this.#handleClick(e), true);
      addEventListener("focusout", e => this.#handleFocusOut(e));
      _mediaQuery.handler(md => this.#closeOnMediaQuery(md));
   }
}
//=======================================================================================================================================================================================================================================================
new Menu(_header.menu);
//=======================================================================================================================================================================================================================================================