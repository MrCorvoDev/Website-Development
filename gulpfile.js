//=======================================================================================================================================================================================================================================================
import dotenv from "dotenv";
dotenv.config();
//=======================================================================================================================================================================================================================================================
import gulp from "gulp";
import path from "./gulp/config/path.js";
import nodePath from "path";
import {deleteSync} from "del";
//=======================================================================================================================================================================================================================================================
import createServer from "./gulp/tasks/server.js";
import uploadToServer from "./gulp/tasks/ftp.js";
import compileHTML from "./gulp/tasks/html.js";
import compileSCSS from "./gulp/tasks/scss.js";
import compileJS from "./gulp/tasks/js.js";
import compileImages from "./gulp/tasks/images.js";
import generateFavicon from "./gulp/tasks/favicon.js";
import clearCompiledFiles from "./gulp/tasks/clean.js";
//=======================================================================================================================================================================================================================================================
/**
 * Слежка за файлами
 * @param {string} watchPath Путь для слежки
 * @param {Function} fn Задача
 * @param {string} srcPath Путь к файлам от src
 * @param {string} distPath Путь к файлам от dist
 * @param {string} ext Расширение dist файлов
 */
const watch = (watchPath, fn, srcPath = "", distPath = "", ext = "") => {
   gulp.watch(watchPath, fn).on("unlink", filepath => {
      const obj = nodePath.parse(filepath);
      filepath = nodePath.resolve(obj.root, obj.dir, obj.name + (ext || obj.ext));

      const srcFilePath = nodePath.relative(nodePath.resolve(path.srcF, srcPath), filepath);
      const destFilePath = nodePath.resolve(path.distF, distPath, srcFilePath);
      deleteSync(destFilePath);
   });
};
/** Наблюдать */
function watcher() {
   watch(path.watch.html, compileHTML, "html");
   watch(path.watch.scss, compileSCSS, "scss", "css", ".css");
   watch(path.watch.js, compileJS);
   watch(path.watch.img, compileImages);
}
//=======================================================================================================================================================================================================================================================
/** Основные задачи(Компилировать) */
const mainTasks = gulp.parallel(compileHTML, compileSCSS, compileJS, compileImages);
/** Одноразовые задачи */
const oneTimeTasks = generateFavicon;
//=======================================================================================================================================================================================================================================================
/** Продолжать разработку */
const devMode = gulp.parallel(watcher, createServer);
/** Продолжать разработку после компиляции */
const devInitMode = gulp.series(mainTasks, devMode);
/** Инициализировать разработку (Компилировать все что требуется для разработки) */
const initDevelopment = gulp.series(gulp.parallel(gulp.series(generateFavicon, compileHTML), compileSCSS, compileJS, compileImages), devMode);
/** Полностью компилировать в режиме производство */
const buildInitMode = gulp.parallel(gulp.series(generateFavicon, compileHTML), compileSCSS, compileJS, compileImages);
/** Запустить сервер для производства */
const buildServerMode = gulp.parallel(watcher, createServer);
//=======================================================================================================================================================================================================================================================
export {devMode, devInitMode, initDevelopment, mainTasks, buildInitMode, buildServerMode, uploadToServer, clearCompiledFiles, oneTimeTasks};
//=======================================================================================================================================================================================================================================================