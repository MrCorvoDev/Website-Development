//=======================================================================================================================================================================================================================================================
const content = document.body.querySelector(".content");
const module = require("../../../../src/js/modules/form/components/rating.js");

let elementEventListeners = [];
HTMLElement.prototype.addEventListenerBase = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.addEventListener = function (type, listener) { // Поддельная функция прослушки событий
   elementEventListeners[type] ??= [];
   elementEventListeners[type].push([this, listener]);
   this.addEventListenerBase(type, listener);
};
/** Удаляет все прослушки событий с элементов */
const removeElementEventListeners = () => {
   const eventTypes = Object.keys(elementEventListeners); // Создание массива из типов события
   eventTypes.forEach(eventType => {
      elementEventListeners[eventType].forEach(item => item[0].removeEventListener(eventType, item[1]));
   });
   elementEventListeners = [];
};

/**
 * Создать Rating
 * @param {boolean} isReadonly Создать Rating только для чтения
 * @returns {Object<Element>} Объект с элементами Rating
 */
const init = isReadonly => {
   if (isReadonly) content.innerHTML = "<div class=\"js_e-rating\"><div><span>★★★★★</span><span>★★★★★</span></div><div>2.8</div></div>";
   else content.innerHTML = "<div class=\"js_e-rating js_o-rating-edit\"><div><span>★★★★★</span><span>★★★★★</span><div><input type=\"radio\" value=\"1\" name=\"rating\"> <input type=\"radio\" value=\"2\" name=\"rating\"> <input type=\"radio\" value=\"3\" name=\"rating\"> <input type=\"radio\" value=\"4\" name=\"rating\"> <input type=\"radio\" value=\"5\" name=\"rating\"></div></div><div>3.8</div></div>";

   require("../../../../src/js/modules/form/components/rating.js");

   const obj = {};
   obj.block = content.firstElementChild;
   obj.body = obj.block.firstElementChild;
   obj.active = obj.body.firstElementChild.nextElementSibling;
   obj.valueEl = obj.block.lastElementChild;
   if (!isReadonly) {
      obj.inputsBody = obj.body.lastElementChild;
      obj.inputs = obj.inputsBody.children;
   }

   return obj;
};
/**
 * Установить Rating
 * @async
 * @param {type} type Тип события
 * @param {object} eventObject Объект который передаются как аргумент для функции
 * @param {object} receivedObject Объект который возвращается в ответ серверу
 */
const setRating = async (type, eventObject, receivedObject) => {
   window.fetch = jest.fn(() => window.Promise.resolve({ok: true, json: () => (receivedObject)})); // Имитация fetch
   process.env.NODE_ENV = "production";
   await window.eventListenersList[type][0](eventObject);
};
/**
 * Rating установился
 * @param {Element} rating Rating
 * @param {number} value Значение Rating
 * @param {string} width Процент ширины
 */
const ratingHasBeenSet = (rating, value, width) => {
   expect(rating.valueEl.innerHTML).toBe(`${value}`);
   expect(rating.active.style.width).toBe(width);
   expect(rating.block.classList.contains("js_s-send-rating")).toBeFalsy();
};
/**
 * Rating просматривается
 * @param {Element} rating Rating
 * @param {Array} events События вход-выход
 * @param {Array} values Значение вход-выход
 * @param {Array} indexArray Индекс input вход-выход
 */
const isRatingPreviewing = (rating, events, values, indexArray) => {
   elementEventListeners[events[0]][0][1]({target: rating.inputs[indexArray[0]]});
   expect(rating.active.style.width).toBe(values[0]);

   elementEventListeners[events[1]][0][1]({target: rating.inputs[indexArray[1]]});
   expect(rating.active.style.width).toBe(values[1]);
};
/**
 * Есть ли эти событий
 * @param {Array} events События
 */
const areThereEvents = events => {
   events.forEach(event => expect(elementEventListeners[event]).toBeTruthy());
};
/**
 * Нет ли этих событий
 * @param {Array} events События
 */
const areThereNoEvents = events => {
   events.forEach(event => expect(elementEventListeners[event]).toBeFalsy());
};

describe("Тестирование rating", () => {
   beforeEach(() => {
      jest.resetModules();
      removeElementEventListeners();
      window.removeEventListeners();
   });

   test("Инициализация Readonly Rating", () => {
      const rating = init(true);

      expect(rating.active.style.width).toBe("55.99999999999999%");
      areThereNoEvents(["mouseover", "mouseout", "focusin", "focusout"]);
   });
   if (module.__get__("isFeatEdit")) {
      test("Инициализация Rating", () => {
         const rating = init();

         expect(rating.active.style.width).toBe("75.99999999999999%");
         areThereEvents(["mouseover", "mouseout", "focusin", "focusout"]);
      });
      describe("Превью rating", () => {
         test("Mouse", () => {
            const rating = init();

            isRatingPreviewing(rating, ["mouseover", "mouseout"], ["80%", "75.99999999999999%"], [3, 3]);
         });
         test("Keyboard", () => {
            const rating = init();

            isRatingPreviewing(rating, ["focusin", "focusout"], ["60%", "75.99999999999999%"], [2, 3]);
         });
      });
      describe("Установка rating", () => {
         test("Не устанавливается если уже в процессе", async () => {
            const rating = init();

            rating.block.classList.add("js_s-send-rating");
            await setRating("mouseup", {target: rating.inputs[3]}, {newRating: 4.1});

            expect(rating.valueEl.innerHTML).toBe("3.8");
            expect(rating.active.style.width).toBe("75.99999999999999%");
            expect(rating.block.classList.contains("js_s-send-rating")).toBeTruthy();
         });
         test("Отправка в Dev Mode", async () => {
            const alertify = require("alertifyjs");
            const rating = init();

            process.env.NODE_ENV = "development";
            await window.eventListenersList["mouseup"][0]({target: rating.inputs[2]});

            ratingHasBeenSet(rating, 3, "60%");
            expect(alertify.notify.mock.calls.at(-1)).toEqual(["Sending is successful", "success"]);
         });
         test("Отправка не увенчалась успехом", async () => {
            const alertify = require("alertifyjs");
            const rating = init();

            window.fetch = jest.fn(() => window.Promise.resolve({ok: false})); // Имитация fetch
            process.env.NODE_ENV = "production";
            await window.eventListenersList["mouseup"][0]({target: rating.inputs[2]});

            expect(alertify.notify.mock.calls.at(-1)).toEqual(["Sending is failed", "error"]);
         });
         test("Mouse", async () => {
            const alertify = require("alertifyjs");
            const rating = init();
            await setRating("mouseup", {target: rating.inputs[2]}, {newRating: 3.4});

            ratingHasBeenSet(rating, 3.4, "68%");
            expect(alertify.notify.mock.calls.at(-1)).toEqual(["Sending is successful", "success"]);
         });
         test("Keyboard", async () => {
            const alertify = require("alertifyjs");
            const rating = init();
            await setRating("keyup", {target: rating.inputs[1], code: "Space"}, {newRating: 1.9});

            ratingHasBeenSet(rating, 1.9, "37.99999999999999%");
            expect(alertify.notify.mock.calls.at(-1)).toEqual(["Sending is successful", "success"]);
         });
      });
   }
});
//=======================================================================================================================================================================================================================================================