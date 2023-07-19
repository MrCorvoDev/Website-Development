//=======================================================================================================================================================================================================================================================
import _dom from "./dom.js";
//=======================================================================================================================================================================================================================================================
/**
 * Управление блокировки прокрутки
 * @namespace
 * @property {boolean} is {@link _lock.is} Блокируется ли сейчас прокрутка основного контента
 * @property {boolean} isLocked {@link _lock.isLocked} Заблокирована ли прокрутка основного контента
 * @property {Function} remove {@link _lock.remove} Удалить блокировку
 * @property {Function} add {@link _lock.add} Добавить блокировку
 * @property {Function} toggle {@link _lock.toggle} Удалить/Добавить блокировку
 */
const _lock = {};
/**
 * Блокируется ли сейчас прокрутка основного контента
 * @type {boolean}
 */
_lock.is = false;
/**
 * Заблокирована ли прокрутка основного контента
 * @type {boolean}
 */
_lock.isLocked = false;
/**
 * Удалить блокировку прокрутки основного контента
 * @param {number} delay Задержка
 */
_lock.remove = function (delay) {
   if (!_lock.isLocked || _lock.is) return;

   document.body.style.setProperty("--lp", 0);
   _dom.el.del("lock");
   _lock.isLocked = false;

   _lock.is = true;
   setTimeout(() => _lock.is = false, delay);
};
/**
 * Добавить блокировку прокрутки основного контента
 * @param {number} delay Задержка
 */
_lock.add = function (delay) {
   if (_lock.isLocked || _lock.is) return;

   document.body.style.setProperty("--lp", innerWidth - document.body.offsetWidth + "px");
   _dom.el.add("lock");
   _lock.isLocked = true;

   _lock.is = true;
   setTimeout(() => _lock.is = false, delay);
};
/**
 * Удалить/Добавить блокировку прокрутки основного контента
 * (Проверяет есть ли блокировка и вызывает подфункции)
 * @param {number} delay Задержка
 */
_lock.toggle = delay => (_lock.isLocked) ? _lock.remove(delay) : _lock.add(delay);
//=======================================================================================================================================================================================================================================================
export default _lock;
//=======================================================================================================================================================================================================================================================