//=======================================================================================================================================================================================================================================================
const content = document.body.querySelector(".content");
const header = document.body.querySelector(".header");

let module;
/**
 * Создать форму
 * @param {string} attributes Атрибуты для формы
 * @param {string} body Тело формы
 */
const createForm = (attributes, body) => `<form action="send.php" enctype="multipart/form-data" method="post" ${attributes}>${body}</form>`;
/**
 * Создать Input
 * @param {string} [attributes=""] Атрибуты Input
 * @param {string} [type=text] Тип Input
 */
const createInput = (attributes = "", type = "text") => `<input type="${type}" ${attributes}/>`;
/**
 * Вставить `HTML` в content
 * @param {string} HTML Который будет вставлен в content
 * @returns {(HTMLCollection|Element)} (Если форма одна возвращается она, если нет возвращается массив)
 */
const init = HTML => {
   content.innerHTML = HTML;
   _scrollTo = require("../../../src/js/exports/scroll-to.js");
   module = require("../../../src/js/modules/form/submit.js");
   if (module.__get__("isFeat").datepicker) require("../../../src/js/modules/form/components/datepicker.js");
   if (module.__get__("isFeat").intlPhone) require("../../../src/js/modules/form/components/international-telephone.js");
   if (module.__get__("isFeat").file) require("../../../src/js/modules/form/components/upload-image.js");
   if (module.__get__("isFeat").select) require("../../../src/js/modules/form/components/select.js");
   if (module.__get__("isFeat").range) require("../../../src/js/modules/form/components/range.js");

   return content.children.length > 1 ? content.children : content.firstElementChild;
};
/**
 * Отправлять form
 * @param {HTMLFormElement} form Формы
 * @returns {object} Объект данными формы и _isSended со значением отправлено или нет
 */
const sendForm = async form => {
   require("../../../src/js/modules/form/placeholder.js");

   window.fetch = jest.fn(() => window.Promise.resolve({ok: true})); // Имитация fetch
   await window.eventListenersList["submit"][0]({target: form, preventDefault: () => {}}); // Отправка

   const isSended = fetch.mock.calls.length === 1;

   const formData = {};
   if (isSended) {
      const receivedFormData = fetch.mock.lastCall[1].body;
      for (const el of receivedFormData.entries()) formData[el[0]] = el[1];
   }

   await window.Promise.resolve();
   await window.Promise.resolve();
   await window.Promise.resolve();

   return {...formData, _isSended: isSended};
};
/**
 * Проверить что форма отправлена
 * @param {HTMLFormElement} form Форма
 * @param {object} data Данные формы
 */
const isFormSended = (form, data) => {
   expect(data._isSended).toBeTruthy();
   expect(form.classList.contains("js_s-send")).toBeFalsy();
};
/**
 * Проверить что форма не отправлена
 * @param {HTMLFormElement} form Форма
 * @param {object} data Данные формы
 */
const isNotFormSended = (form, data) => {
   expect(data._isSended).toBeFalsy();
   expect(form.classList.contains("js_s-send")).toBeFalsy();
};

let _scrollTo;
init(createForm());

jest.mock("gsap");
jest.mock("../../../src/js/exports/scroll-to.js", () => jest.fn(jest.requireActual("../../../src/js/exports/scroll-to.js").default));
if (require("../../../src/js/modules/form/submit.js").__get__("isFeat").autosize) jest.mock("autosize", () => ({update: jest.fn(jest.requireActual("autosize").update)}));
if (header) require("../../../src/js/modules/menu/burger.js");

describe("Тестирование submit", () => {
   beforeEach(() => {
      jest.resetModules();
      window.removeEventListeners();
   });

   describe("Отправка", () => {
      test("Простейшая отправка формы", async () => {
         const alertify = require("alertifyjs");
         const form = init(createForm("", ""));
         const data = await sendForm(form);

         isFormSended(form, data);
         expect(alertify.notify.mock.calls.at(-1)).toEqual(["Sending is successful", "success"]);
      });
      test("Не отправляется если сейчас в процессе", async () => {
         const form = init(createForm("class=\"js_s-send\"", ""));
         const data = await sendForm(form);

         expect(data._isSended).toBeFalsy();
         expect(form.classList.contains("js_s-send")).toBeTruthy();
      });
      test("Не отправилось на сервер", async () => {
         const alertify = require("alertifyjs");
         const form = init(createForm("", ""));

         window.fetch = jest.fn(() => window.Promise.resolve({ok: false})); // Имитация fetch
         await window.eventListenersList["submit"][0]({target: form, preventDefault: () => {}}); // Отправка

         await window.Promise.resolve();
         await window.Promise.resolve();
         await window.Promise.resolve();

         expect(alertify.notify.mock.calls.at(-1)).toEqual(["Sending is failed", "error"]);
         expect(form.classList.contains("js_s-send")).toBeFalsy();
      });
      if (module.__get__("isFeat").nextLocation) test("Переход на другую локацию после отправки", async () => {
         const form = init(createForm("data-submit-location=\"#sended\"", ""));
         const data = await sendForm(form);

         isFormSended(form, data);
         expect(location.hash).toBe("#sended");
      });
      if (module.__get__("isFeat").inputMove) test("Перемещение данных в другую форму", async () => {
         const forms = init(
            createForm("",
               createInput("name=\"parcel-sender\" data-move-value=\"plankton, parcel\" value=\"The Krabby Patty secret formula\"") +
               createInput("name=\"message-sender\" data-move-value=\"MIB, message\" value=\"Here is your new Neuralyzer\"")
            ) +
            createForm("id=\"plankton\"", createInput("name=\"parcel\"")) +
            createForm("id=\"MIB\"", createInput("name=\"message\""))
         );
         const data = await sendForm(forms[0]);

         isFormSended(forms[0], data);
         expect(data["parcel-sender"]).toBe("The Krabby Patty secret formula");
         expect(data["message-sender"]).toBe("Here is your new Neuralyzer");
         expect(forms[1].firstElementChild.value).toBe("The Krabby Patty secret formula");
         expect(forms[2].firstElementChild.value).toBe("Here is your new Neuralyzer");
      });
   });
   describe("Валидация", () => {
      test("Input", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input js_e-req\"")));
         isNotFormSended(form, await sendForm(form));

         form.elements[0].value = "Kevin Ball";
         isFormSended(form, await sendForm(form));
      });
      test("Placeholder", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input js_e-req\" data-placeholder=\"Name\"")));
         isNotFormSended(form, await sendForm(form));

         form.elements[0].value = "Frank Gallagher";
         isFormSended(form, await sendForm(form));
      });
      if (module.__get__("isFeat").reqGroups) test("reqGroups", async () => {
         const form = init(createForm("",
            createInput("class=\"js_e-input js_e-req\" data-req=\"reqGroup\"") +
            createInput("class=\"js_e-input js_e-req\" data-req=\"reqGroup\"") +
            createInput("class=\"js_e-input js_e-req\"")
         ));
         isNotFormSended(form, await sendForm(form));

         form.elements[1].value = "Rock Of Ages";
         isNotFormSended(form, await sendForm(form));

         form.elements[2].value = "Kevin Ball";
         isFormSended(form, await sendForm(form));
      });
      if (module.__get__("isFeat").email) test("Email", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input js_e-req\" data-type=\"email\"")));
         isNotFormSended(form, await sendForm(form));

         form.elements[0].value = "info@MIB.org";
         isFormSended(form, await sendForm(form));
      });
      if (module.__get__("isFeat").checkbox) test("Checkbox", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input js_e-req\" ", "checkbox")));
         isNotFormSended(form, await sendForm(form));

         form.elements[0].checked = true;
         isFormSended(form, await sendForm(form));
      });
      if (module.__get__("isFeat").confirmInput) test("Подтверждение input", async () => {
         const form = init(createForm("",
            createInput("class=\"js_e-input js_e-req\" data-confirm-input=\"#confirm\"") +
            createInput("class=\"js_e-input js_e-req\" id=\"confirm\"")
         ));
         form.elements[0].value = "Elliot Alderson";
         isNotFormSended(form, await sendForm(form));

         form.elements[1].value = "Another Elliot Alderson";
         isNotFormSended(form, await sendForm(form));

         form.elements[1].value = "Elliot Alderson";
         isFormSended(form, await sendForm(form));
      });
      if (module.__get__("isFeat").intlPhone) test("International phone", async () => {
         const mockJsonFetch = jest.fn().mockReturnValueOnce({country: "GB"});
         const mockValidFn = jest.fn().mockReturnValueOnce(true);
         const mockNumberFn = jest.fn().mockReturnValueOnce("+457400123456");
         window.fetch = jest.fn(() => window.Promise.resolve({ok: true, json: mockJsonFetch})); // Имитация fetch
         const form = init(createForm("", createInput("name=\"intl-tel\" class=\"js_e-input js_e-req js_e-intl-tel\"")));

         await window.Promise.resolve();
         await window.Promise.resolve();

         isNotFormSended(form, await sendForm(form));

         form.elements[0].value = "7400123456";
         form.elements[0]._app_.intlTel.instance.isValidNumber = mockValidFn;
         form.elements[0]._app_.intlTel.instance.getNumber = mockNumberFn;
         const data = await sendForm(form);

         expect(data["intl-tel"]).toBe("+457400123456");
         isFormSended(form, data);
      });
      if (module.__get__("isFeat").imask) test("Imask", async () => {
         const form = init(createForm("", createInput("name=\"imask\" class=\"js_e-input js_e-req js_e-imask\" data-imask=\"phone\"")));
         form.elements[0].inputmask = {isComplete: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)};
         isNotFormSended(form, await sendForm(form));

         form.elements[0].value = "+45 7400 123456";
         isFormSended(form, await sendForm(form));
      });
      if (module.__get__("isFeat").select) test("Select", async () => {
         const form = init(createForm("", "<div><select name=\"select\" class=\"js_e-req\"><option value=\"\"></option><option value=\"1\"></option></select></div>"));

         isNotFormSended(form, await sendForm(form));
         form.elements[0].parentElement.classList.contains("js_s-invalid");

         form.elements[0].value = "1";
         isFormSended(form, await sendForm(form));
      });
      test("Прокрутка если элемента не видно хотя бы на 50%", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input js_e-req\" style=\"height: 100px;width: 1440px;top: 760px;\"")));
         let data = await sendForm(form);
         const callTimes = _scrollTo.mock.calls.length;

         expect(_scrollTo).toHaveBeenLastCalledWith(form.elements[0]);
         isNotFormSended(form, data);

         form.elements[0].style.top = "759px";
         data = await sendForm(form);

         expect(_scrollTo).toHaveBeenCalledTimes(callTimes);
         isNotFormSended(form, data);

         form.elements[0].value = "Lana Banana";
         isFormSended(form, await sendForm(form));
      });
   });
   describe("Очистка формы", () => {
      test("Нативная реализация", async () => {
         const form = init(createForm("", createInput()));
         form.elements[0].value = "RAM SRT10";
         await sendForm(form);

         expect(form.elements[0].value).toBe("");
      });
      test("Input", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input\" data-placeholder=\"Name\"")));
         form.elements[0].classList.add("js_s-focus");
         form.elements[0].value = "RAM SRT10";
         await sendForm(form);

         expect(form.elements[0].classList.contains("js_s-focus")).toBeFalsy();
         expect(form.elements[0].value).toBe("Name");
      });
      if (module.__get__("isFeat").file) test("Загрузка файла с превью", async () => {
         const form = init(createForm("", "<div><div><input accept=\".jpg,.png,.gif\" class=\"js_e-upload-img\" type=\"file\" name=\"file\"><div><span>Upload</span></div></div><div class=\"file__preview\"><img src=\"preview.jpg\" alt=\"\"></div></div>"));
         await sendForm(form);

         expect(form.elements[0].parentElement.nextElementSibling.innerHTML).toBe("");
      });
      if (module.__get__("isFeat").range) test("noUiSlider Range", async () => {
         const form = init(createForm("", "<div data-range=\"0,1000,100\" id=\"js_e-rng\"><div><input type=\"number\" name=\"rangeFrom\" value=\"0\" class=\"js_e-rng-from\"> <input type=\"number\" name=\"rangeTo\" value=\"1000\" class=\"js_e-rng-to\"></div><div></div></div>"));
         const mockFn = jest.fn();
         form.elements[0].parentElement.parentElement._app_.range.reset = mockFn;
         await sendForm(form);

         expect(mockFn).toHaveBeenCalled();
      });
      if (module.__get__("isFeat").datepicker) test("Datepicker", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input js_s-invalid js_e-datepicker\" data-placeholder=\"Date\"")));
         const mockFn = jest.fn(form.elements[0]._app_.datePicker.clear);
         form.elements[0]._app_.datePicker.clear = mockFn;
         form.elements[0].value = "20.02.2002";
         await sendForm(form);

         expect(mockFn).toHaveBeenCalled();
         expect(form.elements[0].value).toBe("Date");
      });
      if (module.__get__("isFeat").datepicker) test("Datepicker Range", async () => {
         const form = init(createForm("",
            "<div class='js_e-datepicker' data-datepicker='range'>" +
            createInput("class=\"js_e-input js_s-invalid js_e-datepicker\" data-placeholder=\"Date\" data-datepicker=\"item\"") +
            createInput("class=\"js_e-input js_s-invalid js_e-datepicker\" data-placeholder=\"Date\" data-datepicker=\"item\"") +
            "</div>"
         ));
         const inputs = form.querySelectorAll("input");
         const mockFn = jest.fn(inputs[0].parentElement._app_.datePicker.clear);
         inputs[0].parentElement._app_.datePicker.clear = mockFn;
         inputs[0].value = "9999.99.99";
         inputs[1].value = "9999.99.90";
         await sendForm(form);

         expect(mockFn).toHaveBeenCalled();
         expect(inputs[0].value).toBe("Date");
         expect(inputs[1].value).toBe("Date");
      });
      if (module.__get__("isFeat").password) test("Password", async () => {
         const form = init(createForm("", createInput("class=\"js_e-input\" data-type=\"pass\" data-placeholder=\"Name\"")));
         form.elements[0].setAttribute("type", "password");
         form.elements[0].value = "123456";
         await sendForm(form);

         expect(form.elements[0].value).toBe("Name");
         expect(form.elements[0].getAttribute("type")).toBe("text");
      });
      if (module.__get__("isFeat").select) test("Select", async () => {
         const form = init(createForm("", "<select name=\"sel\" data-modifier=\"form\" data-default-value=\"Val-1\" style=\"display:none\"><option value=\"Val-1\">Red</option><option value=\"Val-2\">Brown</option><option value=\"Val-3\">Black</option><option value=\"Val-4\">White</option></select>"));
         const select = form.firstElementChild;
         await sendForm(form);

         expect(select.lastElementChild.firstElementChild.firstElementChild.firstElementChild.innerHTML).toBe("Red");
         expect(select.lastElementChild.lastElementChild.innerHTML).toBe("<button type=\"button\" data-option=\"Val-1\" class=\"select__option js_e-sel-opt\" style=\"display: none;\">Red</button><button type=\"button\" data-option=\"Val-2\" class=\"select__option js_e-sel-opt\">Brown</button><button type=\"button\" data-option=\"Val-3\" class=\"select__option js_e-sel-opt\">Black</button><button type=\"button\" data-option=\"Val-4\" class=\"select__option js_e-sel-opt\">White</button>");
      });
      if (module.__get__("isFeat").selectSearch) test("Select Search", async () => {
         const form = init(createForm("", "<select name=\"sel\" class=\"js_o-sel-search\" data-modifier=\"form\" data-default-value=\"Val-1\" style=\"display:none\"><option value=\"Val-1\">Red</option><option value=\"Val-2\">Brown</option><option value=\"Val-3\">Black</option><option value=\"Val-4\">White</option></select>"));
         const select = form.firstElementChild;
         await sendForm(form);

         expect(select.lastElementChild.firstElementChild.firstElementChild.innerHTML).toBe("<input type=\"text\" name=\"form[sel-inp]\" value=\"Red\" class=\"select__input js_e-sel-input\">");
         expect(select.lastElementChild.lastElementChild.innerHTML).toBe("<button type=\"button\" data-option=\"Val-1\" class=\"select__option js_e-sel-opt\">Red</button><button type=\"button\" data-option=\"Val-2\" class=\"select__option js_e-sel-opt\">Brown</button><button type=\"button\" data-option=\"Val-3\" class=\"select__option js_e-sel-opt\">Black</button><button type=\"button\" data-option=\"Val-4\" class=\"select__option js_e-sel-opt\">White</button>");
      });
      if (module.__get__("isFeat").autosize) test("Autosize Textarea", async () => {
         const autosize = require("autosize");
         const form = init(createForm("", "<textarea name=\"message\" data-placeholder=\"Your message\" class=\"js_e-input js_e-req js_e-autosize\"></textarea>"));
         form.elements[0].value = "I'll be back..";
         await sendForm(form);

         await window.Promise.resolve();

         expect(autosize.update).toHaveBeenCalled();
         expect(form.elements[0].value).toBe("Your message");
      });
   });
});
//=======================================================================================================================================================================================================================================================