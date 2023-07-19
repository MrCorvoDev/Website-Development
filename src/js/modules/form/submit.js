//=======================================================================================================================================================================================================================================================
/**
 * * Правильно отправляет форму(с валидацией и последующей очисткой)
 * ! Дополнительные функции требуют включения
 * Поддерживает AJAX
 * При валидации если найден элемент с ошибкой валидации то окно прокрутит к нему если его не видно хотя бы на 50%
 * При отправке формы добавляется .js_s-send
 * Если отправке была успешная или нет показывается уведомление
 * HTML Структура:
 * ---> Форма: form[action method]
 * ------> Локация после отправки(опционально): [data-submit-location] (требует включения)
 * ---> Элементы валидации: .js_e-req
 *
 * Дополнительный функционал:
 * ---> Выборочно обязательный input: [data-req="GROUP NAME"]
 * ---> Перемещение данных в другую форму: [data-move-value="FORM'S_ID, ELEMENT'S_NAME_ATTRIBUTE"]
 * ---> Проверка email: [data-type="email"]
 * ---> Пароль: [data-type="pass"]
 * ---> Подтверждения input: [data-confirm-input="SELECTOR_OF_THE_TEST_ELEMENT(MAIN_ELEMENT)"]
 * ---> Checkbox: input[type="checkbox"]
 * ---> Интернациональный телефон: input.js_e-intl-tel
 * ---> Маски на ввод: input.js_e-imask[data-imask="TYPE"]
 * ---> Загрузка изображения: js_e-upload-img
 * ---> Range: #js_e-rng
 * ---> Выбор даты: input.js_e-datepicker
 * ---> Autosize Textarea: .js_e-autosize
 * ---> Select: select[data-modifier=MODIFIER]>option
 */
//=======================================================================================================================================================================================================================================================
import _is from "../../exports/is.js";
import _scrollTo from "../../exports/scroll-to.js";
import _form from "../../exports/form.js";
import _dom from "../../exports/dom.js";
//=======================================================================================================================================================================================================================================================
const isFeat = {
   intlPhone: true,
   inputMove: true,
   nextLocation: true,
   reqGroups: true,
   email: true,
   checkbox: true,
   confirmInput: true,
   imask: true,
   file: true,
   range: true,
   datepicker: true,
   autosize: true,
   password: true,
   select: true,
   selectSearch: true,
};
const debug = false && process.env.NODE_ENV === "development";
/**
 * Класс представляющий Form
 * @class
 */
class Form {
   /** Префикс для имени события */
   static #eventPrefix = "_app_.form.";
   /** Объект с полными названиями событий */
   static events = {
      onInvalid: this.#eventPrefix + "onInvalid",
      onSuccess: this.#eventPrefix + "onSuccess",
      onFail: this.#eventPrefix + "onFail",
   };
   /** Объект с экземплярами событий */
   static #events = {
      /** Вызывается после любого изменения в `Form` */
      onInvalid: new Event(this.events.onInvalid, {bubbles: true, cancelable: true}),
      onSuccess: new Event(this.events.onSuccess, {bubbles: true, cancelable: true}),
      onFail: new Event(this.events.onFail, {bubbles: true, cancelable: true}),
   };
   /** Флаг, указывающий, был ли инициирован */
   static #wasInit;
   /** Инициировать */
   static #init() {
      if (this.#wasInit) return;
      this.#wasInit = true;

      addEventListener("submit", e => {
         e.preventDefault();

         e.target?._app_?.form?.submit?.();
      });
   }
   /**
    * Отправить форму
    * @async
    */
   async submit() {
      if (_dom.el.has("send", this.el)) return;

      const [isValid, sendData] = await this.validate(this.el);
      if (!isValid) return this.el.dispatchEvent(Form.#events.onInvalid);

      const data = new FormData(this.el);

      if (isFeat.intlPhone && sendData.intlPhone) sendData.intlPhone.forEach(element => {
         const name = element.getAttribute("name");
         const realValue = element._app_.intlTel.instance.getNumber();

         data.set(name, realValue);
      });
      if (isFeat.inputMove && sendData.inputMove) {
         const formsObject = {};
         sendData.inputMove.forEach(item => {
            if (!formsObject[item.id]) forms.forEach(form => formsObject[form.id] ??= form);

            const targetForm = formsObject[item.id];
            const targetInput = [...targetForm.elements].find(element => element.getAttribute("name") === item.name);

            targetInput.value = item.value;
         });
      }

      if (debug) for (const el of data.entries()) console.log(el[0], el[1]);

      _dom.el.add("send", this.el);


      try {
         const response = this.action === "#" ? {ok: true} : (await fetch(this.action, {method: this.method, body: data})); // Отправка
         const {default: alertify} = await import(/* webpackPrefetch: true */ "alertifyjs");
         if (response.ok) { // Проверить что форма отправилась успешно
            await this.clear(this.el);
            if (this.nextLocation) location.assign(this.nextLocation);
            else alertify.notify("Sending is successful", "success");
            this.el.dispatchEvent(Form.#events.onSuccess);
         } else {
            alertify.notify("Sending is failed", "error");
            this.el.dispatchEvent(Form.#events.onFail);
         }
      } catch (error) {
         const {default: alertify} = await import(/* webpackPrefetch: true */ "alertifyjs");
         alertify.notify("Sending is failed", "error");
         this.el.dispatchEvent(Form.#events.onFail);
      }

      _dom.el.del("send", this.el);
   }
   /**
    * Проверка на валидность элементов формы
    * @async
    * @returns {boolean} Результат
    */
   async validate() {
      const sendData = {};
      let isValid = true;
      const reqGroups = {}; // Группы выборочных требуемых элементов
      let isReqGroupsValid; // Есть ли валидный элемент в группах(Нужно для избежания ненужных циклов)
      let reqGroupErrorTarget; // Цель ошибки(Для установки верной цели)
      let errorTarget;

      const elements = this.elements;
      elements.forEach(element => {
         if (_dom.el.has("req", element, 1)) {
            const isElementValid = this.validateElement(element);

            if (isFeat.reqGroups && _dom.el.has("req", element, 4)) {
               const group = _dom.el.attr.get("req", element); // Имя группы

               isReqGroupsValid ||= isElementValid; // В Req Groups есть валидный элемент

               reqGroups[group] ??= {is: isElementValid, items: []};
               reqGroups[group].is ||= isElementValid;
               reqGroups[group].items.push(element);

               if (isValid && !isElementValid && !errorTarget) { // Получить первый элемент который не прошел проверку
                  errorTarget = element;
                  reqGroupErrorTarget = element; // Установить как первый Req Group элемент который невалиден
               }
            } else {
               isValid = isValid && isElementValid; // Установить статус формы
               if (!isValid && (!errorTarget || _dom.el.has("req", errorTarget, 4))) errorTarget = element; // Получить первый элемент который не прошел проверку или перезаписать Req Group элемент(потому что не известно, возможно он валиден)
            }
         }
         if (isFeat.intlPhone && _dom.el.has("intl-tel", element, 1)) {
            sendData.intlPhone ??= [];
            sendData.intlPhone.push(element);
         }
         if (isFeat.inputMove && _dom.el.has("move-value", element, 4)) {
            sendData.inputMove ??= [];
            const [id, name] = _dom.el.attr.get("move-value", element).split(",").map(e => e.trim());

            sendData.inputMove.push({id, name, value: element.value});
         }
      });

      if (isFeat.reqGroups) {
         if (isReqGroupsValid === false) isValid = false; // Установить статус формы
         const reqGroupNames = reqGroups && Object.keys(reqGroups); // Создание массива имен групп
         reqGroupNames.forEach?.(name => {
            const isGroupValid = reqGroups[name].is; // Валидна ли группа
            const groupElements = reqGroups[name].items; // Элементы группы

            if (isGroupValid) groupElements.forEach(element => _form.err.remove(element)); // Если валидная то удалить состояние ошибки
            else { // Если не валидна
               isValid = false; // Установить статус формы
               if (reqGroupErrorTarget && _dom.el.attr.get("req", reqGroupErrorTarget) === name) errorTarget = reqGroupErrorTarget; // Восстановить цель ошибки если до этого она была Req Group Элементов
            }
         });
      }

      if (!isValid && !_is.seen(errorTarget, 50)) await _scrollTo(errorTarget); // Прокрутить до элемента который не прошел проверку

      return [isValid, sendData];
   }
   /**
    * Проверить элемента
    * @param {Element} input Элемент формы
    * @returns {boolean} Валидный ли
    */
   validateElement(input) { // Проверить элемента
      if (
         (isFeat.email && _dom.el.attr.get("type", input) === "email" && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,8})+$/.test(input.value)) ||
         (isFeat.checkbox && input.getAttribute("type") === "checkbox" && !input.checked) ||
         (isFeat.confirmInput && _dom.el.has("confirm-input", input, 4) && (_dom.get.one(_dom.el.attr.get("confirm-input", input), 4, input.closest("form")).value !== input.value)) ||
         (isFeat.imask && _dom.el.has("imask", input, 1) && !input.inputmask.isComplete()) ||
         (isFeat.intlPhone && _dom.el.has("intl-tel", input, 1) && !input._app_.intlTel.instance.isValidNumber()) ||
         (isFeat.select && input.tagName === "SELECT" && !input.value && !_form.err.add(input.parentElement)) ||
         (!input.value || input.value === input?._app_?.input?.placeholder)
      ) {
         _form.err.add(input);
         return false;
      }

      _form.err.remove(input);
      return true;
   }
   /**
    * Очистка формы
    * @async
    */
   async clear() {
      this.el.reset(); // Нативная функция очистки

      const elements = this.elements;
      elements.forEach(async element => {
         const type = element.getAttribute("type");

         if (isFeat.file && type === "file" && _dom.el.has("upload-img", element, 1)) element._app_.uploadImage.clear();
         if (isFeat.range && _dom.el.has("rng-from", element, 1)) element.parentElement.parentElement._app_.range.reset();
         if (isFeat.datepicker && _dom.el.has("datepicker", element, 1)) element._app_.datePicker.clear();
         if (isFeat.autosize && _dom.el.has("autosize", element, 1)) {
            const {default: autosize} = await import(/* webpackPrefetch: true */ "autosize");
            autosize.update(element);
         }

         if (_dom.el.has("input", element, 1)) {
            _form.foc.remove(element);

            if (element._app_.input.placeholder) {
               element._app_.input.togglePlaceholder(true);

               if (isFeat.datepicker && element._app_.input.isDatePicker) element._app_.datePicker.getSiblingInput(element)._app_.input.togglePlaceholder(true);
               if (isFeat.password && type === "password") element._app_.input.togglePassword(true);
            }
         }
      });

      if (isFeat.select) {
         const selects = [..._dom.get.all("sel", 1, this.el)];
         selects.forEach(select => select._app_.select.clear());
      }
   }
   /**
    * Создает Элемент `Form`
    * @param {Element} el Элемент `Form`
    * @property {Element} el Элемент `Form`
    * @property {string} nextLocation URL для перенаправления `Form`
    * @property {string} action Атрибут Action `Form`
    * @property {string} method Метод отправки `Form`
    * @property {Array} elements Элементы `Form`
    */
   constructor(el) {
      el._app_ ??= {};
      el._app_.form = this;

      this.el = el;
      this.nextLocation = isFeat.nextLocation && _dom.el.attr.get("submit-location", this.el); // Путь который будет открыт после отправки формы
      this.action = this.el.getAttribute("action");
      this.method = this.el.getAttribute("method");
      this.elements = [...el.elements];

      Form.#init();
   }
}
//=======================================================================================================================================================================================================================================================
const forms = [...document.forms];
forms.forEach(element => new Form(element));
//=======================================================================================================================================================================================================================================================