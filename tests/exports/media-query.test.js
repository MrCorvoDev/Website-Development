//=======================================================================================================================================================================================================================================================
import _mediaQuery from "../../src/js/exports/media-query.js";
import {setMedia} from "mock-match-media";
//=======================================================================================================================================================================================================================================================
describe("Тестирование _mediaQuery", () => {
   afterEach(() => setMedia({width: "1440px", height: "810px", }));
   describe("list", () => {
      test("MQL на md3 без аргументов", () => expect(JSON.stringify(_mediaQuery.list())).toEqual(JSON.stringify(matchMedia("(max-width: 48rem)"))));
      test("MQL на md4", () => expect(JSON.stringify(_mediaQuery.list("md4"))).toEqual(JSON.stringify(matchMedia("(max-width: 30rem)"))));
      test("MQL на 500", () => expect(JSON.stringify(_mediaQuery.list(500))).toEqual(JSON.stringify(matchMedia("(max-width: 31.25rem)"))));
      test("MQL на md3 min", () => expect(JSON.stringify(_mediaQuery.list("md3", "min"))).toEqual(JSON.stringify(matchMedia("(min-width: 48.0625rem)"))));
      test("MQL на md3 min height", () => expect(JSON.stringify(_mediaQuery.list("md3", "min", false))).toEqual(JSON.stringify(matchMedia("(min-height: 48.0625rem)"))));
   });
   describe("handler", () => {
      let matchCalls, mismatchCalls, result;
      const fn = function (MediaQueryList, a, b) { // Тестовая функция для проверки не совпадений, совпадений и результат(правильной передачи аргументов)
         MediaQueryList.matches ? matchCalls++ : mismatchCalls++;

         result = a + b;
      };

      beforeEach(() => {
         matchCalls = 0;
         mismatchCalls = 0;
         result = undefined;
      });

      test("2 не совпадение, 1 совпадение и верный результат", () => {
         _mediaQuery.handler(fn, [19, 14]);
         setMedia({width: "768px"});
         setMedia({width: "1000px"});

         expect(matchCalls).toBe(1);
         expect(mismatchCalls).toBe(2);
         expect(result).toBe(33);
      });
      test("min-height 1 не совпадение, 2 совпадение", () => {
         _mediaQuery.handler(fn, [], [500, "min", false]);
         setMedia({height: "400px"});
         setMedia({height: "600px"});

         expect(matchCalls).toBe(2);
         expect(mismatchCalls).toBe(1);
      });
      test("Не совпадение без прослушки событий", () => {
         _mediaQuery.handler(fn, [], ["md3"], false);

         expect(matchCalls).toBe(0);
         expect(mismatchCalls).toBe(1);
      });
      test("Совпадение без прослушки событий", () => {
         _mediaQuery.handler(fn, [], ["md2", "min"], false);

         expect(matchCalls).toBe(1);
         expect(mismatchCalls).toBe(0);
      });
   });
});
//=======================================================================================================================================================================================================================================================