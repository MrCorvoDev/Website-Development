//=======================================================================================================================================================================================================================================================
/** Определяет тип устройства(сенсор или мышь) и добавляет соответствующий класс к body и определяет переменную */
//=======================================================================================================================================================================================================================================================
import _dom from "../exports/dom.js";
import _is from "../exports/is.js";
//=======================================================================================================================================================================================================================================================
/**
 * Класс представляющий DefineDevice
 * @class
 */
class DefineDevice {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.defineDevice.";
   /** Объект с полными названиями событий */
   static events = {
      onInit: this.#eventPrefix + "onInit",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `DefineDevice` */
      onInit: new Event(this.events.onInit, {bubbles: true, cancelable: true}),
   };
   #isMobile() {
      return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
   }
   #isBot() {
      return navigator.userAgent.match(/Googlebot|YandexBot|DuckDuckBot|Bingbot/i);
   }
   /**
    * Установить тип устройства
    * @param {string} type Тип устройства
    */
   #defineAs(type) {
      _dom.el.add(type);
      _is.touch = type === "touch";
      this.type = type;
      this.isTouch = type === "touch";
   }
   /**
    * Создает `DefineDevice`
    * @property {string} type - Тип `DefineDevice`
    * @property {boolean} isTouch - Это touch?
    */
   constructor() {
      document._app_ ??= {};
      document._app_.defineDevice = this;

      const mob = this.#isMobile(); // Вернется объект если найдено соответствие мобильного устройства
      (mob) ? this.#defineAs("touch") : this.#defineAs("mouse");

      // ! Новая реализация (На данный момент userAgentData работает не корректно)
      // if (navigator.userAgentData) { // Проверка поддерживается ли userAgentData
      //    (navigator.userAgentData.mobile) ? defineAs("touch") : defineAs("mouse");
      // } else {
      //    const mob = this.#isMobile(); // Вернется объект если найдено соответствие мобильного устройства
      //    (mob) ? defineAs("touch") : defineAs("mouse");
      // }

      this.isBot = this.#isBot(); // Вернется массив если найдено соответствие поискового бота

      dispatchEvent(DefineDevice.#events.onInit);
   }
}
//=======================================================================================================================================================================================================================================================
new DefineDevice();
//=======================================================================================================================================================================================================================================================