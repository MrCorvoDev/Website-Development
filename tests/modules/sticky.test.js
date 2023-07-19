//=======================================================================================================================================================================================================================================================
import _header from "../../src/js/exports/header.js";
import "../../src/js/modules/sticky.js";
//=======================================================================================================================================================================================================================================================
/* global scrollY:writable */
/**
 * Вызвать событие scroll на позиции `y`
 * @param {number} y Число прокрученных пикселей
 */
const scrollOn = y => {
   scrollY = y;
   dispatchEvent(new Event("scroll"));
};
let sticky;

/** Проверить что шапка sticky */
const isHeaderSticky = () => expect(document.body.classList.contains("js_s-sticky")).toBeTruthy();
/** Проверить не что шапка sticky */
const isNotHeaderSticky = () => expect(document.body.classList.contains("js_s-sticky")).toBeFalsy();

describe("Тестирование sticky", () => {
   beforeEach(() => {
      scrollY = 0;
      sticky = _header.self._app_.sticky;
   });

   test("Шапка меняет форму только после того как окно прокрутило больше ее высоты", () => {
      const originalClasses = document.body.classList.value;

      scrollOn(window.g.HEIGHT_HEADER.PC - 1);
      expect(document.body.classList.value).toBe(originalClasses); // Шапка в обычном положении
      expect(sticky.is).toBeFalsy();

      scrollOn(window.g.HEIGHT_HEADER.PC + 1);
      expect(document.body.classList.value).not.toBe(originalClasses); // Шапка в положении sticky
      expect(sticky.is).toBeTruthy();
   });
   describe("Переключение формы", () => {
      test("Форма меняется на Sticky", () => {
         scrollOn(window.g.HEIGHT_HEADER.PC * 10);

         isHeaderSticky();
         expect(sticky.is).toBeTruthy();
      });
      test("Форма возвращается на обычную", () => {
         scrollOn(window.g.HEIGHT_HEADER.PC * 10);
         scrollOn(window.g.HEIGHT_HEADER.PC * 5);

         isNotHeaderSticky();
         expect(sticky.is).toBeFalsy();
      });
   });
   describe("Установка статуса по методу", () => {
      test("Форма меняется на Sticky", () => {
         sticky.makeSticky();

         isHeaderSticky();
         expect(sticky.is).toBeTruthy();
      });
      test("Форма возвращается на обычную", () => {
         sticky.makeNonSticky();

         isNotHeaderSticky();
         expect(sticky.is).toBeFalsy();
      });
   });
   test("Destroy and Init Sticky", () => {
      sticky.destroy();
      expect(sticky.isProcessing).toBeFalsy();

      sticky.makeNonSticky();
      scrollOn(window.g.HEIGHT_HEADER.PC * 10);
      isNotHeaderSticky();
      scrollOn(window.g.HEIGHT_HEADER.PC * 5);
      isNotHeaderSticky();

      sticky.makeSticky();
      scrollOn(window.g.HEIGHT_HEADER.PC * 10);
      isHeaderSticky();
      scrollOn(window.g.HEIGHT_HEADER.PC * 5);
      isHeaderSticky();


      sticky.init();
      expect(sticky.isProcessing).toBeTruthy();

      scrollOn(window.g.HEIGHT_HEADER.PC * 10);
      isHeaderSticky();
      scrollOn(window.g.HEIGHT_HEADER.PC * 5);
      isNotHeaderSticky();
   });
   test("Событие onChange", () => {
      const mockFn = jest.fn();
      addEventListener(_header.self._app_.sticky.constructor.events.onChange, mockFn);
      expect(mockFn).toHaveBeenCalledTimes(0);

      scrollOn(window.g.HEIGHT_HEADER.PC * 10);
      isHeaderSticky();
      expect(sticky.is).toBeTruthy();
      expect(mockFn).toHaveBeenCalledTimes(1);

      scrollOn(window.g.HEIGHT_HEADER.PC * 5);

      isNotHeaderSticky();
      expect(sticky.is).toBeFalsy();
      expect(mockFn).toHaveBeenCalledTimes(2);
   });
});
//=======================================================================================================================================================================================================================================================