//=======================================================================================================================================================================================================================================================
const content = document.body.querySelector(".content");
const header = document.getElementById("js_e-header");
let _is;

describe("Тестирование _is", () => {
   beforeEach(() => {
      jest.resetModules();
      window.removeEventListeners();

      if (header) require("../../src/js/modules/sticky.js");
      _is = require("../../src/js/exports/is.js").default;
   });
   describe("local", () => {
      content.innerHTML = "<a href='https://google.com'></a>";
      const notLocalLink = content.querySelector("a");

      content.innerHTML = "<a href='#block'></a>";
      const localLink = content.querySelector("a");

      test("'https://google.com' не ведет на текущую страницу", () => expect(_is.local("https://google.com")).toBeFalsy());
      test("'#block' ведет на текущую страницу", () => expect(_is.local("#block")).toBeTruthy());
      test("Элемент ссылки не ведет на текущую страницу", () => expect(_is.local(notLocalLink)).toBeFalsy());
      test("Элемент ссылки ведет на текущую страницу", () => expect(_is.local(localLink)).toBeTruthy());
   });
   describe("hide", () => {
      content.innerHTML = "<div></div>";
      const shownElement = content.querySelector("div");

      content.innerHTML = "<div style='display: none;'></div>";
      const hiddenElement = content.querySelector("div");

      test("Элемент показан", () => expect(_is.hide(shownElement)).toBeFalsy());
      test("Элемент скрыт", () => expect(_is.hide(hiddenElement)).toBeTruthy());
   });
   describe("range", () => {
      test("Числа 12, 16 имеют диапазон 5", () => expect(_is.range(12, 16)).toBeTruthy());
      test("Числа 38, 99 не имеют диапазон 27", () => expect(_is.range(38, 99, 27)).toBeFalsy());
   });
   describe("seen", () => {
      const HEIGHT = 100;
      content.innerHTML = `<div style='height: ${HEIGHT}px;width: ${window.g.SIZES[0]}px;'></div>`;
      const element = content.querySelector("div");

      test("Элемент виден хоть на 25%", () => {
         const result = window.g.SIZES[1] - (HEIGHT * 0.25);
         element.style.top = result - 1 + "px";
         expect(_is.seen(element, 25)).toBeTruthy();

         element.style.top = result + "px";
         expect(_is.seen(element, 25)).toBeFalsy();
      });
      if (header) {
         test("Элемент виден хоть на 25%(Простая шапка)", () => {
            header.classList.remove("js_e-lp");
            jest.resetModules();
            window.removeEventListeners();

            _is = require("../../src/js/exports/is.js").default;

            const result = -HEIGHT * 0.75;
            element.style.top = result + 1 + "px";
            expect(_is.seen(element, 25)).toBeTruthy();

            element.style.top = result + "px";
            expect(_is.seen(element, 25)).toBeFalsy();
            header.classList.add("js_e-lp");
         });
         test("Элемент виден хоть на 25%(Обычная шапка)", () => {
            const result = window.g.HEIGHT_HEADER.PC - HEIGHT * 0.75;
            element.style.top = result + 1 + "px";
            expect(_is.seen(element, 25)).toBeTruthy();

            element.style.top = result + "px";
            expect(_is.seen(element, 25)).toBeFalsy();
         });
         test("Элемент виден хоть на 25%(Sticky шапка)", () => {
            const result = window.g.HEIGHT_HEADER.StickyPC - HEIGHT * 0.75;
            header._app_.sticky.makeSticky();
            element.style.top = result + 1 + "px";
            expect(_is.seen(element, 25)).toBeTruthy();

            element.style.top = result + "px";
            expect(_is.seen(element, 25)).toBeFalsy();
         });
      }
   });
   test("Переменная touch не определена", () => expect(_is.touch).toBeUndefined());
});
//=======================================================================================================================================================================================================================================================