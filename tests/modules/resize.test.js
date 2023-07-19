//=======================================================================================================================================================================================================================================================
import module from "../../src/js/modules/resize.js";
//=======================================================================================================================================================================================================================================================
jest.useFakeTimers();

describe("Тестирование resize", () => {
   test("Срабатывает при событии", () => {
      dispatchEvent(new Event("resize")); // Вызвать события
      expect(document._app_.resize.is).toBeTruthy();
      expect(document.body.classList.contains("js_s-resize")).toBeTruthy();
      jest.runAllTimers();
      expect(document._app_.resize.is).toBeFalsy();
      expect(document.body.classList.contains("js_s-resize")).toBeFalsy();
   });
   test("Событие onChange", () => {
      const mockFn = jest.fn();
      addEventListener(document._app_.resize.constructor.events.onChange, mockFn);
      expect(mockFn).toHaveBeenCalledTimes(0);
      dispatchEvent(new Event("resize")); // Вызвать события
      expect(mockFn).toHaveBeenCalledTimes(1);
      jest.runAllTimers();
      expect(mockFn).toHaveBeenCalledTimes(2);
   });
});
//=======================================================================================================================================================================================================================================================